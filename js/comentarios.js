// comentarios.js

/**
 * Módulo para gestionar la sección de comentarios integrados con Airtable
 * Uso único de las constantes y funciones
 */

const BASE_ID = 'app45M30CM1ccXTau';
const TABLE_COMENTARIOS = 'pagf41O43clXr44HT'; // Asegúrate que sea el ID correcto según tu Airtable
const API_KEY = 'patju3fjNyKDBeCGp.68ab3d377eb0bbffeaeade69fedd53edbc3c8d3686bd66da85abfd9fc8a5251c';

const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_COMENTARIOS}`;
const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

// Captura de elementos DOM (que existan una sola vez)
const formComentarios = document.getElementById('form-comentarios');
const listaComentarios = document.getElementById('lista-comentarios');
const mensajeError = document.getElementById('mensaje-error');
const mensajeExito = document.getElementById('mensaje-exito');
const inputNombre = document.getElementById('input-nombre');
const textareaComentario = document.getElementById('textarea-comentario');

/**
 * Sanitiza texto para evitar XSS (escape básico)
 * @param {string} str
 * @returns {string}
 */
function sanitizeText(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Obtiene comentarios desde Airtable ordenados por fecha descendente
 */
async function getComentarios() {
  try {
    const url = `${AIRTABLE_URL}?sort[0][field]=fecha&sort[0][direction]=desc`;
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) throw new Error(`Error al obtener comentarios: ${resp.status} ${resp.statusText}`);
    const data = await resp.json();

    return data.records.map(record => ({
      id: record.id,
      nombre: record.fields.nombre || 'Anónimo',
      comentario: record.fields.comentario || '',
      fecha: record.fields.fecha || record.createdTime,
      likes: Number(record.fields.likes) || 0,
    }));
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * Envía un nuevo comentario a Airtable
 * @param {{nombre:string, comentario:string}} data 
 */
async function addComentario(data) {
  const nombre = (data.nombre || '').trim();
  const comentario = (data.comentario || '').trim();

  if (!nombre) throw new Error('El nombre es obligatorio.');
  if (!comentario) throw new Error('El comentario no puede estar vacío.');

  const safeNombre = sanitizeText(nombre);
  const safeComentario = sanitizeText(comentario);

  const body = {
    records: [{
      fields: {
        nombre: safeNombre,
        comentario: safeComentario,
        fecha: new Date().toISOString(),
        likes: 0
      }
    }]
  };

  const resp = await fetch(AIRTABLE_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Error al enviar comentario: ${resp.status} ${resp.statusText} - ${errText}`);
  }
  return await resp.json();
}

/**
 * Crea un elemento <li> para mostrar comentario con animación
 */
function crearElementoComentario({ nombre, comentario, fecha, likes }) {
  const li = document.createElement('li');
  li.classList.add('comentario-item');
  li.style.opacity = '0';
  li.style.transform = 'translateY(10px)';
  li.setAttribute('tabindex', '0');

  const fechaFormateada = fecha ? new Date(fecha).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : '';

  li.innerHTML = `
    <p class="comentario-texto">${comentario}</p>
    <p class="comentario-meta">
      — ${nombre} ${likes > 0 ? `| ❤️ ${likes}` : ''} ${fechaFormateada ? `| <time datetime="${fecha}">${fechaFormateada}</time>` : ''}
    </p>
  `;

  requestAnimationFrame(() => {
    li.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    li.style.opacity = '1';
    li.style.transform = 'translateY(0)';
  });

  return li;
}

/**
 * Muestra mensaje de error
 */
function mostrarError(msg) {
  mensajeError.textContent = msg;
  mensajeError.setAttribute('aria-hidden', 'false');
  mensajeExito.setAttribute('aria-hidden', 'true');
}

/**
 * Muestra mensaje de éxito
 */
function mostrarExito(msg) {
  mensajeExito.textContent = msg;
  mensajeExito.setAttribute('aria-hidden', 'false');
  mensajeError.setAttribute('aria-hidden', 'true');
}

/**
 * Limpia mensajes
 */
function limpiarMensajes() {
  mensajeError.setAttribute('aria-hidden', 'true');
  mensajeExito.setAttribute('aria-hidden', 'true');
}

/**
 * Renderiza los comentarios en la UI
 */
async function renderComentarios() {
  try {
    limpiarMensajes();
    listaComentarios.innerHTML = '';
    const comentarios = await getComentarios();

    if (comentarios.length === 0) {
      listaComentarios.innerHTML = '<li tabindex="0" class="comentario-vacio">No hay comentarios aún. ¡Sé el primero!</li>';
      return;
    }

    comentarios.forEach(c => {
      listaComentarios.appendChild(crearElementoComentario(c));
    });

  } catch (error) {
    mostrarError('No se pudieron cargar los comentarios. Intenta más tarde.');
    console.error(error);
  }
}

/**
 * Evento submit del formulario
 */
async function handleSubmit(event) {
  event.preventDefault();
  limpiarMensajes();

  const nombre = inputNombre.value.trim();
  const comentario = textareaComentario.value.trim();

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
  } catch (e) {
    mostrarError('Error al enviar el comentario. Intenta más tarde.');
    console.error(e);
  }
}

/**
 * Inicializa la funcionalidad de comentarios
 */
export function initComentarios() {
  if (!formComentarios || !listaComentarios) {
    console.warn('Elementos DOM para comentarios no encontrados');
    return;
  }
  formComentarios.addEventListener('submit', handleSubmit);
  renderComentarios();
  setInterval(renderComentarios, 120000); // refresco cada 2 minutos
}

document.addEventListener('DOMContentLoaded', () => {
  initComentarios();
});

const BASE_ID = 'app45M30CM1ccXTau';
const TABLE_COMENTARIOS = 'pagf41O43clXr44HT'; // Actualiza si el ID es otro
const API_KEY = 'patju3fjNyKDBeCGp.68ab3d377eb0bbffeaeade69fedd53edbc3c8d3686bd66da85abfd9fc8a5251c';

const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_COMENTARIOS}`;
const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

const formComentarios = document.getElementById('form-comentarios');
const listaComentarios = document.getElementById('lista-comentarios');
const mensajeError = document.getElementById('mensaje-error');
const mensajeExito = document.getElementById('mensaje-exito');
const inputNombre = document.getElementById('input-nombre');
const textareaComentario = document.getElementById('textarea-comentario');

function sanitizeText(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function getComentarios() {
  try {
    const url = `${AIRTABLE_URL}?sort[0][field]=fecha&sort[0][direction]=desc`;
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) throw new Error(`Error al obtener comentarios: ${response.status} ${response.statusText}`);
    const data = await response.json();
    return data.records.map(rec => ({
      id: rec.id,
      nombre: rec.fields.nombre || 'Anónimo',
      comentario: rec.fields.comentario || '',
      fecha: rec.fields.fecha || rec.createdTime,
      likes: rec.fields.likes || 0,
    }));
  } catch (error) {
    console.error('getComentarios:', error);
    throw error;
  }
}

async function addComentario({ nombre, comentario }) {
  if (!nombre || !comentario) throw new Error('Nombre y comentario son requeridos');

  const safeNombre = sanitizeText(nombre.trim());
  const safeComentario = sanitizeText(comentario.trim());

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

  const response = await fetch(AIRTABLE_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al enviar comentario: ${response.status} ${response.statusText} - ${text}`);
  }

  return await response.json();
}

function mostrarError(msg) {
  mensajeError.textContent = msg;
  mensajeError.style.display = 'block';
  mensajeExito.style.display = 'none';
}

function mostrarExito(msg) {
  mensajeExito.textContent = msg;
  mensajeExito.style.display = 'block';
  mensajeError.style.display = 'none';
}

function limpiarMensajes() {
  mensajeError.style.display
