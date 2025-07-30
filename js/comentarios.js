// comentarios.js

/**
 * Módulo para gestionar la sección de comentarios integrados con Airtable
 * - Conexión a Airtable usando API Key y tabla específica
 * - Funciones async para obtener y agregar comentarios
 * - Validación y sanitización básica para evitar XSS
 * - Animaciones al mostrar/agregar comentarios
 * - Manejo errores con mensajes visibles y logs
 * - Refresco automático cada 2 minutos
 * - Modular ES6 compatible con import/export
 * - Integración con DOM: formulario y lista en index.html
 */

const BASE_ID = 'app45M30CM1ccXTau';
const TABLE_COMENTARIOS = 'tbl8l3mdaCeLMNMTd';
const API_KEY = 'patju3fjNyKDBeCGp.68ab3d377eb0bbffeaeade69fedd53edbc3c8d3686bd66da85abfd9fc8a5251c';

// URL base Airtable API para comentarios
const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_COMENTARIOS}`;

// Encabezados para las peticiones fetch
const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

// ---------------------------------------
// Función para obtener comentarios desde Airtable
// Ordena por campo 'fecha' descendente (asumiendo campo creado_at o fecha disponible)
// ---------------------------------------
export async function getComentarios() {
  try {
    const url = `${AIRTABLE_URL}?sort[0][field]=fecha&sort[0][direction]=desc`;
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) {
      throw new Error(`Error al obtener comentarios: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    // Mapear datos a formato utilizable
    // Asumimos que los campos son: nombre (string), comentario (string), fecha (ISO string o fecha Airtable)
    return data.records.map(record => ({
      id: record.id,
      nombre: record.fields.nombre || 'Anónimo',
      comentario: record.fields.comentario || '',
      fecha: record.fields.fecha || record.createdTime || '',
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ---------------------------------------
// Función para sanitizar texto simple (escape básico de caracteres HTML)
// ---------------------------------------
function sanitizeText(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------
// Función para agregar un nuevo comentario a Airtable
// data = { nombre: string, comentario: string }
// ---------------------------------------
export async function addComentario(data) {
  const nombre = (data.nombre || '').trim();
  const comentario = (data.comentario || '').trim();

  // Validación básica: campos obligatorios
  if (!nombre) throw new Error('El nombre es obligatorio.');
  if (!comentario) throw new Error('El comentario no puede estar vacío.');

  // Sanitización
  const safeNombre = sanitizeText(nombre);
  const safeComentario = sanitizeText(comentario);

  const body = {
    records: [
      {
        fields: {
          nombre: safeNombre,
          comentario: safeComentario,
          fecha: new Date().toISOString(),
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
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ---------------------------------------
// DOM Elements
// ---------------------------------------
const formComentarios = document.getElementById('form-comentarios');
const listaComentarios = document.getElementById('lista-comentarios');
const mensajeError = document.getElementById('mensaje-error');
const mensajeExito = document.getElementById('mensaje-exito');
const inputNombre = document.getElementById('input-nombre');
const textareaComentario = document.getElementById('textarea-comentario');

// ---------------------------------------
// Función para crear un elemento li de comentario con animación
// ---------------------------------------
function crearElementoComentario({ nombre, comentario, fecha }) {
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
    minute: '2-digit',
  }) : '';

  li.innerHTML = `
    <p class="comentario-texto">${comentario}</p>
    <p class="comentario-meta">— ${nombre} ${fechaFormateada ? `| <time datetime="${fecha}">${fechaFormateada}</time>` : ''}</p>
  `;

  // Animación fade-in + slide-up
  requestAnimationFrame(() => {
    li.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    li.style.opacity = '1';
    li.style.transform = 'translateY(0)';
  });

  return li;
}

// ---------------------------------------
// Función para renderizar lista de comentarios en DOM
// ---------------------------------------
export async function renderComentarios() {
  try {
    // Limpiar lista
    listaComentarios.innerHTML = '';
    mensajeError.setAttribute('aria-hidden', 'true');
    mensajeExito.setAttribute('aria-hidden', 'true');

    const comentarios = await getComentarios();

    if (comentarios.length === 0) {
      listaComentarios.innerHTML = '<li tabindex="0" class="comentario-vacio">No hay comentarios aún. ¡Sé el primero!</li>';
      return;
    }

    comentarios.forEach(entry => {
      const li = crearElementoComentario(entry);
      listaComentarios.appendChild(li);
    });
  } catch (error) {
    mensajeError.textContent = 'No se pudieron cargar los comentarios. Intenta más tarde.';
    mensajeError.setAttribute('aria-hidden', 'false');
  }
}

// ---------------------------------------
// Función para mostrar mensaje de error durante tiempo limitado
// ---------------------------------------
function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.setAttribute('aria-hidden', 'false');
  mensajeExito.setAttribute('aria-hidden', 'true');
}

// ---------------------------------------
// Función para mostrar mensaje de éxito durante tiempo limitado
// ---------------------------------------
function mostrarExito(mensaje) {
  mensajeExito.textContent = mensaje;
  mensajeExito.setAttribute('aria-hidden', 'false');
  mensajeError.setAttribute('aria-hidden', 'true');
}

// ---------------------------------------
// Manejar evento submit del formulario
// ---------------------------------------
async function handleSubmit(event) {
  event.preventDefault();

  const nombre = inputNombre.value.trim();
  const comentario = textareaComentario.value.trim();

  mensajeError.setAttribute('aria-hidden', 'true');
  mensajeExito.setAttribute('aria-hidden', 'true');

  // Validación frontend
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
    // Añadir comentario a Airtable
    await addComentario({ nombre, comentario });

    mostrarExito('Comentario enviado con éxito.');

    // Limpiar formulario
    formComentarios.reset();

    // Recargar lista de comentarios actualizada
    await renderComentarios();
  } catch (error) {
    mostrarError('Error al enviar el comentario. Intenta más tarde.');
  }
}

// ---------------------------------------
// Inicialización: añadir listener y cargar comentarios
// ---------------------------------------
export function initComentarios() {
  if (!formComentarios || !listaComentarios) {
    console.warn('Elementos del DOM para comentarios no encontrados.');
    return;
  }

  formComentarios.addEventListener('submit', handleSubmit);

  // Cargar comentarios iniciales
  renderComentarios();

  // Refrescar cada 2 minutos (120000 ms)
  setInterval(() => {
    renderComentarios();
  }, 120000);
}

// Auto-inicializa cuando se carga el módulo y DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  initComentarios();
});
