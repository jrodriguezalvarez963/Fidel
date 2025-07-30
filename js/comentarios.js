// comentarios.js

/**
 * Módulo para gestionar la sección de comentarios integrados con Airtable
 * Características:
 * - Conexión segura a Airtable API con Base ID, Tabla y API Key
 * - Obtención y envío de comentarios, ordenados por fecha descendente
 * - Campos gestionados: nombre, comentario, fecha, likes
 * - Validación y sanitización básica para evitar XSS
 * - Animaciones al cargar y agregar comentarios (fade-in y desplazamiento)
 * - Mostrar número de likes junto a cada comentario si es mayor que 0
 * - Manejo de errores con feedback visible al usuario
 * - Refresco automático cada 2 minutos
 * - Conexión con formulario y lista del DOM con IDs específicos
 * - Modular ES6 con export/import y código muy comentado
 */

const BASE_ID = 'app45M30CM1ccXTau';
const TABLE_COMENTARIOS = 'tbl8l3mdaCeLMNMTd';
const API_KEY = 'patju3fjNyKDBeCGp.68ab3d377eb0bbffeaeade69fedd53edbc3c8d3686bd66da85abfd9fc8a5251c';

const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_COMENTARIOS}`;

// Cabeceras para solicitudes fetch a Airtable
const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

/**
 * Obtiene los comentarios desde Airtable, ordenados por fecha descendente
 * Campos recuperados: nombre, comentario, fecha, likes
 * @returns {Promise<Array<{id:string,nombre:string,comentario:string,fecha:string,likes:number}>>}
 */
export async function getComentarios() {
  try {
    const url = `${AIRTABLE_URL}?sort[0][field]=fecha&sort[0][direction]=desc`;
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) {
      throw new Error(`Error al obtener comentarios: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    // Mapear registros a formato simple y seguro para uso en UI
    return data.records.map(record => ({
      id: record.id,
      nombre: record.fields.nombre || 'Anónimo',
      comentario: record.fields.comentario || '',
      fecha: record.fields.fecha || record.createdTime || '',
      likes: Number(record.fields.likes) || 0,
    }));
  } catch (error) {
    console.error('getComentarios:', error);
    throw error;
  }
}

/**
 * Sanitiza un string para evitar inyecciones de código HTML/JS (escape básico)
 * Utiliza DOM para escapar efectivamente con textContent
 * @param {string} str 
 * @returns {string}
 */
function sanitizeText(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Envía un nuevo comentario a Airtable tras validar y sanitizar entradas
 * Añade fecha actual ISO y likes inicial 0
 * @param {{nombre:string,comentario:string}} data 
 * @returns {Promise<any>} Respuesta Airtable JSON
 */
export async function addComentario(data) {
  const nombre = (data.nombre || '').trim();
  const comentario = (data.comentario || '').trim();

  if (!nombre) throw new Error('El nombre es obligatorio.');
  if (!comentario) throw new Error('El comentario no puede estar vacío.');

  const safeNombre = sanitizeText(nombre);
  const safeComentario = sanitizeText(comentario);

  const body = {
    records: [
      {
        fields: {
          nombre: safeNombre,
          comentario: safeComentario,
          fecha: new Date().toISOString(),
          likes: 0,
        },
      },
    ],
  };

  try {
    const response = await fetch(AIRTABLE_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al enviar comentario: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('addComentario:', error);
    throw error;
  }
}

/* -------------------- DOM Elements -------------------- */
const formComentarios = document.getElementById('form-comentarios');
const listaComentarios = document.getElementById('lista-comentarios');
const mensajeError = document.getElementById('mensaje-error');
const mensajeExito = document.getElementById('mensaje-exito');
const inputNombre = document.getElementById('input-nombre');
const textareaComentario = document.getElementById('textarea-comentario');

/**
 * Crea un elemento <li> DOM para visualización de comentario con animación
 * Muestra nombre, comentario, fecha formateada y likes (si > 0)
 * @param {{nombre:string,comentario:string,fecha:string,likes:number}} commentData 
 * @returns {HTMLElement}
 */
function crearElementoComentario({ nombre, comentario, fecha, likes = 0 }) {
  const li = document.createElement('li');
  li.classList.add('comentario-item');
  li.style.opacity = '0';
  li.style.transform = 'translateY(10px)';
  li.setAttribute('tabindex', '0');

  // Formatear fecha a string legible en español
  const fechaFormateada = fecha ? new Date(fecha).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '';

  // Construcción del innerHTML con likes mostrados si > 0
  li.innerHTML = `
    <p class="comentario-texto">${comentario}</p>
    <p class="comentario-meta">
      — ${nombre} ${likes > 0 ? `| ❤️ ${likes}` : ''} 
      ${fechaFormateada ? `| <time datetime="${fecha}">${fechaFormateada}</time>` : ''}
    </p>
  `;

  // Animación fade-in y slide-up suave
  requestAnimationFrame(() => {
    li.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    li.style.opacity = '1';
    li.style.transform = 'translateY(0)';
  });

  return li;
}

/**
 * Renderiza la lista completa de comentarios en DOM
 * Limpia la lista y muestra mensajes de error si ocurren
 */
export async function renderComentarios() {
  try {
    listaComentarios.innerHTML = '';
    mensajeError.setAttribute('aria-hidden', 'true');
    mensajeExito.setAttribute('aria-hidden', 'true');

    const comentarios = await getComentarios();

    if (comentarios.length === 0) {
      listaComentarios.innerHTML = '<li tabindex="0" class="comentario-vacio">No hay comentarios aún. ¡Sé el primero!</li>';
      return;
    }

    comentarios.forEach(comentario => {
      const li = crearElementoComentario(comentario);
      listaComentarios.appendChild(li);
    });

  } catch (error) {
    mensajeError.textContent = 'No se pudieron cargar los comentarios. Intenta más tarde.';
    mensajeError.setAttribute('aria-hidden', 'false');
    console.error('renderComentarios:', error);
  }
}

/**
 * Muestra mensaje de error en UI
 * @param {string} mensaje 
 */
function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.setAttribute('aria-hidden', 'false');
  mensajeExito.setAttribute('aria-hidden', 'true');
}

/**
 * Muestra mensaje de éxito en UI
 * @param {string} mensaje 
 */
function mostrarExito(mensaje) {
  mensajeExito.textContent = mensaje;
  mensajeExito.setAttribute('aria-hidden', 'false');
  mensajeError.setAttribute('aria-hidden', 'true');
}

/**
 * Handler del submit del formulario
 * Valida datos, envía comentario a Airtable, actualiza UI y lista
 * @param {Event} event 
 */
async function handleSubmit(event) {
  event.preventDefault();

  const nombre = inputNombre.value.trim();
  const comentario = textareaComentario.value.trim();

  mensajeError.setAttribute('aria-hidden', 'true');
  mensajeExito.setAttribute('aria-hidden', 'true');

  // Validación básica
  if (!nombre) {
    mostrarError('Por favor ingresa tu nombre.');
    inputNombre.focus();
    return;
  }
  if (!comentario) {
    mostrarError('Por favor escribe un comentario.');
    textareaComentario.focus();
    return;
  }

  try {
    await addComentario({ nombre, comentario });
    mostrarExito('Comentario enviado con éxito.');
    formComentarios.reset();
    await renderComentarios();
  } catch (error) {
    mostrarError('Error al enviar el comentario. Intenta más tarde.');
  }
}

/**
 * Inicializa el sistema de comentarios:
 * - Añade listener submit formulario
 * - Renderiza comentarios iniciales
 * - Refresca automáticamente cada 2 minutos
 */
export function initComentarios() {
  if (!formComentarios || !listaComentarios) {
    console.warn('Elementos del DOM para comentarios no encontrados.');
    return;
  }

  formComentarios.addEventListener('submit', handleSubmit);

  renderComentarios();

  setInterval(() => {
    renderComentarios();
  }, 120000);
}

// Auto-inicializa cuando DOM está cargado
document.addEventListener('DOMContentLoaded', () => {
  initComentarios();
});
