'use strict';

/**
 * Espera a que el DOM esté completamente cargado para ejecutar el código.
 */
document.addEventListener('DOMContentLoaded', function() {

    /**
     * Gestiona la funcionalidad del menú de navegación móvil (hamburguesa).
     */
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', function() {
            // Alterna la visibilidad del menú
            mobileMenu.classList.toggle('hidden');

            // Actualiza el estado ARIA para accesibilidad
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Aquí se podrán añadir otras funcionalidades globales en el futuro.
    // Por ejemplo, gestionar el modo de alto contraste.

});
