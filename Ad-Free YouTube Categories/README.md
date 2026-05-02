# Ad-Free YouTube Categories Chrome Extension

This Chrome Extension allows you to easily find the top 5 rated ad-free YouTube videos for various categories. It uses YouTube's privacy-enhanced embed links to bypass standard pre-roll ads and tracking cookies.

## Features
- **Category Selection:** Choose from popular YouTube categories (Music, Gaming, Education, etc.).
- **Top Rated:** Fetches the top 5 highest-rated videos for your selected category.
- **Ad-Free Viewing:** Generates `youtube-nocookie.com/embed/` links for an ad-free viewing experience.
- **Smart Caching:** Saves your fetched videos locally so revisiting a category is instant and saves API calls.
- **History Page:** Automatically keeps track of the categories you've searched. Click any past category to instantly view its cached videos.

## Installation

1. Clone or download this repository.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle switch in the top right corner).
4. Click on **Load unpacked**.
5. Select the `Ad-Free YouTube Categories` folder from your computer.

## Setup: Free YouTube Data API Key

To fetch the top 5 rated videos, this extension uses the YouTube Data API v3. You need to provide your own free API key.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Library**.
4. Search for "YouTube Data API v3" and click **Enable**.
5. Navigate to **APIs & Services > Credentials**.
6. Click **Create Credentials** and select **API key**.
7. Copy your new API key.
8. Open `popup.js` in this extension's folder.
9. Locate the top line:
   ```javascript
   const API_KEY = 'YOUR_API_KEY_HERE';
   ```
10. Replace `'YOUR_API_KEY_HERE'` with your actual API key and save the file.
11. Go back to `chrome://extensions/` and click the refresh icon on the extension to reload it.

> Note: The YouTube Data API has a generous free tier (10,000 units per day), which is more than enough for personal use!

## Usage

1. Click the extension icon in your Chrome toolbar.
2. Select a category from the dropdown menu and click **Get Videos**.
3. Click any video link to open it in an ad-free format.
4. Click **View History** to see all the categories you've previously searched and load their cached videos instantly.
