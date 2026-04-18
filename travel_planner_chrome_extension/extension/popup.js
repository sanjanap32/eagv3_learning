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
            const apiRes = await fetch('http://localhost:5000/plan_itinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            const data = await apiRes.json();

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
