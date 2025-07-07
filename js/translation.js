let currentLang = 'en';

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

    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = lang;
    }
};

const initTranslation = () => {
    const initialLang = localStorage.getItem('vrctools-lang') || navigator.language.split('-')[0];
    setLanguage(translations[initialLang] ? initialLang : 'en');

    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
};
