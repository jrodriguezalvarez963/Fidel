// js/main.js

/**
 * Archivo principal de JavaScript para funcionalidades globales del sitio.
 * Incluye gestión de accesibilidad, navegación y detección de preferencias de usuario.
 */

// Uso de IIFE (Immediately Invoked Function Expression) para evitar conflictos de variables.
(function() {
    'use strict';

    /**
     * @description Detecta la preferencia de movimiento reducido del usuario y
     * añade una clase al body si es necesario.
     */
    function detectReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
            console.log('Preferencia de movimiento reducido detectada.');
        }
    }

    /**
     * @description Inicializa la gestión de foco para mejorar la accesibilidad
     * de la navegación por teclado.
     */
    function setupFocusManagement() {
        document.addEventListener('keydown', function(event) {
            // Detección de la tecla 'Tab' para añadir un estilo de foco visible
            if (event.key === 'Tab') {
                document.body.classList.add('user-is-tabbing');
            }
        });

        document.addEventListener('mousedown', function() {
            // Elimina el estilo de foco si se usa el mouse
            document.body.classList.remove('user-is-tabbing');
        });
    }

    /**
     * @description Función de inicialización principal del script.
     * Llama a todas las funciones necesarias al cargar la página.
     */
    function init() {
        console.log('main.js inicializado.');
        detectReducedMotion();
        setupFocusManagement();
    }

    // Asegura que el DOM esté completamente cargado antes de ejecutar el script.
    document.addEventListener('DOMContentLoaded', init);

})();
