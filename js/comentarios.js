// js/comentarios.js

/**
 * Sistema de comentarios conectado a Airtable API.
 * Funcionalidades:
 * - Carga y renderiza comentarios en tiempo real.
 * - Validación y sanitización en tiempo real con DOMPurify.
 * - Animación slide-in al agregar comentario.
 * - Sistema simple de votación (likes) por comentario.
 * - Accesibilidad avanzada (ARIA roles, soporte teclado).
 * 
 * Requiere:
 * - DOMPurify (https://github.com/cure53/DOMPurify) cargado en la página.
 * - js/airtable.js con funciones fetchComentarios y addComentario.
 */

/* IMPORTANTE:
 * Asegúrate que js/airtable.js está correctamente importado y exporta las funciones:
 * - fetchComentarios()
 * - addComentario()
 */
import DOMPurify from 'dompurify';
import { fetchComentarios, addComentario } from './airtable.js';

document.addEventListener('DOMContentLoaded', () => {
  ComentariosApp.init();
});

const ComentariosApp = (() => {
  // Selectores y elementos
  const formSelector = '#form-comentario';
  const listSelector = '#lista-comentarios';
  const countSelector = '#contador-comentarios';
  const inputNombreSelector = '#input-nombre';
  const inputCorreoSelector = '#input-correo';
  const inputComentarioSelector = '#input-comentario';
  const btnEnviarSelector = '#btn-enviar';

  // Estado local
  let comentariosCache = []; // Guarda los comentarios cargados
  // Map de votos (idComentario -> conteo likes)
  let votos = new Map();

  /** Inicializa la app */
  async function init() {
    // Cache elementos
    this.form = document.querySelector(formSelector);
    this.list = document.querySelector(listSelector);
    this.countDisplay = document.querySelector(countSelector);
    this.inputNombre = document.querySelector(inputNombreSelector);
    this.inputCorreo = document.querySelector(inputCorreoSelector);
    this.inputComentario = document.querySelector(inputComentarioSelector);
    this.btnEnviar = document.querySelector(btnEnviarSelector);

    if (!this.form || !this.list) {
      console.warn('No se encontraron elementos críticos de comentarios en DOM.');
      return;
    }

    // Set listeners
    this.form.addEventListener('submit', onFormSubmit.bind(this));
    this.inputNombre.addEventListener('input', onInputValidate.bind(this));
    this.inputCorreo.addEventListener('input', onInputValidate.bind(this));
    this.inputComentario.addEventListener('input', onInputValidate.bind(this));

    // Carga inicial
    await cargarComentarios();

    // Inicializa conteo votos o recarga si hubiera persistencia futura
  }

  /** Valida inputs en tiempo real y habilita/deshabilita boton enviar */
  function onInputValidate() {
    const nombreValido = this.inputNombre.value.trim().length >= 2;
    const comentarioValido = this.inputComentario.value.trim().length >= 5;
    // Correo opcional pero si está, valida formato simple
    const correoValido = this.inputCorreo.value.trim() === '' || validarEmail(this.inputCorreo.value.trim());

    this.btnEnviar.disabled = !(nombreValido && comentarioValido && correoValido);
  }

  /** Valida formato básico email (simple) */
  function validarEmail(email) {
    // Regex simple RFC 5322 simplificado
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /** Evento submit formulario */
  async function onFormSubmit(e) {
    e.preventDefault();
    if (this.btnEnviar.disabled) return;

    // Leer entradas y sanitizar con DOMPurify
    const nombreRaw = this.inputNombre.value;
    const correoRaw = this.inputCorreo.value;
    const comentarioRaw = this.inputComentario.value;

    const nombre = DOMPurify.sanitize(nombreRaw);
    const correo = DOMPurify.sanitize(correoRaw);
    const comentario = DOMPurify.sanitize(comentarioRaw);

    // Bloquear boton para evitar múltiples envíos
    this.btnEnviar.disabled = true;
    this.btnEnviar.textContent = 'Enviando...';

    try {
      // Enviar comentario a Airtable API a través de js/airtable.js
      const nuevoComentario = await addComentario({
        nombre,
        correo,
        comentario
      });

      if (nuevoComentario && nuevoComentario.id) {
        // Añadir a la lista local y renderizar con animación
        comentariosCache.unshift({
          id: nuevoComentario.id,
          nombre,
          correo,
          comentario,
          fecha: new Date().toISOString(),
          votos: 0
        });

        renderListaComentarios();
        resetFormulario();
        this.btnEnviar.textContent = 'Enviado ✓';
        setTimeout(() => {
          this.btnEnviar.textContent = 'Enviar';
          this.btnEnviar.disabled = false;
        }, 1500);
      } else {
        throw new Error('Respuesta inesperada al agregar comentario');
      }

    } catch (err) {
      console.error('Error al enviar comentario:', err);
      alert('Hubo un problema al enviar el comentario. Inténtalo más tarde.');
      this.btnEnviar.disabled = false;
      this.btnEnviar.textContent = 'Enviar';
    }
  }

  /** Reinicia formulario */
  function resetFormulario() {
    this.form.reset();
    this.btnEnviar.disabled = true;
  }

  /** Carga comentarios desde Airtable y guarda en cache.*/
  async function cargarComentarios() {
    try {
      const { records } = await fetchComentarios({ pageSize: 50 }); // Carga máximo 50
      comentariosCache = records.map(r => ({
        id: r.id,
        nombre: DOMPurify.sanitize(r.fields.Nombre || 'Anónimo'),
        correo: DOMPurify.sanitize(r.fields.Correo || ''),
        comentario: DOMPurify.sanitize(r.fields.Comentario || ''),
        fecha: r.fields.Fecha || '',
        votos: r.fields.Votos || 0
      }));

      // Inicializar mapa de votos
      votos = new Map(comentariosCache.map(c => [c.id, c.votos || 0]));

      renderListaComentarios();

    } catch (err) {
      console.error('Error cargando comentarios:', err);
      this.list.innerHTML = '<p role="alert">No se pudieron cargar los comentarios.</p>';
    }
  }

  /** Renderiza lista completa de comentarios en DOM */
  function renderListaComentarios() {
    // Vaciar lista previa
    this.list.innerHTML = '';
    this.countDisplay.textContent = comentariosCache.length;

    comentariosCache.forEach(comentario => {
      const article = document.createElement('article');
      article.classList.add('comentario-item');
      article.setAttribute('tabindex', '0');
      article.setAttribute('role', 'article');
      article.setAttribute('aria-label', `Comentario de ${comentario.nombre}`);

      // Fecha legible
      const fecha = comentario.fecha ? new Date(comentario.fecha) : null;
      const fechaStr = fecha ? fecha.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' }) : 'Fecha desconocida';

      article.innerHTML = `
        <header class="comentario-header">
          <h3 class="comentario-nombre">${comentario.nombre}</h3>
          <time datetime="${fecha ? fecha.toISOString() : ''}" class="comentario-fecha">${fechaStr}</time>
        </header>
        <p class="comentario-texto">${comentario.comentario}</p>
        <footer class="comentario-footer">
          <button class="btn-votar" aria-pressed="false" aria-label="Me gusta comentar de ${comentario.nombre}" data-id="${comentario.id}" data-votos="${votos.get(comentario.id) || 0}">
            👍 <span class="contador-votos">${votos.get(comentario.id) || 0}</span>
          </button>
        </footer>
      `;

      // Añadir animación slide-in
      article.style.opacity = 0;
      article.style.transform = 'translateX(-30px)';
      this.list.appendChild(article);
      requestAnimationFrame(() => {
        article.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        article.style.opacity = 1;
        article.style.transform = 'translateX(0)';
      });
    });

    // Añadir listeners a botones de voto
    this.list.querySelectorAll('.btn-votar').forEach(btn => {
      btn.removeEventListener('click', onVoteClick);
      btn.addEventListener('click', onVoteClick);
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  /** Maneja click en botón votar */
  function onVoteClick(e) {
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    if (!id) return;

    const votosPrevios = votos.get(id) || 0;
    const pulsado = btn.getAttribute('aria-pressed') === 'true';

    if (!pulsado) {
      votos.set(id, votosPrevios + 1);
      btn.setAttribute('aria-pressed', 'true');
      btn.querySelector('.contador-votos').textContent = votosPrevios + 1;
    } else {
      // Permite quitar voto (toggle)
      votos.set(id, votosPrevios - 1 >= 0 ? votosPrevios -1 : 0);
      btn.setAttribute('aria-pressed', 'false');
      btn.querySelector('.contador-votos').textContent = votosPrevios - 1 >= 0 ? votosPrevios -1 : 0;
    }
  }

  return {
    init,
  };
})();
