// main.js

/**
 * Módulo principal con funciones globales para navegación y accesibilidad
 * - Manejo de menú responsive
 * - Helpers para gestión de foco y navegación por teclado
 * - Detección y respeto de preferencia 'prefers-reduced-motion'
 * - Código modular, limpio y sin dependencias externas
 */

class Navigation {
  constructor() {
    this.menuButton = document.querySelector('.menu-toggle');
    this.menu = document.querySelector('.nav-menu');
    this.bindEvents();
  }

  bindEvents() {
    if (this.menuButton && this.menu) {
      this.menuButton.addEventListener('click', () => this.toggleMenu());
      // Mejor soporte teclado: cerrar con ESC y navegación con tab
      document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
  }

  toggleMenu() {
    const expanded = this.menuButton.getAttribute('aria-expanded') === 'true' || false;
    this.menuButton.setAttribute('aria-expanded', !expanded);
    this.menu.classList.toggle('is-open');
  }

  handleKeydown(event) {
    if (!this.menu.classList.contains('is-open')) return;
    // Cerrar menú con ESC
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.menuButton.setAttribute('aria-expanded', 'false');
      this.menu.classList.remove('is-open');
      this.menuButton.focus();
    }
  }
}

/**
 * Helper para la gestión de foco accesible
 * Permite manejar el foco con teclado y visualización clara del elemento activo
 */
function setupFocusVisible() {
  function handleFocus(event) {
    if (event.target.matches('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')) {
      event.target.classList.add('focus-visible');
    }
  }
  function handleBlur(event) {
    event.target.classList.remove('focus-visible');
  }
  document.addEventListener('focusin', handleFocus);
  document.addEventListener('focusout', handleBlur);
}

/**
 * Detecta si el usuario prefiere reducir animaciones usando matchMedia
 * @returns {boolean} true si prefiere reducir animaciones, false de lo contrario
 */
function prefersReducedMotion() {
  if (!window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Ejecuta función callback según preferencia de movimiento del usuario
 * Permite activar o desactivar animaciones JS o CSS en runtime
 * @param {Function} onReduce Motion enabled, callback sin animación
 * @param {Function} onFullMotion enabled, callback animado
 */
function handleMotionPreference(onReduce, onFull) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyPreference = () => {
    if (mediaQuery.matches) {
      onReduce();
    } else {
      onFull();
    }
  };
  applyPreference();
  mediaQuery.addEventListener('change', applyPreference);
}

/**
 * Inicializa el módulo principal
 */
export function initMain() {
  // Inicializar navegación responsive si existe menú
  new Navigation();

  // Configurar manejo visual de foco accesible
  setupFocusVisible();

  // Ejemplo de uso: Deshabilitar animaciones JS si prefiere reduce motion
  handleMotionPreference(
    () => {
      // Reducir animaciones: deshabilitar o pausar animaciones JS aquí si se usan
      document.body.classList.add('reduce-motion');
      console.log('Modo reducción de movimiento activado');
    },
    () => {
      // Activar animaciones normales
      document.body.classList.remove('reduce-motion');
      console.log('Modo animaciones activado');
    }
  );
}

// Auto-inicialización al importar este módulo
// Se puede comentar si se quiere iniciar explícitamente desde otro script
document.addEventListener('DOMContentLoaded', initMain);
