const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');
const { parse } = require('json2csv');
const path = require('path');

// Cargar las variables de entorno desde .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function exportReport() {
    console.log('📦 Exportando reporte de administradores...');

    // 1. Obtener todos los usuarios
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

    if (usersError) {
        console.error('❌ Error al obtener usuarios:', usersError);
        return;
    }

    // 2. Obtener todas las evaluaciones completadas
    const { data: evals, error: evalsError } = await supabase
        .from('evaluaciones_completadas')
        .select('evaluador_id, evaluado_id');

    if (evalsError) {
        console.error('❌ Error al obtener evaluaciones:', evalsError);
        return;
    }

    // 3. Procesar las evaluaciones para saber quiénes tienen autoevaluación y quiénes han sido evaluados por otro
    const autoevaluados = new Set();
    const evaluadosPorOtro = new Set();

    evals.forEach(e => {
        if (e.evaluador_id === e.evaluado_id) {
            autoevaluados.add(e.evaluado_id);
        } else {
            evaluadosPorOtro.add(e.evaluado_id);
        }
    });

    // 4. Crear un mapa de usuarios por nombre para poder buscar el correo del jefe
    const usersByName = {};
    users.forEach(u => {
        if (u.nombre) {
            // Normalizar el nombre para comparaciones limpias
            const normalizedName = u.nombre.trim().toLowerCase();
            usersByName[normalizedName] = u;
        }
    });

    // 5. Construir las filas del reporte
    const rows = users.map(user => {
        let correoJefe = '';

        // Si el usuario tiene un jefe asignado, buscamos su correo usando el mapa
        if (user.jefe) {
            const normalizedJefeName = user.jefe.trim().toLowerCase();
            const jefeObj = usersByName[normalizedJefeName];
            if (jefeObj && jefeObj.correo) {
                correoJefe = jefeObj.correo;
            }
        }

        // Definimos las columnas solicitadas
        return {
            'Nombre': user.nombre || '',
            'Puesto': user.puesto || '',
            'País': user.pais || '',
            'Departamento': user.departamento || '',
            'Jefe': user.jefe || '',
            'Correo del usuario': user.correo || '',
            'Correo Jefe': correoJefe,
            'Autoevaluacion(si/no)': autoevaluados.has(user.id) ? 'Si' : 'No',
            'Evaluado(si/no)': evaluadosPorOtro.has(user.id) ? 'Si' : 'No'
        };
    });

    // 6. Configurar la exportación del CSV y escribir el archivo
    const outputDir = path.resolve(__dirname, '../output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvData = parse(rows, {
        fields: [
            'Nombre', 
            'Puesto', 
            'País', 
            'Departamento', 
            'Jefe', 
            'Correo del usuario', 
            'Correo Jefe', 
            'Autoevaluacion(si/no)', 
            'Evaluado(si/no)'
        ],
        withBOM: true // Incluye BOM para que Excel lea correctamente los acentos
    });

    const outputPath = path.join(outputDir, 'Reporte_Visualizador.csv');
    fs.writeFileSync(outputPath, csvData);

    console.log(`✅ ¡Reporte exportado exitosamente con ${rows.length} registros!`);
    console.log(`📂 Ubicación del archivo: ${outputPath}`);
}

// Ejecutar script
exportReport().catch(err => {
    console.error('❌ Ha ocurrido un error inesperado:', err);
});
