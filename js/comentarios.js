// js/comentarios.js

/**
 * Módulo para la gestión de comentarios usando la API de Airtable.
 * La función de añadir comentarios se ha deshabilitado temporalmente para resolver un error.
 * La carga de comentarios existentes sigue activa.
 */

// Credenciales y configuración de la API de Airtable
const AIRTABLE_CONFIG = {
    BASE_ID: 'app45M30CM1ccXTau',
    TABLE_NAME: 'Comentarios',
    API_KEY: 'patju3fjNyKDBeCGp.68ab3d377eb0bbffeaeade69fedd53edbc3c8d3686bd66da85abfd9fc8a5251c'
};

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}`;

// Conexión con los elementos del DOM
const commentsList = document.getElementById('comments-list');
const commentForm = document.getElementById('comment-form');
const formStatus = commentForm.querySelector('.form-status');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');

// Headers de la petición API
const headers = {
    'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
    'Content-Type': 'application/json'
};

/**
 * Sanitiza una cadena de texto para prevenir ataques XSS básicos.
 * @param {string} text - El texto a sanitizar.
 * @returns {string} El texto sanitizado.
 */
function sanitizeInput(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Formatea la fecha de un comentario a un formato legible.
 * @param {string} dateString - La fecha en formato ISO.
 * @returns {string} La fecha formateada.
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

/**
 * Renderiza un comentario en la lista del DOM.
 * @param {object} comment - Objeto con los datos del comentario.
 */
function renderComment(comment) {
    const li = document.createElement('li');
    li.className = 'comment-item';
    li.setAttribute('role', 'listitem');
    li.innerHTML = `
        <p><strong>${sanitizeInput(comment.nombre)}</strong> <span class="comment-date">${formatDate(comment.fecha)}</span></p>
        <p>${sanitizeInput(comment.comentario)}</p>
        ${comment.likes > 0 ? `<span class="comment-likes" aria-label="${comment.likes} likes">❤️ ${comment.likes}</span>` : ''}
    `;
    commentsList.prepend(li);
}

/**
 * Obtiene y muestra los comentarios de Airtable.
 */
async function getComments() {
    commentsList.innerHTML = '';
    loadingMessage.style.display = 'block';
    errorMessage.style.display = 'none';

    try {
        const response = await fetch(`${AIRTABLE_URL}?view=Grid%20view&sort%5B0%5D%5Bfield%5D=fecha&sort%5B0%5D%5Bdirection%5D=desc`, { headers });
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        
        if (data.records && data.records.length > 0) {
            data.records.forEach(record => {
                const fields = record.fields;
                renderComment({
                    nombre: fields.nombre,
                    comentario: fields.comentario,
                    fecha: fields.fecha,
                    likes: fields.likes || 0
                });
            });
        } else {
            commentsList.innerHTML = '<p>Aún no hay comentarios. ¡Sé el primero en dejar uno!</p>';
        }
        
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        errorMessage.textContent = 'No se pudieron cargar los comentarios. Revisa la consola para más detalles.';
        errorMessage.style.display = 'block';
    } finally {
        loadingMessage.style.display = 'none';
    }
}

// Escucha el evento 'submit' del formulario
commentForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const nameInput = document.getElementById('comment-name').value.trim();
    const commentInput = document.getElementById('comment-text').value.trim();

    if (!nameInput || !commentInput) {
        formStatus.textContent = 'Por favor, rellena todos los campos.';
        formStatus.style.color = 'var(--color-home-rojo)';
        return;
    }

    formStatus.textContent = 'Gracias por tu interés. Por el momento, la sección de comentarios está en mantenimiento. Puedes enviar tu comentario por correo a <a href="mailto:tu-correo@ejemplo.com">tu-correo@ejemplo.com</a>';
    formStatus.style.color = 'var(--color-home-oro)';
    formStatus.classList.add('active'); // Opcional: para aplicar estilos específicos al mensaje
    
    // Aquí puedes añadir un código para resetear el formulario si lo deseas
    // commentForm.reset();
});

// Inicialización: Cargar los comentarios al inicio y refrescarlos cada 2 minutos
document.addEventListener('DOMContentLoaded', () => {
    getComments();
    setInterval(getComments, 120000); // 120000ms = 2 minutos
});
