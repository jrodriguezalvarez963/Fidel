// main.js

/**
 * Módulo principal para funciones globales de navegación y accesibilidad
 * - Manejo de menú responsive con botón toggle y soporte teclado
 * - Gestión de foco accesible para mejorar navegación con teclado
 * - Detección y respeto de preferencia de usuario para reducir animaciones
 * - Código modular ES6, claro, sin dependencias externas
 */

/**
 * Clase para control del menú responsive
 * Gestiona apertura/cierre del menú y accesibilidad ARIA
 */
class Navigation {
  constructor() {
    this.menuButton = document.querySelector('.menu-toggle');
    this.menu = document.querySelector('.nav-menu');
    this.init();
  }

  init() {
    if (!this.menuButton || !this.menu) return;
    this.menuButton.addEventListener('click', () => this.toggleMenu());
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  toggleMenu() {
    const expanded = this.menuButton.getAttribute('aria-expanded') === 'true';
    this.menuButton.setAttribute('aria-expanded', String(!expanded));
    this.menu.classList.toggle('is-open');
  }

  handleKeydown(event) {
    if (!this.menu.classList.contains('is-open')) return;
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.menuButton.setAttribute('aria-expanded', 'false');
      this.menu.classList.remove('is-open');
      this.menuButton.focus();
    }
  }
}

/**
 * Añade y remueve la clase .focus-visible para elementos interactivos
 * mejora la visualización del foco para teclado
 */
function setupFocusVisible() {
  function onFocus(event) {
    // Solo añade focus-visible a elementos que pueden recibir foco lógico
    if (
      event.target.matches(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) {
      event.target.classList.add('focus-visible');
    }
  }
  function onBlur(event) {
    event.target.classList.remove('focus-visible');
  }
  document.addEventListener('focusin', onFocus);
  document.addEventListener('focusout', onBlur);
}

/**
 * Detecta si el usuario ha solicitado reducir animaciones
 * @returns {boolean}
 */
function prefersReducedMotion() {
  if (!window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Gestiona callbacks para responder a cambios en la preferencia de animación
 * @param {Function} onReduce - Acción cuando se prefiere reducir animaciones
 * @param {Function} onFull - Acción cuando se permiten animaciones completas
 */
function handleMotionPreference(onReduce, onFull) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function applyPreference() {
    if (mediaQuery.matches) {
      onReduce();
    } else {
      onFull();
    }
  }
  applyPreference();
  // Soporte para navegadores modernos que soportan addEventListener en MediaQueryList
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', applyPreference);
  } else if (typeof mediaQuery.addListener === 'function') {
    // Compatibilidad vieja
    mediaQuery.addListener(applyPreference);
  }
}

/**
 * Función principal que inicializa las funcionalidades globales
 */
export function initMain() {
  // Inicializar navegación responsive
  new Navigation();

  // Configurar enfoque accesible
  setupFocusVisible();

  // Detectar preferencia para reducir animaciones y ajustar UI o JS
  handleMotionPreference(
    () => {
      document.body.classList.add('reduce-motion');
      // Aquí puedes desactivar animaciones JS adicionales si las hay
      console.log('Preferencia de animación reducida activada');
    },
    () => {
      document.body.classList.remove('reduce-motion');
      // Reactivar animaciones
      console.log('Preferencia de animaciones normales activada');
    }
  );
}

// Ejecutar inicialización al cargar DOM
document.addEventListener('DOMContentLoaded', initMain);
