// Background service worker — makes YouTube API calls.
// YOUTUBE_API_KEY is loaded from config.js via importScripts.

importScripts('config.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchVideos') {
    handleFetchVideos(request.categoryId).then(videos => {
      sendResponse({ success: true, videos });
    }).catch(err => {
      console.error('API Pipeline Error:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // keep the message channel open for async response
  }
});

async function handleFetchVideos(categoryId) {
  // 1. Fetch from YouTube
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=${categoryId}&maxResults=15&regionCode=US&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("YouTube API failed");
  const data = await res.json();

  const englishVideos = (data.items || []).filter(item => {
    const lang = item.snippet.defaultAudioLanguage || item.snippet.defaultLanguage || 'en';
    return lang.toLowerCase().startsWith('en');
  });

  const videos = englishVideos.slice(0, 5).map(item => ({
    id: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    description: item.snippet.description
  }));

  // 2. Prepare Gemini Prompt with Tool definitions
  const promptText = "Write a catchy 1-sentence summary for each of these YouTube videos based on their descriptions. If a description is vague or short, use the fetch_video_comments tool to read comments and understand the context. Return ONLY a strict JSON array of strings in the exact same order. Do not include markdown blocks.\n\n" + JSON.stringify(videos.map(v => ({ id: v.id, title: v.title, desc: v.description })));

  const tools = [{
    functionDeclarations: [{
      name: "fetch_video_comments",
      description: "Get the top 3 comments for a video to understand community reaction.",
      parameters: {
        type: "OBJECT",
        properties: {
          videoId: { type: "STRING", description: "The YouTube Video ID" }
        },
        required: ["videoId"]
      }
    }]
  }];

  let conversationHistory = [
    { role: "user", parts: [{ text: promptText }] }
  ];

  // 3. Enter the Tool Calling Loop
  try {
    let finalJsonText = await runGeminiLoop(conversationHistory, tools);

    // Clean up markdown if Gemini wrapped the JSON
    let aiText = finalJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    const summaries = JSON.parse(aiText);

    videos.forEach((v, i) => v.aiSummary = summaries[i] || "No summary available.");
  } catch (e) {
    console.error("Gemini failed", e);
    videos.forEach(v => v.aiSummary = "Summary unavailable.");
  }

  return videos;
}

// Recursive function to handle an infinite number of tool call turns
async function runGeminiLoop(contents, tools) {
  const body = {
    contents: contents,
    tools: tools
  };

  console.log("📤 SENDING TO GEMINI:", body);

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  console.log("📥 RECEIVED FROM GEMINI:", data);

  const responseMessage = data.candidates[0].content;

  // Check if Gemini decided to call any functions
  const functionCalls = responseMessage.parts.filter(p => p.functionCall);

  if (functionCalls.length > 0) {
    console.log("🛠️ Gemini called a tool:", functionCalls);

    // Add the assistant's function call block to the history
    contents.push(responseMessage);

    const functionResponses = [];

    // Execute all function calls in parallel
    await Promise.all(functionCalls.map(async (part) => {
      const call = part.functionCall;
      if (call.name === "fetch_video_comments") {
        const comments = await fetchYouTubeComments(call.args.videoId);
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { name: call.name, content: comments }
          }
        });
      }
    }));

    // Add our tool results back to the history as the user
    contents.push({ role: "user", parts: functionResponses });

    // Loop back around! Give Gemini the results and let it decide what to do next.
    return runGeminiLoop(contents, tools);

  } else {
    // No function calls, meaning Gemini has given us the final text output!
    return responseMessage.parts[0].text;
  }
}

// The actual JavaScript function that does the work for Gemini
async function fetchYouTubeComments(videoId) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=3&key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return "Comments disabled or unavailable.";

    const data = await res.json();
    if (!data.items || data.items.length === 0) return "No comments found.";

    return data.items.map(item => item.snippet.topLevelComment.snippet.textOriginal);
  } catch (e) {
    return "Error fetching comments.";
  }
}
