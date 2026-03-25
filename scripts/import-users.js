//require('dotenv').config({ path: '../.env.local' }); // Cargar .env.local si se ejecuta en /scripts
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;



if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_URL === 'TU_SUPABASE_URL') {
    console.warn("⚠️  ADVERTENCIA: Asegúrate de configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Ruta del archivo CSV
const CSV_PATH = path.join(__dirname, '../input/usuarios-tritech.csv');

// Función para pausar la ejecución (delay)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function importUsers() {
    const usersToImport = [];

    if (!fs.existsSync(CSV_PATH)) {
        console.error(`[ERROR FATAL] No se encontró el archivo CSV en la ruta: ${CSV_PATH}`);
        return;
    }

    console.log(`Leyendo archivo CSV desde: ${CSV_PATH}...`);

    // 1. Leer el CSV
    fs.createReadStream(CSV_PATH)
        // 1. Reemplaza la parte del .pipe(csv()) por esto:
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') // Limpia espacios y el BOM de Excel
        }))
        .on('data', (row) => {
            // Debug para ver si ya se separaron
            console.log('Fila procesada:', row);

            // Verificamos que existan las propiedades después de la limpieza
            if (row.email && row.password) {
                usersToImport.push(row);
            } else {
                console.warn('⚠️ Fila ignorada por falta de email o password:', row);
            }
        })
        .on('end', async () => {
            console.log(`Se encontraron ${usersToImport.length} usuarios válidos en el CSV. Iniciando importación...`);

            // 2. Procesar secuencialmente con for...of
            for (const user of usersToImport) {
                const {
                    email,
                    password,
                    full_name,
                    codigo,
                    pais,
                    departamento,
                    puesto,
                    jefe,
                    puesto_id
                } = user;

                try {
                    const { data, error } = await supabase.auth.admin.createUser({
                        email: email.trim(),
                        password: password.trim(),
                        email_confirm: true, // Configurado para saltar la verificación por correo
                        user_metadata: {
                            full_name: full_name?.trim(),
                            codigo: codigo?.trim(),
                            pais: pais?.trim(),
                            departamento: departamento?.trim(),
                            puesto: puesto?.trim(),
                            jefe: jefe?.trim(),
                            puesto_id: puesto_id?.trim()
                        }
                    });

                    if (error) {
                        console.error(`[ERROR] ${email}: ${error.message}`);
                    } else {
                        console.log(`[OK] Creado: ${email}`);
                    }
                } catch (err) {
                    console.error(`[ERROR] ${email}: Fallo inesperado - ${err.message}`);
                }

                // 3. Delay de 200ms para evitar rate limiting de la API
                await delay(200);
            }

            console.log('✅ Proceso de importación masiva finalizado.');
        })
        .on('error', (err) => {
            console.error(`[ERROR FATAL] Error al leer el CSV: ${err.message}`);
        });
}

// Iniciar script
importUsers();
