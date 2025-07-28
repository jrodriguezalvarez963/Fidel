// js/animaciones.js

/**
 * Animaciones avanzadas para el sitio:
 * - Transición suave entre secciones con CSS / GSAP
 * - Animación pulsante para estrella (estrella-26.svg)
 * - Efecto BAM! en secciones/comic cards
 * - Banderas ondeando en header o elementos específicos
 * - Alebrijes en México que siguen el cursor con animación suave
 * 
 * Todo modular, activable por clases o IDs, y con optimización para rendimiento.
 * Requiere GSAP para algunas animaciones (puedes agregar <script src="https://cdn.jsdelivr.net/npm/gsap@3"></script>)
 */

(() => {
  // Revisamos disponibilidad GSAP
  const hasGSAP = typeof gsap !== "undefined";

  //////// UTILIDADES /////////

  /**
   * Añade animación CSS a un elemento y remueve la clase luego para poder reusar.
   * @param {HTMLElement} el 
   * @param {string} claseAnimacion Clase CSS que tiene animación
   * @param {number} duracion segundos, opcional
   */
  function animacionCSS(el, claseAnimacion, duracion = 1000) {
    if (!el) return;
    el.classList.add(claseAnimacion);
    setTimeout(() => {
      el.classList.remove(claseAnimacion);
    }, duracion);
  }

  //////// TRANSICIÓN ENTRE SECCIONES /////////

  /**
   * Transición clásica fade entre secciones con GSAP si disponible, sino con CSS.
   * @param {HTMLElement} salirElemento El elemento que desaparece
   * @param {HTMLElement} entrarElemento El elemento que aparece
   * @param {Function} callback callback al finalizar
   */
  function transicionSecciones(salirElemento, entrarElemento, callback) {
    if (!salirElemento || !entrarElemento) {
      if (callback) callback();
      return;
    }
    if (hasGSAP) {
      gsap.timeline()
        .to(salirElemento, {opacity: 0, duration: 0.5, ease: "power2.inOut"})
        .set(salirElemento, {display: "none"})
        .set(entrarElemento, {display: "block", opacity: 0})
        .to(entrarElemento, {opacity: 1, duration: 0.5, ease: "power2.inOut"})
        .eventCallback("onComplete", () => {
          if (callback) callback();
        });
    } else {
      // fallback con CSS simple (añade clase fade-out, fade-in)
      salirElemento.style.transition = "opacity 0.5s ease";
      salirElemento.style.opacity = "0";

      setTimeout(() => {
        salirElemento.style.display = "none";
        entrarElemento.style.display = "block";
        entrarElemento.style.opacity = "0";
        entrarElemento.style.transition = "opacity 0.5s ease";
        setTimeout(() => {
          entrarElemento.style.opacity = "1";
          if (callback) callback();
        }, 50);
      }, 500);
    }
  }

  //////// ESTRELLA PULSANTE (estrella-26.svg) /////////

  function animarEstrellaPulsante() {
    const estrella = document.getElementById("estrella-26");
    if (!estrella) return;

    if (hasGSAP) {
      gsap.to(estrella, {
        scale: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        duration: 2
      });
    } else {
      // Fallback animación CSS con clase
      estrella.classList.add("pulsante");
    }
  }

  //////// EFECTO BAM! EN COMIC /////////

  /**
   * Ejecuta animación BAM! sobre un elemento,
   * puede recibir selector o nodo directo
   * @param {HTMLElement|string} elem 
   */
  function efectoBAM(elem) {
    const el = typeof elem === "string" ? document.querySelector(elem) : elem;
    if (!el) return;

    if (hasGSAP) {
      const bamDiv = document.createElement("div");
      bamDiv.classList.add("bam-effect");
      el.appendChild(bamDiv);

      gsap.fromTo(bamDiv, 
        {opacity: 0, scale: 0.3, rotate: 0},
        {
          opacity: 1,
          scale: 1.2,
          rotate: 15,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
          onComplete: () => { bamDiv.remove(); }
        }
      );
    } else {
      animacionCSS(el, "bam-effect", 700);
    }
  }

  //////// BANDERAS ONDEANDO /////////

  /**
   * Anima cualquier elemento con clase .bandera-ondeando para simular ondeo suave.
   * Puede ser fondo o imagen.
   */
  function animarBanderas() {
    const banderas = document.querySelectorAll(".bandera-ondeando");
    if (!banderas.length) return;

    if (hasGSAP) {
      banderas.forEach(el => {
        gsap.to(el, {
          rotation: 3,
          transformOrigin: "left center",
          yoyo: true,
          repeat: -1,
          duration: 2,
          ease: "sine.inOut",
          yoyoEase: true
        });
      });
    } else {
      banderas.forEach(el => {
        // fallback: animación CSS con clase
        el.classList.add("bandera-animacion");
      });
    }
  }

  //////// ALEBRIJES (siguen cursor) /////////

  /**
   * Hace que los elementos con clase `.alebrije` sigan el cursor con límite de movimiento y animation smooth.
   * Debe llamarse solo si hay contenedor alebrijes en la página.
   */
  function animarAlebrijesCursor() {
    const alebrijes = document.querySelectorAll(".alebrije");
    if (!alebrijes.length) return;

    // Parámetros de movimiento máximo
    const maxOffsetX = 50;
    const maxOffsetY = 30;

    // Estado actual de posiciones para suavizado
    let targetX = 0;
    let targetY = 0;

    const ease = 0.1; // suavizado

    // Usar GSAP ticker o fallback requestAnimationFrame
    function animatePositions() {
      alebrijes.forEach((el, i) => {
        const returnToX = 20 * i; // desplazamiento base para espacio alebrijes
        const returnToY = 0;

        let currentX = parseFloat(el.style.transform.replace(/[^\d.,-]/g, '').split(',')[0]) || 0;
        let currentY = parseFloat(el.style.transform.replace(/[^\d.,-]/g, '').split(',')[1]) || 0;

        let dx = (targetX + returnToX - currentX) * ease;
        let dy = (targetY + returnToY - currentY) * ease;

        const newX = currentX + dx;
        const newY = currentY + dy;

        el.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
      });

      if (hasGSAP) {
        gsap.ticker.add(animatePositions);
      } else {
        requestAnimationFrame(animatePositions);
      }
    }

    animatePositions();

    // Listener global de movimiento cursor
    document.addEventListener("mousemove", (e) => {
      // Calcular posiciones normalizadas (centrado - mitad ancho pantalla)
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Distancias limitadas
      targetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, e.clientX - centerX));
      targetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, e.clientY - centerY));
    });
  }

  //////// INICIALIZADOR GENERAL /////////

  function initAnimaciones() {
    animarEstrellaPulsante();
    animarBanderas();
    animarAlebrijesCursor();
  }

  // Exponer funciones para control manual si es necesario
  window.Animaciones = {
    transicionSecciones,
    animarEstrellaPulsante,
    efectoBAM,
    animarBanderas,
    animarAlebrijesCursor,
    initAnimaciones,
  };

  // Auto start animaciones al DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    initAnimaciones();
  });

})();
