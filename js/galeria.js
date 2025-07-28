// js/galeria.js

/**
 * Módulo para galería de documentos con:
 * - Visualizador PDFs e imágenes (side-by-side cuando aplica)
 * - Búsqueda por fecha y palabra clave con filtrado eficiente
 * - Animaciones suaves para transiciones entre documentos
 * - Diseño responsive y mobile friendly
 * 
 * Uso esperado:
 * - Documentos tienen metadata: fecha, título, tipo (pdf/image), url
 * - Contenedor con id="galeria-container"
 * - Inputs para búsqueda: id="busqueda-fecha" y id="busqueda-texto"
 * - Navegación (prev/next) para cambiar documento visible
 */

(() => {
  // Estado interno
  let documentos = []; // Lista completa de documentos cargados
  let documentosFiltrados = []; // Lista filtrada
  let indiceActual = 0;

  // Elementos DOM
  let contGaleria;
  let inputFecha;
  let inputTexto;
  let btnPrev;
  let btnNext;
  let contDocumento;

  // Inicialización al cargar DOM
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    contGaleria = document.getElementById('galeria-container');
    inputFecha = document.getElementById('busqueda-fecha');
    inputTexto = document.getElementById('busqueda-texto');
    btnPrev = document.getElementById('btn-prev');
    btnNext = document.getElementById('btn-next');
    contDocumento = document.getElementById('contenedor-documento');

    if (!contGaleria || !inputFecha || !inputTexto || !contDocumento) {
      console.warn('Galería: faltan elementos DOM necesarios');
      return;
    }

    // Listeners búsqueda y navegación
    inputFecha.addEventListener('input', filtrarDocumentosDebounced);
    inputTexto.addEventListener('input', filtrarDocumentosDebounced);
    btnPrev.addEventListener('click', mostrarPrevDocumento);
    btnNext.addEventListener('click', mostrarNextDocumento);

    // Inicializamos debounce para búsqueda
    filtrarDocumentosDebounced = debounce(filtrarDocumentos, 300);

    // Simulación o llamada para cargar documentos (debe ser reemplazada por fetch o data real)
    cargarDocumentosDemo();
  }

  // Función demo que carga documentos estáticos (puedes adaptar la carga real)
  function cargarDocumentosDemo() {
    documentos = [
      {
        id: 'doc1',
        titulo: 'Discurso en la ONU (1960)',
        fecha: '1960-09-26',
        tipo: 'pdf',
        urlPdf: 'assets/docs/discurso-onu-1960.pdf',
        urlImagen: 'assets/images/thumbs/discurso-onu-1960.jpg',
        palabrasClave: 'ONU, discurso, 1960, Fidel Castro, política',
      },
      {
        id: 'doc2',
        titulo: 'Foto archivo Fidel y Che en México',
        fecha: '1956-11-25',
        tipo: 'image',
        urlImagen: 'assets/images/photos/fidel-che-mexico.jpg',
        palabrasClave: 'Fidel, Che, México, encuentro, revolución',
      },
      {
        id: 'doc3',
        titulo: 'Reflexiones de Compañero Fidel (2010)',
        fecha: '2010-05-10',
        tipo: 'pdf',
        urlPdf: 'assets/docs/reflexiones-fidel-2010.pdf',
        urlImagen: 'assets/images/thumbs/reflexiones-fidel-2010.jpg',
        palabrasClave: 'reflexión, fidel, 2010, filosofía, política',
      }
      // Más documentos agregados acá
    ];

    // Inicializamos filtro completo y mostramos primero
    documentosFiltrados = documentos.slice();
    indiceActual = 0;
    mostrarDocumentoActual();
    actualizarNavegacion();
  }

  // Debounce utility
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Filtrado documentos por fecha y texto
  function filtrarDocumentos() {
    const fechaVal = inputFecha.value.trim();
    const textoVal = inputTexto.value.trim().toLowerCase();

    documentosFiltrados = documentos.filter(doc => {
      let matchFecha = true;
      let matchTexto = true;

      if (fechaVal) {
        // Comparación simple: acepta documentos con fecha igual o posterior
        matchFecha = doc.fecha >= fechaVal;
      }
      if (textoVal) {
        const textoBusqueda = textoVal;
        // Buscar en título y palabras clave
        matchTexto =
          doc.titulo.toLowerCase().includes(textoBusqueda) ||
          (doc.palabrasClave && doc.palabrasClave.toLowerCase().includes(textoBusqueda));
      }
      return matchFecha && matchTexto;
    });

    indiceActual = 0;
    mostrarDocumentoActual();
    actualizarNavegacion();
  }

  // Muestra el documento actual en contenedor con animación
  function mostrarDocumentoActual() {
    if (documentosFiltrados.length === 0) {
      contDocumento.innerHTML = `<p class="sin-resultados" tabindex="0">No se encontraron documentos que coincidan con la búsqueda.</p>`;
      btnPrev.disabled = true;
      btnNext.disabled = true;
      return;
    }

    const doc = documentosFiltrados[indiceActual];

    const contenidoHtml = generarHtmlDocumento(doc);

    // Para animación de transición
    contDocumento.style.opacity = 0;
    setTimeout(() => {
      contDocumento.innerHTML = contenidoHtml;
      contDocumento.style.opacity = 1;
    }, 300);
  }

  // Genera HTML para mostrar el documento (visualizador pdf + imagen side-by-side si aplica)
  function generarHtmlDocumento(doc) {
    let html = `<h3 tabindex="0">${escapeHtml(doc.titulo)}</h3><p tabindex="0">Fecha: ${escapeHtml(doc.fecha)}</p>`;

    if (doc.tipo === 'pdf') {
      // Mostramos imagen preview al lado + iframe con PDF si espacio suficiente
      html += `<div class="doc-visualizador">`;

      // Imagen preview (miniatura)
      if (doc.urlImagen) {
        html += `<img src="${escapeHtml(doc.urlImagen)}" alt="Vista previa de ${escapeHtml(doc.titulo)}" class="doc-prev-img" />`;
      }

      // Viewer PDF embebido con fallback enlace externo
      html += `
        <iframe src="${escapeHtml(doc.urlPdf)}#view=fitH" class="doc-pdf-viewer" title="PDF del documento ${escapeHtml(doc.titulo)}" loading="lazy" aria-label="Visor PDF"></iframe>
        <p class="pdf-descargar"><a href="${escapeHtml(doc.urlPdf)}" target="_blank" rel="noopener noreferrer">Abrir PDF en pestaña nueva</a></p>
      `;

      html += `</div>`;
    }
    else if(doc.tipo === 'image') {
      // Simple imagen grande responsive
      html += `<img src="${escapeHtml(doc.urlImagen)}" alt="${escapeHtml(doc.titulo)}" class="doc-image" loading="lazy"/>`;
    }
    else {
      html += `<p tabindex="0">Tipo de documento no soportado.</p>`;
    }

    return html;
  }

  // Escapa html para evitar XSS en texto mostrado (simple)
  function escapeHtml(string) {
    return String(string)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Navegación: mostrar documento anterior
  function mostrarPrevDocumento() {
    if (indiceActual > 0) {
      indiceActual--;
      mostrarDocumentoActual();
      actualizarNavegacion();
    }
  }

  // Navegación: mostrar documento siguiente
  function mostrarNextDocumento() {
    if (indiceActual < documentosFiltrados.length - 1) {
      indiceActual++;
      mostrarDocumentoActual();
      actualizarNavegacion();
    }
  }

  // Actualiza estado botones navegación
  function actualizarNavegacion() {
    btnPrev.disabled = indiceActual <= 0;
    btnNext.disabled = indiceActual >= documentosFiltrados.length -1;
  }

  // Exportamos nada porque modo IIFE; si fuera módulo usar export { ... }
})();
