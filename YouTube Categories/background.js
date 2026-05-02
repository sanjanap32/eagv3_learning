// Background service worker — makes YouTube API calls.
// YOUTUBE_API_KEY is loaded from config.js via importScripts.

importScripts('config.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchVideos') {
    const categoryId = request.categoryId;
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=${categoryId}&maxResults=15&regionCode=US&key=${API_KEY}`;

    fetch(url)
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.error?.message || `HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .then(data => {
        const englishVideos = (data.items || []).filter(item => {
          const lang = item.snippet.defaultAudioLanguage || item.snippet.defaultLanguage || 'en';
          return lang.toLowerCase().startsWith('en');
        });
        const videos = englishVideos.slice(0, 5).map(item => ({
          id: item.id,
          title: item.snippet.title,
          channel: item.snippet.channelTitle
        }));
        sendResponse({ success: true, videos });
      })
      .catch(err => {
        console.error('YouTube API error:', err);
        sendResponse({ success: false, error: err.message });
      });

    // Return true to keep the message channel open for async response
    return true;
  }
});
