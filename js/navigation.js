const showTool = (toolId) => {
    document.getElementById('main-header').style.display = 'none';
    document.getElementById('tool-menu').style.display = 'none';
    document.querySelectorAll('.tool-section').forEach(section => {
        section.classList.toggle('active', section.id === toolId);
    });
    // Hide Ko-fi button when a tool is active
    document.getElementById('koFiButton').style.display = 'none';
};

const showMenu = () => {
    document.getElementById('main-header').style.display = 'block';
    document.getElementById('tool-menu').style.display = 'block';
    document.querySelectorAll('.tool-section').forEach(section => section.classList.remove('active'));
    history.pushState("", document.title, window.location.pathname + window.location.search);
    // Show Ko-fi button when main menu is active
    document.getElementById('koFiButton').style.display = 'inline-flex';
};

const handleRouting = () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showTool(hash);
    } else {
        showMenu();
    }
};

const initNavigation = () => {
    window.addEventListener('hashchange', handleRouting);
    document.querySelectorAll('.back-to-menu').forEach(button => button.addEventListener('click', (e) => {
        e.preventDefault();
        showMenu();
    }));
    handleRouting(); // Initial routing check
};
