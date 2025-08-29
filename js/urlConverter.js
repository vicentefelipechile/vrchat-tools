
document.addEventListener('DOMContentLoaded', () => {
    const convertUrlBtn = document.getElementById('convertUrlBtn');
    const youtubeUrlInput = document.getElementById('youtubeUrlInput');
    const convertedUrlResult = document.getElementById('convertedUrlResult');
    const urlStatusResult = document.getElementById('urlStatusResult');
    const historyList = document.getElementById('history-list');

    let history = [];

    function loadHistory() {
        const savedHistory = localStorage.getItem('vrctools-url-history');
        if (savedHistory) {
            history = JSON.parse(savedHistory);
            renderHistory();
        }
    }

    function saveHistory() {
        localStorage.setItem('vrctools-url-history', JSON.stringify(history));
    }

    function renderHistory() {
        historyList.innerHTML = '';
        history.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a class="history-item-link" data-url="${item.convertedUrl}">${item.youtubeUrl}</a>
                <button class="delete-history-btn" data-index="${index}">X</button>
            `;
            historyList.appendChild(li);
        });
        addHistoryEventListeners();
    }

    function addHistoryEventListeners() {
        document.querySelectorAll('.history-item-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const url = e.target.getAttribute('data-url');
                showVideoFromHistory(url);
            });
        });

        document.querySelectorAll('.delete-history-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                history.splice(index, 1);
                saveHistory();
                renderHistory();
            });
        });
    }

    function showVideoFromHistory(url) {
        convertedUrlResult.innerHTML = `
            <div class="converted-url-container">
                <span class="url-text">${url}</span>
                <button id="copyUrlBtn" class="copy-btn" data-key="common.copyButton">Copy</button>
            </div>
        `;
        addCopyButtonEventListener(url);
        urlStatusResult.innerHTML = `
            <video controls width="100%" src="${url}" style="margin-top: 15px;"></video>
        `;
        updateTranslations();
    }

    if (convertUrlBtn) {
        convertUrlBtn.addEventListener('click', () => {
            const youtubeUrl = youtubeUrlInput.value.trim();
            if (youtubeUrl) {
                const videoId = getYouTubeVideoId(youtubeUrl);
                if (videoId) {
                    const convertedUrl = `http://165.1.125.10:8080/video?url=https://www.youtube.com/watch?v=${videoId}`;
                    
                    if (!history.some(item => item.convertedUrl === convertedUrl)) {
                        history.unshift({ youtubeUrl, convertedUrl });
                        if (history.length > 10) {
                            history.pop();
                        }
                        saveHistory();
                        renderHistory();
                    }

                    convertedUrlResult.innerHTML = `
                        <div class="converted-url-container">
                            <span class="url-text">${convertedUrl}</span>
                            <button id="copyUrlBtn" class="copy-btn" data-key="common.copyButton">Copy</button>
                        </div>
                    `;
                    addCopyButtonEventListener(convertedUrl);
                    updateTranslations();

                    checkUrlStatus(convertedUrl);
                } else {
                    convertedUrlResult.innerHTML = '';
                    urlStatusResult.innerHTML = `<p class="error-message">Invalid YouTube URL</p>`;
                }
            }
        });
    }

    function addCopyButtonEventListener(url) {
        const copyBtn = document.getElementById('copyUrlBtn');
        if(copyBtn) {
            copyBtn.addEventListener('click', () => {
                copyToClipboard(url);
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    updateTranslations();
                }, 2000);
            });
        }
    }

    function checkUrlStatus(url) {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchPromise = fetch(url, { signal, mode: 'no-cors' });
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => {
                controller.abort();
                reject(new Error('Timeout'));
            }, 4000)
        );

        urlStatusResult.innerHTML = `<p data-key="urlConverter.checking">Checking URL...</p>`;
        updateTranslations();

        Promise.race([fetchPromise, timeoutPromise])
            .then(response => {
                urlStatusResult.innerHTML = `
                    <video controls width="100%" src="${url}" style="margin-top: 15px;"></video>
                `;
                updateTranslations();
            })
            .catch(error => {
                if (error.name === 'AbortError') {
                    urlStatusResult.innerHTML = `<p class="processing-message" data-key="urlConverter.processing" style="margin-top: 15px;">El video actualmente se esta procesando</p>`;
                } else {
                    urlStatusResult.innerHTML = `
                        <video controls width="100%" src="${url}" style="margin-top: 15px;"></video>
                    `;
                }
                updateTranslations();
            });
    }

    function getYouTubeVideoId(url) {
        try {
            const urlObject = new URL(url);
            let videoId = urlObject.searchParams.get('v');
            if (videoId) {
                return videoId;
            }
            if (urlObject.hostname === 'youtu.be') {
                return urlObject.pathname.slice(1);
            }
            if (urlObject.pathname.startsWith('/embed/')) {
                return urlObject.pathname.split('/')[2];
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    loadHistory();
});
