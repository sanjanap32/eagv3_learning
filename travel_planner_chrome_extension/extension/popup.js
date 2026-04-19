document.addEventListener('DOMContentLoaded', () => {
    const queryInput = document.getElementById('queryInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    generateBtn.addEventListener('click', async () => {
        const query = queryInput.value.trim();
        if(!query) return;

        // Reset state
        loadingDiv.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        resultsDiv.innerHTML = '';

        try {
            const apiRes = await fetch('http://127.0.0.1:5000/plan_itinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            // Fallback response handling if the server returns non-JSON errors
            const rawText = await apiRes.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (e) {
                // If it fails to parse JSON, throw the raw string instead of a useless end of JSON input error
                throw new Error(rawText || "Server disconnected unexpectedly.");
            }

            if (!apiRes.ok) {
                throw new Error(data.error || "Failed to generate itinerary.");
            }

            // Convert Markdown to HTML natively using marked.js Library
            resultsDiv.innerHTML = marked.parse(data.markdown);
            
            loadingDiv.classList.add('hidden');
            resultsDiv.classList.remove('hidden');

        } catch (err) {
            loadingDiv.classList.add('hidden');
            errorDiv.textContent = `Error: ${err.message}. Make sure the Python Flask server is running locally on port 5000!`;
            errorDiv.classList.remove('hidden');
        }
    });
});
