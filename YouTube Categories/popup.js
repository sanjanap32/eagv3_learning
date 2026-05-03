// popup.js — UI logic. API calls go through background.js.

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
      // 1. Check local cache first
      const cachedData = await getFromStorage(`cat_${categoryId}`);

      if (cachedData && cachedData.videos && cachedData.videos.length > 0) {
        displayVideos(cachedData.videos);
        await updateHistory(categoryId, categoryName);
        loadingDiv.classList.add('hidden');
        return;
      }

      // 2. Fetch from YouTube API via background worker
      const result = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: 'fetchVideos', categoryId },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          }
        );
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const videos = result.videos;

      // 3. Cache results locally
      await saveToStorage(`cat_${categoryId}`, {
        categoryName,
        timestamp: Date.now(),
        videos
      });

      // 4. Update history
      await updateHistory(categoryId, categoryName);

      // 5. Display
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
      const adFreeUrl = `https://www.youtube.com/watch?v=${video.id}`;

      const itemDiv = document.createElement('a');
      itemDiv.className = 'video-item';
      itemDiv.href = adFreeUrl;
      itemDiv.target = '_blank';

      const titleDiv = document.createElement('div');
      titleDiv.className = 'video-title';
      const temp = document.createElement('div');
      temp.innerHTML = video.title;
      titleDiv.textContent = temp.textContent;

      const channelDiv = document.createElement('div');
      channelDiv.className = 'video-channel';
      channelDiv.textContent = `By: ${video.channel}`;

      const linkDiv = document.createElement('div');
      linkDiv.className = 'video-link';
      linkDiv.textContent = 'Watch on YouTube';

      itemDiv.appendChild(titleDiv);
      itemDiv.appendChild(channelDiv);
      itemDiv.appendChild(linkDiv);

      resultsDiv.appendChild(itemDiv);
    });
  }

  // Storage helpers
  function getFromStorage(key) {
    return new Promise(resolve => {
      chrome.storage.local.get([key], result => resolve(result[key]));
    });
  }

  function saveToStorage(key, data) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: data }, () => resolve());
    });
  }

  async function updateHistory(categoryId, categoryName) {
    const history = await getFromStorage('search_history') || [];
    const filtered = history.filter(item => item.id !== categoryId);
    filtered.unshift({
      id: categoryId,
      name: categoryName,
      lastSearched: Date.now()
    });
    await saveToStorage('search_history', filtered);
  }
});
