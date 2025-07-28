// js/airtable.js

/**
 * Módulo para integración con Airtable API usando credenciales y estructura especificada.
 * 
 * Tablas:
 * - Comentarios: tbl8l3mdaCeLMNMTd
 * - Análisis:     tbl33EWQCSLp40EJH
 * 
 * Base ID y API Key son los reales proporcionados en el contexto,
 * se usan en constantes internas y no se exponen fuera de este módulo.
 */

/**
 * Configuración base
 */
const AIRTABLE_API_KEY = "key68ab3d377eb0bbffeaeade69fedd53edbc3c8d3686bd66da85abfd9fc8a5251c"; // Poner tu API Key real aquí
const AIRTABLE_BASE_ID = "app45M30CM1ccXTau"; // Base real
const API_BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const TABLE_COMENTARIOS = "tbl8l3mdaCeLMNMTd";  // Tabla Comentarios
const TABLE_ANALISIS = "tbl33EWQCSLp40EJH";    // Tabla Análisis

const DEFAULT_HEADERS = {
  "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json"
};

/**
 * Sanitiza entradas tipo texto simple
 * Escapa caracteres peligrosos para HTML y evita inyección sencilla
 * @param {string} str 
 * @returns {string}
 */
function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .trim();
}

/**
 * Manejo de errores genérico para respuestas fetch
 * @param {Response} response 
 * @returns Promise 
 */
async function handleFetchErrors(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      // Intentamos parsear JSON error para detallar
      const errObj = JSON.parse(errorText);
      if (errObj.error && errObj.error.message) {
        errorMessage += ` - ${errObj.error.message}`;
      }
    } catch {
      // No JSON, usamos texto plano
      errorMessage += ` - ${errorText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

/**
 * Obtener comentarios paginados (todos o con límite)
 * @param {Object} options Opciones paginación y filtrado
 * @param {number} options.pageSize Cantidad de registros por solicitud (máx 100)
 * @param {string} options.offset Token offset para paginación
 * @returns {Promise<{records: Array, offset: string|null}>} regresa registros y token offset si existe
 */
export async function fetchComentarios({ pageSize = 100, offset = null } = {}) {
  const url = new URL(`${API_BASE_URL}/${TABLE_COMENTARIOS}`);
  url.searchParams.set("pageSize", pageSize);
  if (offset) {
    url.searchParams.set("offset", offset);
  }
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: DEFAULT_HEADERS,
  });
  const data = await handleFetchErrors(response);
  return { records: data.records, offset: data.offset || null };
}

/**
 * Enviar un nuevo comentario a Airtable
 * @param {Object} commentData 
 * @param {string} commentData.nombre Nombre del autor
 * @param {string} commentData.correo Email o contacto
 * @param {string} commentData.comentario Texto del comentario
 * @returns {Promise<Object>} Registro creado en Airtable
 */
export async function addComentario({ nombre, correo, comentario }) {
  // Sanitizamos entradas
  const sanitizedNombre = sanitizeInput(nombre);
  const sanitizedCorreo = sanitizeInput(correo);
  const sanitizedComentario = sanitizeInput(comentario);

  // Validación básica
  if (!sanitizedNombre || !sanitizedComentario) {
    throw new Error("Nombre y comentario son obligatorios.");
  }

  const body = {
    fields: {
      "Nombre": sanitizedNombre,
      "Correo": sanitizedCorreo || "",
      "Comentario": sanitizedComentario
    }
  };

  const response = await fetch(`${API_BASE_URL}/${TABLE_COMENTARIOS}`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body),
  });

  const data = await handleFetchErrors(response);
  return data;
}

/**
 * Obtener análisis paginados (con filtros si se requiren)
 * @param {Object} options Opciones paginación y filtros
 * @param {number} options.pageSize Cantidad registros por solicitud (máx 100)
 * @param {string} options.offset Token offset para paginación
 * @param {string} options.filterFormula Fórmula para filtrar (opcional)
 * @returns {Promise<{records: Array, offset: string|null}>}
 */
export async function fetchAnalisis({ pageSize = 100, offset = null, filterFormula = "" } = {}) {
  const url = new URL(`${API_BASE_URL}/${TABLE_ANALISIS}`);
  url.searchParams.set("pageSize", pageSize);
  if (offset) url.searchParams.set("offset", offset);
  if (filterFormula) url.searchParams.set("filterByFormula", filterFormula);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: DEFAULT_HEADERS,
  });
  const data = await handleFetchErrors(response);
  return { records: data.records, offset: data.offset || null };
}

/**
 * HELPERS para trabajar con datos recibidos
 */

/**
 * Obtiene un listado limpio de comentarios sólo con campos importantes
 * @param {Array} records Array de registros Airtable
 * @returns {Array} Array de comentarios simplificados
 */
export function extractComentarios(records) {
  return records.map(record => ({
    id: record.id,
    nombre: record.fields.Nombre || "Anónimo",
    correo: record.fields.Correo || "",
    comentario: record.fields.Comentario || "",
    fecha: record.fields.Fecha ? new Date(record.fields.Fecha) : null,
  }));
}

/**
 * Obtiene un listado limpio de análisis con estructura definida
 * @param {Array} records Array de registros Airtable
 * @returns {Array} Array de análisis simplificados
 */
export function extractAnalisis(records) {
  return records.map(record => ({
    id: record.id,
    titulo: record.fields.Titulo || "Sin título",
    fecha: record.fields.Fecha || "",
    contexto: record.fields.Contexto || "",
    citaClave: record.fields.CitaClave || "",
    analisis: record.fields.Analisis || "",
    relevancia: record.fields.Relevancia || "",
    recomendacion: record.fields.Recomendacion || "",
  }));
}

/**
 * Nota importante:
 * - Usar estas funciones con await y try/catch para manejar errores.
 * - No exponer API Key públicamente en frontend sin proxy o entorno seguro.
 */

