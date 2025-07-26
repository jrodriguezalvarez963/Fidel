// Galería interactiva para la sección de análisis
export function initGallery() {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;
    
    // Simulamos datos de documentos (en producción vendrían de Airtable)
    const documents = [
        {
            id: 1,
            title: "Discurso en la ONU (1960)",
            description: "Pronunciado el 26 de septiembre de 1960, este discurso es una pieza fundamental para comprender la postura de la Cuba revolucionaria ante el mundo.",
            category: "discursos",
            image: "assets/images/discurso-onu-1960.jpg"
        },
        {
            id: 2,
            title: "Fidel en México (1956)",
            description: "La estancia de Fidel Castro en México entre 1955 y 1956 fue un periodo de gestación crucial para la Revolución.",
            category: "fotografias",
            image: "assets/images/foto-mexico-1956.jpg"
        },
        // ... más documentos
    ];
    
    // Generar HTML para la galería
    let galleryHTML = '';
    
    documents.forEach(doc => {
        galleryHTML += `
            <div class="book-card rounded-lg" data-category="${doc.category}">
                <h3 class="text-xl font-bold mb-3">${doc.title}</h3>
                <p class="text-gray-700 mb-4">${doc.description}</p>
                <div class="relative">
                    <img src="${doc.image}" alt="${doc.title}" class="w-full h-48 object-cover rounded mb-2 cursor-zoom-in" id="zoom-image-${doc.id}">
                    <div class="zoom-lens hidden"></div>
                </div>
                <div class="flex justify-between mt-4">
                    <button class="view-document px-4 py-2 bg-[#2E5E4E] text-white rounded hover:bg-[#1e4e3e] transition">
                        Ampliar
                    </button>
                    <button class="download-document px-4 py-2 bg-[#800020] text-white rounded hover:bg-[#700010] transition">
                        Descargar
                    </button>
                </div>
            </div>
        `;
    });
    
    galleryContainer.innerHTML = galleryHTML;
    
    // Eventos para los botones
    document.querySelectorAll('.view-document').forEach(btn => {
        btn.addEventListener('click', () => {
            const docId = btn.closest('.book-card').querySelector('img').id.split('-')[2];
            openDocumentModal(docId);
        });
    });
    
    document.querySelectorAll('.download-document').forEach(btn => {
        btn.addEventListener('click', () => {
            const docId = btn.closest('.book-card').querySelector('img').id.split('-')[2];
            downloadDocument(docId);
        });
    });
}

function openDocumentModal(docId) {
    // Lógica para abrir un modal con el documento
    console.log(`Abriendo documento: ${docId}`);
    // En una implementación real, esto cargaría el documento desde Airtable
    // y mostraría un modal con opciones de zoom y descarga
    
    // Implementación básica de zoom
    const img = document.getElementById(`zoom-image-${docId}`);
    if (img) {
        img.classList.toggle('scale-150');
        img.classList.toggle('origin-top-left');
    }
}

function downloadDocument(docId) {
    // Lógica para descargar el documento
    console.log(`Descargando documento: ${docId}`);
    // En una implementación real, esto redirigiría a la URL de descarga de Airtable
    
    // Simulación de descarga
    alert(`Iniciando descarga del documento ${docId}`);
}