// Configuración de Airtable
const AIRTABLE_API_KEY = "patju3fjNyKDBeCGp.68ab3d377eb0bbffeaeade69fedd53edbc3c8d3686bd66da85abfd9fc8a5251c";
const BASE_ID = "app30CM1ccXTau";
const COMENTARIOS_TABLE = "Comentarios";
const ANALISIS_TABLE = "Análisis";

// Headers para las solicitudes
const headers = {
    "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
    "Content-Type": "application/json"
};

// Funciones para interactuar con Airtable

/**
 * Obtiene comentarios validados
 * @returns {Promise<Array>} Lista de comentarios
 */
export async function getComentarios() {
    try {
        const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${COMENTARIOS_TABLE}?filterByFormula=Validado=1&view=Grid%20view`, {
            headers
        });
        
        if (!response.ok) throw new Error('Error al obtener comentarios');
        
        const data = await response.json();
        return data.records.map(record => ({
            id: record.id,
            ...record.fields
        }));
    } catch (error) {
        console.error('Error en getComentarios:', error);
        return [];
    }
}

/**
 * Envía un nuevo comentario
 * @param {Object} commentData - Datos del comentario
 * @returns {Promise<Object>} Respuesta de Airtable
 */
export async function postComentario(commentData) {
    try {
        const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${COMENTARIOS_TABLE}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                fields: {
                    Nombre: commentData.name,
                    Email: commentData.email || '',
                    Texto: commentData.comment,
                    Fecha: new Date().toISOString().split('T')[0],
                    Likes: 0,
                    Validado: 0
                }
            })
        });
        
        if (!response.ok) throw new Error('Error al enviar comentario');
        
        return await response.json();
    } catch (error) {
        console.error('Error en postComentario:', error);
        throw error;
    }
}

/**
 * Incrementa el contador de likes de un comentario
 * @param {string} commentId - ID del comentario
 * @returns {Promise<Object>} Respuesta de Airtable
 */
export async function likeComentario(commentId) {
    try {
        // Primero obtenemos el comentario para conocer el conteo actual de likes
        const getResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${COMENTARIOS_TABLE}/${commentId}`, {
            headers
        });
        
        if (!getResponse.ok) throw new Error('Error al obtener comentario');
        
        const commentData = await getResponse.json();
        const currentLikes = commentData.fields.Likes || 0;
        
        // Actualizamos el conteo de likes
        const updateResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${COMENTARIOS_TABLE}/${commentId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                fields: {
                    Likes: currentLikes + 1
                }
            })
        });
        
        if (!updateResponse.ok) throw new Error('Error al actualizar likes');
        
        return await updateResponse.json();
    } catch (error) {
        console.error('Error en likeComentario:', error);
        throw error;
    }
}

// Otras funciones para la tabla de Análisis...