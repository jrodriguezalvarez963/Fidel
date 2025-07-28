// js/main.js

/**
 * Archivo de funcionalidades comunes para toda la web:
 * - Navegación y rutas relativas
 * - Modo alto contraste (toggle class)
 * - Inicializadores y helpers genéricos para accesibilidad
 * - Listeners globales para eventos comunes
 * 
 * Este script se debe cargar con defer para asegurar DOM listo.
 */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initContrastToggle();
  initKeyboardNavigationFocus();
  // Aquí más inicializaciones globales si se requieren
});

/**
 * Inicializa ajustes para manejo de rutas relativas y navegación
 */
function initNavigation() {
  // Detectar links internos y ajustar rutas relativas si fuera necesario
  // Aquí se puede añadir lógica para SPA o para navegación con rutas base
  
  // Ejemplo simple: prevenir múltiples clicks en enlaces que cargan la misma página
  const linksInternos = document.querySelectorAll("a[href^='./'], a[href^='../'], a[href^='/'], a[href^='#'], a[href^='index.html'], a[href^='curiosidades.html'], a[href^='analisis.html'], a[href^='mexico.html']");
  linksInternos.forEach(link => {
    link.addEventListener("click", e => {
      // Si quieres agregar lógica para evitar recarga, aquí va
      // Por ahora no hacemos nada y dejamos la navegación tradicional
    });
  });
}

/**
 * Maneja alternancia de modo alto contraste para accesibilidad
 * Se activa/desactiva con botón con id="toggle-contraste", si existe.
 */
function initContrastToggle() {
  const contrasteBtn = document.getElementById("toggle-contraste");
  if (!contrasteBtn) return;

  contrasteBtn.addEventListener("click", () => {
    const body = document.body;
    const modoActivo = body.classList.toggle("high-contrast");

    // Guardar preferencia en localStorage para persistencia
    try {
      if (modoActivo) {
        localStorage.setItem("modoContraste", "activo");
      } else {
        localStorage.removeItem("modoContraste");
      }
    } catch (e) {
      // Silenciar error si almacenamiento no está disponible
      console.warn("No se pudo guardar preferencia de contraste:", e);
    }
  });

  // Al cargar, aplicar modo contraste si estaba activo previamente
  try {
    const modoGuardado = localStorage.getItem("modoContraste");
    if (modoGuardado === "activo") {
      document.body.classList.add("high-contrast");
    }
  } catch (e) {
    // Silenciar error
  }
}

/**
 * Helper para mejorar navegación y enfoque con teclado
 * Añade outline visible sólo si es navegación por teclado
 */
function initKeyboardNavigationFocus() {
  let usarTeclado = false;

  function manejarPrimeraTecla(e) {
    if (e.key === "Tab") {
      usarTeclado = true;
      document.body.classList.add("using-keyboard");
      window.removeEventListener("keydown", manejarPrimeraTecla);
    }
  }

  function manejarClick() {
    if (usarTeclado) {
      usarTeclado = false;
      document.body.classList.remove("using-keyboard");
      window.addEventListener("keydown", manejarPrimeraTecla);
    }
  }

  window.addEventListener("keydown", manejarPrimeraTecla);
  window.addEventListener("mousedown", manejarClick);
}

/**
 * Función genérica para obtener ruta relativa de un archivo dado,
 * con base en la ubicación actual.
 * Ejemplo: obtenerRutaRelativa("assets/images/logo.svg");
 * En este proyecto, las rutas se usan relativas al archivo HTML actual,
 * por lo que este helper puede adaptarse si migran a SPA.
 * 
 * Por defecto devuelve la ruta sin cambios.
 * @param {string} path Ruta relativa base
 * @returns {string} Ruta ajustada
 */
function obtenerRutaRelativa(path) {
  // Por ahora no hace ajuste; aquí se extendería lógica si fuera necesario
  return path;
}

/**
 * Otros helpers globales y utilidades pueden agregarse abajo,
 * como manejo de modales, tooltips, ARIA live alerts, focus traps, etc.
 */

export {
  initNavigation,
  initContrastToggle,
  initKeyboardNavigationFocus,
  obtenerRutaRelativa,
};
