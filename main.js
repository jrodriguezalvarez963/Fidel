// Manejo del modo oscuro
function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const mobileDarkModeToggle = document.getElementById('mobile-dark-mode-toggle');
    const html = document.documentElement;
    
    // Comprobar preferencia del sistema
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Comprobar almacenamiento local
    const currentTheme = localStorage.getItem('theme');
    
    // Aplicar tema guardado o preferencia del sistema
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        html.classList.add('dark-mode');
    }
    
    // Alternar modo oscuro
    function toggleDarkMode() {
        html.classList.toggle('dark-mode');
        localStorage.setItem('theme', html.classList.contains('dark-mode') ? 'dark' : 'light');
    }
    
    // Event listeners
    if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
    if (mobileDarkModeToggle) mobileDarkModeToggle.addEventListener('click', toggleDarkMode);
}

// Manejo del menú móvil
function initMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Otras funciones comunes...