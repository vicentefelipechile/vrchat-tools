document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const mainHeader = document.getElementById('main-header');
    const toolMenu = document.getElementById('tool-menu');
    const toolSections = document.querySelectorAll('.tool-section');
    const backButtons = document.querySelectorAll('.back-to-menu');
    const langSwitcher = document.getElementById('lang-switcher');
    const langButtons = document.querySelectorAll('#lang-switcher button');
    const imageInput = document.getElementById('imageInput');
    const fileNameSpan = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const imagePreview = document.getElementById('imagePreview');
    const downloadLink = document.getElementById('downloadLink');
    const resolutionInfo = document.getElementById('resolutionInfo');
    const sizeInfo = document.getElementById('sizeInfo');

    // --- State ---
    let selectedFile = null;
    let currentLang = 'en';

    // --- Translation Logic ---
    const getTranslation = (key) => {
        return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations[currentLang]);
    };

    const setLanguage = (lang) => {
        if (!translations[lang]) return;
        currentLang = lang;
        localStorage.setItem('vrctools-lang', lang);
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            const translation = getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });

        langButtons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-lang') === lang);
        });
    };

    langSwitcher.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            setLanguage(e.target.getAttribute('data-lang'));
        }
    });

    // --- Navigation Logic ---
    const showTool = (toolId) => {
        mainHeader.style.display = 'none';
        toolMenu.style.display = 'none';
        toolSections.forEach(section => {
            section.classList.toggle('active', section.id === toolId);
        });
    };

    const showMenu = () => {
        mainHeader.style.display = 'block';
        toolMenu.style.display = 'block';
        toolSections.forEach(section => section.classList.remove('active'));
        history.pushState("", document.title, window.location.pathname + window.location.search);
    };

    const handleRouting = () => {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showTool(hash);
        } else {
            showMenu();
        }
    };

    window.addEventListener('hashchange', handleRouting);
    backButtons.forEach(button => button.addEventListener('click', (e) => {
        e.preventDefault();
        showMenu();
    }));

    // --- Image Converter Logic ---
    imageInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        const p = imagePreview.querySelector('p');
        if (selectedFile) {
            fileNameSpan.textContent = selectedFile.name;
            if(p) p.textContent = getTranslation('imageConverter.readyMessage');
            downloadLink.style.display = 'none';
            resolutionInfo.textContent = '';
            sizeInfo.textContent = '';
        } else {
            fileNameSpan.textContent = getTranslation('imageConverter.noFileSelected');
        }
    });

    convertBtn.addEventListener('click', () => {
        if (!selectedFile) {
            alert(getTranslation('imageConverter.errorMessage'));
            return;
        }
        const optimization = document.querySelector('input[name="optimization"]:checked').value;
        processImage(selectedFile, optimization);
    });

    function processImage(file, optimization) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const originalWidth = img.width;
                const originalHeight = img.height;
                const targetAspectRatio = 16 / 9;

                let canvasWidth, canvasHeight;
                if (originalWidth / originalHeight > targetAspectRatio) {
                    canvasHeight = originalHeight;
                    canvasWidth = Math.round(canvasHeight * targetAspectRatio);
                } else {
                    canvasWidth = originalWidth;
                    canvasHeight = Math.round(canvasWidth / targetAspectRatio);
                }

                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                let quality;
                switch (optimization) {
                    case 'high': quality = 0.5; break;
                    case 'medium': quality = 0.7; break;
                    default: quality = 1.0; break;
                }

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                imagePreview.innerHTML = `<img src="${dataUrl}" alt="Converted Image">`;
                resolutionInfo.textContent = `${getTranslation('common.resolution')}: ${canvas.width}x${canvas.height}`;
                sizeInfo.textContent = `${getTranslation('common.size')}: ${formatBytes(dataUrl.length)}`;

                downloadLink.href = dataUrl;
                downloadLink.download = `vrct_${file.name.split('.')[0]}.jpg`;
                downloadLink.style.display = 'inline-block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const actualBytes = Math.round(bytes * (3 / 4));
        const i = Math.floor(Math.log(actualBytes) / Math.log(k));
        return parseFloat((actualBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // --- Initialization ---
    const initialLang = localStorage.getItem('vrctools-lang') || navigator.language.split('-')[0];
    setLanguage(translations[initialLang] ? initialLang : 'en');
    handleRouting();
});
