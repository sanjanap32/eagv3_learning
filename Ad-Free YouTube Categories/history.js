document.addEventListener('DOMContentLoaded', async () => {
  const historyListDiv = document.getElementById('history-list');
  const resultsDiv = document.getElementById('results');
  const videoListDiv = document.getElementById('video-list');
  const categoryTitle = document.getElementById('category-title');
  const backBtn = document.getElementById('back-btn');

  backBtn.addEventListener('click', () => {
    resultsDiv.classList.add('hidden');
    historyListDiv.classList.remove('hidden');
  });

  const history = await getFromStorage('search_history');

  if (!history || history.length === 0) {
    historyListDiv.innerHTML = '<p>No search history yet.</p>';
    return;
  }

  history.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'history-item';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'category-name';
    nameDiv.textContent = item.name;

    const dateDiv = document.createElement('div');
    dateDiv.className = 'last-searched';
    dateDiv.textContent = `Searched: ${new Date(item.lastSearched).toLocaleString()}`;

    itemDiv.appendChild(nameDiv);
    itemDiv.appendChild(dateDiv);

    itemDiv.addEventListener('click', () => loadCategoryVideos(item.id, item.name));

    historyListDiv.appendChild(itemDiv);
  });

  async function loadCategoryVideos(categoryId, categoryName) {
    historyListDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
    categoryTitle.textContent = `${categoryName} Videos`;
    videoListDiv.innerHTML = 'Loading...';

    const cachedData = await getFromStorage(`cat_${categoryId}`);
    
    if (cachedData && cachedData.videos) {
      displayVideos(cachedData.videos);
    } else {
      videoListDiv.innerHTML = '<p>Cache expired or no data found. Please search from the popup again.</p>';
    }
  }

  function displayVideos(videos) {
    videoListDiv.innerHTML = '';
    
    if (videos.length === 0) {
      videoListDiv.innerHTML = '<p>No videos found in cache.</p>';
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
      
      videoListDiv.appendChild(itemDiv);
    });
  }

  function getFromStorage(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }
});
