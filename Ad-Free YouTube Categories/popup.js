// API_KEY is loaded from config.js

document.addEventListener('DOMContentLoaded', () => {
  const fetchBtn = document.getElementById('fetch-btn');
  const historyBtn = document.getElementById('history-btn');
  const categorySelect = document.getElementById('category');
  const resultsDiv = document.getElementById('results');
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  historyBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'history.html' });
  });

  fetchBtn.addEventListener('click', async () => {
    const categoryId = categorySelect.value;
    const categoryName = categorySelect.options[categorySelect.selectedIndex].text;

    // Clear previous results
    resultsDiv.innerHTML = '';
    errorDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');

    try {
      // 1. Check if we have cached results in chrome.storage.local
      const cachedData = await getFromStorage(`cat_${categoryId}`);

      if (cachedData && cachedData.videos && cachedData.videos.length > 0) {
        // Use cached videos
        displayVideos(cachedData.videos);
        await updateHistory(categoryId, categoryName);
        loadingDiv.classList.add('hidden');
        return;
      }

      // 2. If not cached, make API call using videos.list (not search.list which is often blocked)
      if (API_KEY === 'YOUR_API_KEY_HERE') {
        throw new Error('Please add your free YouTube Data API key in config.js');
      }

      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=${categoryId}&maxResults=5&regionCode=IN&key=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'API Request failed');
      }

      const data = await response.json();
      const videos = data.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle
      }));

      // 3. Save to local storage cache
      await saveToStorage(`cat_${categoryId}`, {
        categoryName: categoryName,
        timestamp: Date.now(),
        videos: videos
      });

      // 4. Update history log in local storage
      await updateHistory(categoryId, categoryName);

      // 5. Display videos
      displayVideos(videos);

    } catch (err) {
      errorDiv.textContent = `Error: ${err.message}`;
      errorDiv.classList.remove('hidden');
    } finally {
      loadingDiv.classList.add('hidden');
    }
  });

  function displayVideos(videos) {
    if (videos.length === 0) {
      resultsDiv.innerHTML = '<p>No videos found.</p>';
      return;
    }

    videos.forEach(video => {
      const adFreeUrl = `https://www.youtube-nocookie.com/embed/${video.id}`;

      const itemDiv = document.createElement('a');
      itemDiv.className = 'video-item';
      itemDiv.href = adFreeUrl;
      itemDiv.target = '_blank';

      const titleDiv = document.createElement('div');
      titleDiv.className = 'video-title';
      // Basic HTML unescape since API returns escaped characters
      const temp = document.createElement('div');
      temp.innerHTML = video.title;
      titleDiv.textContent = temp.textContent;

      const channelDiv = document.createElement('div');
      channelDiv.className = 'video-channel';
      channelDiv.textContent = `By: ${video.channel}`;

      const linkDiv = document.createElement('div');
      linkDiv.className = 'video-link';
      linkDiv.textContent = 'Watch Ad-Free';

      itemDiv.appendChild(titleDiv);
      itemDiv.appendChild(channelDiv);
      itemDiv.appendChild(linkDiv);

      resultsDiv.appendChild(itemDiv);
    });
  }

  // Storage helper functions
  function getFromStorage(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }

  function saveToStorage(key, data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: data }, () => {
        resolve();
      });
    });
  }

  async function updateHistory(categoryId, categoryName) {
    const history = await getFromStorage('search_history') || [];
    // Remove if already exists so we can bump it to the top
    const filteredHistory = history.filter(item => item.id !== categoryId);
    filteredHistory.unshift({
      id: categoryId,
      name: categoryName,
      lastSearched: Date.now()
    });
    await saveToStorage('search_history', filteredHistory);
  }
});
