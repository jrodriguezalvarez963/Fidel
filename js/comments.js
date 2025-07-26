import { getComentarios, postComentario, likeComentario } from './airtable.js';

// Inicializar el formulario de comentarios
export function initCommentForm() {
    const commentForm = document.getElementById('comment-form');
    
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const comment = document.getElementById('comment').value.trim();
            
            if (!name || !comment) {
                alert('Por favor completa los campos requeridos');
                return;
            }
            
            try {
                // Mostrar estado de carga
                const submitBtn = commentForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Enviando...';
                submitBtn.disabled = true;
                
                // Enviar comentario a Airtable
                await postComentario({ name, email, comment });
                
                // Resetear formulario
                commentForm.reset();
                
                // Actualizar lista de comentarios
                await loadComments();
                
                // Mostrar mensaje de éxito
                alert('¡Gracias por tu comentario! Será revisado antes de publicarse.');
            } catch (error) {
                console.error('Error al enviar comentario:', error);
                alert('Ocurrió un error al enviar tu comentario. Por favor intenta nuevamente.');
            } finally {
                // Restaurar estado del botón
                const submitBtn = commentForm.querySelector('button[type="submit"]');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Cargar y mostrar comentarios
export async function loadComments() {
    const commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) return;
    
    // Mostrar estado de carga
    commentsContainer.innerHTML = `
        <div class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style="border-color: var(--rojo-revolucion);"></div>
            <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando comentarios...</p>
        </div>
    `;
    
    try {
        // Obtener comentarios de Airtable
        const comments = await getComentarios();
        
        // Ordenar por fecha (más recientes primero)
        comments.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
        
        // Generar HTML para los comentarios
        if (comments.length === 0) {
            commentsContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-600 dark:text-gray-400">No hay comentarios aún. ¡Sé el primero en compartir tu reflexión!</p>
                </div>
            `;
            return;
        }
        
        let commentsHTML = `
            <h3 class="text-2xl font-bold mb-6" style="color: var(--azul-revolucion);">Reflexiones Recientes</h3>
            <div class="space-y-6">
        `;
        
        comments.forEach(comment => {
            const date = new Date(comment.Fecha);
            const formattedDate = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            commentsHTML += `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h4 class="font-bold text-lg">${comment.Nombre}</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${formattedDate}</p>
                        </div>
                        <button class="like-btn flex items-center space-x-1 text-gray-500 hover:text-red-500 transition" data-id="${comment.id}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                            </svg>
                            <span>${comment.Likes || 0}</span>
                        </button>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300">${comment.Texto}</p>
                </div>
            `;
        });
        
        commentsHTML += `</div>`;
        commentsContainer.innerHTML = commentsHTML;
        
        // Agregar eventos a los botones de like
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const commentId = btn.getAttribute('data-id');
                const likesSpan = btn.querySelector('span');
                const currentLikes = parseInt(likesSpan.textContent);
                
                try {
                    // Actualizar UI inmediatamente
                    likesSpan.textContent = currentLikes + 1;
                    btn.disabled = true;
                    
                    // Enviar like a Airtable
                    await likeComentario(commentId);
                } catch (error) {
                    console.error('Error al dar like:', error);
                    likesSpan.textContent = currentLikes; // Revertir en caso de error
                }
            });
        });
    } catch (error) {
        console.error('Error al cargar comentarios:', error);
        commentsContainer.innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500">Error al cargar los comentarios. Por favor intenta recargar la página.</p>
            </div>
        `;
    }
}
