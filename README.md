# Página Conmemorativa del 99° Natalicio de Fidel Castro

## Instrucciones de Despliegue en GitHub Pages

1. **Crear un repositorio en GitHub**:
   - Crea un nuevo repositorio en tu cuenta de GitHub
   - Nombre: `natalicio-fidel-castro` (o el nombre que prefieras)

2. **Subir los archivos**:
   - Clona el repositorio a tu máquina local
   - Copia todos los archivos de este proyecto en la carpeta del repositorio
   - Realiza un commit y push de los cambios

3. **Configurar GitHub Pages**:
   - Ve a la configuración del repositorio (Settings)
   - En la sección "Pages" (en el menú lateral izquierdo)
   - En "Branch", selecciona la rama `main` y la carpeta `/docs` o `/ (root)`
   - Guarda los cambios

4. **Esperar el despliegue**:
   - GitHub Pages puede tardar unos minutos en desplegar el sitio
   - La URL será: `https://<tu-usuario>.github.io/<nombre-repositorio>`

5. **Configurar Airtable** (Opcional):
   - Si deseas usar la integración con Airtable, crea una base con las tablas:
     - Comentarios (campos: Nombre, Email, Texto, Fecha, Likes, Validado)
     - Análisis (campos: Título, Descripción, Categoría, Archivo, Fecha)
   - Actualiza `AIRTABLE_API_KEY` y `BASE_ID` en `js/airtable.js`

## Requisitos Técnicos

- Compatible con navegadores modernos (Chrome, Firefox, Safari)
- Diseño responsive (mobile-first)
- Puntuación Lighthouse >90
- Accesibilidad AA compliance

## Estructura de Archivos
