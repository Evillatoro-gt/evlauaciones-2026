// scripts/export-to-deva.js
// Para ejecutar este script npm run export:deva
// Tabla lista para importar a DEVA Y EVA MySQL correctammente
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'
import { parse } from 'json2csv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Lista completa de competencias
const COMPETENCIAS = [
  "INTEGRIDAD Y CONFIANZA",
  "CONTROL DE SITUACIONES CONFLICTIVAS",
  "TRANSMISION DE INFORMACION",
  "AGILIDAD ORGANIZATIVA",
  "DIRECCION DE PERSONAL",
  "PLANEACION Y ORDEN",
  "ATENCION A LOS DETALLES / ANALITICO",
  "CALIDAD EN LOS PROCESOS DE TRABAJO",
  "PROACTIVIDAD",
  "NEGOCIACION",
  "RELACIONES INTERPERSONALES E INTERES POR EL CLIENTE",
  "CUIDADO DE RECURSOS",
  "ACCESIBILIDAD Y DISPONIBILIDAD",
  "ESTABLECIMIENTO DE PRIORIDADES",
  "CALIDAD TOTAL Y REDISENO",
  "SERENIDAD Y PACIENCIA",
  "RESOLUCION DE PROBLEMAS",
  "CALIDAD DE LAS DECISIONES",
  "OBTENCION DE RESULTADOS",
  "DESARROLLO CONSTANTE DEL PERSONAL",
  "ETICA Y VALORES",
  "ORGANIZADOR",
  "VISION COMPARTIDA",
  "CONTROL DE LOS PROCEDIMIENTOS",
  "HABIL ESTRATEGA",
  "CAPACIDAD DE ESCUCHAR",
  "LIDERAZGO",
  "DELEGACION DE RESPONSABILIDADES",
  "AMBICION COMERCIAL",
  "ADQUISICION DE CONOCIMIENTOS TECNICOS",
  "COMUNICACION EFECTIVA AL CLIENTE",
  "HABIL ESTRATEGA EN CIERRE DE NEGOCIOS",
  "RAPIDEZ DE APRENDIZAJE",
  "EMPATIA",
  "CREACION DE EQUIPOS EFICIENTES",
  "DIRECCION Y EVALUACION DE TRABAJO",
  "CREATIVIDAD",
  "EXPERTO EN PRESENTACIONES",
  "MOTIVACION DE OTRAS PERSONAS",
  "CAPACIDAD PARA JUZGAR A LAS PERSONAS",
  "CONTROL DE DIVERSIDAD",
  "CONTRATACION Y SELECCION DE PERSONAL"
]

async function exportEvaluaciones() {
  console.log('📦 Exportando evaluaciones a AEVA y DEVA...')

  const { data: evaluaciones, error } = await supabase
    .from('evaluaciones_completadas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  console.log(`✅ Encontradas ${evaluaciones.length} evaluaciones`)

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, nombre, codigo, puesto')

  if (usersError) throw usersError

  const usersMap = Object.fromEntries(users.map(u => [u.id, u]))

  const rowsDEVA = []
  const rowsAEVA = []

  for (const evaluation of evaluaciones) {
    let competenciasData = {}
    try {
      competenciasData = typeof evaluation.datos_competencias === 'string'
        ? JSON.parse(evaluation.datos_competencias)
        : evaluation.datos_competencias || {}
    } catch (err) {
      console.error(`❌ Error parseando datos_competencias para ID ${evaluation.id}:`, err)
    }

    const evaluador = usersMap[evaluation.evaluador_id]
    const evaluado = usersMap[evaluation.evaluado_id]

    const esAutoevaluacion = evaluation.evaluador_id === evaluation.evaluado_id

    // BASE (común a ambas)
    const rowBase = {
      ID: evaluation.id.slice(0, 5),
      EVALUADO: evaluado?.nombre?.toUpperCase() || '',
      PUESTO: evaluado?.puesto || evaluation.puesto || '',
      COMENTARIOS: evaluation.comentarios || ''
    }

    // Llenar competencias
    for (const comp of COMPETENCIAS) {
      const data = competenciasData[comp] || {}
      rowBase[`[${comp}][Escala 1]`] = data.habilidad || ''
      rowBase[`[${comp}][Escala 2]`] = data.ponderacion || ''
    }

    if (esAutoevaluacion) {
      // AEVA (sin TOKEN ni EVALUADOR)
      rowsAEVA.push({ ...rowBase })
    } else {
      // DEVA (igual a tu script actual)
      const rowDEVA = {
        ...rowBase,
        TOKEN: evaluation.token?.slice(0, 8) || '',
        EVALUADOR: evaluador?.nombre?.toUpperCase() || ''
      }

      rowsDEVA.push(rowDEVA)
    }
  }

  fs.mkdirSync('output', { recursive: true })

  // Exportar DEVA (igual que ya tenías)
  const csvDEVA = parse(rowsDEVA)
  fs.writeFileSync('output/DEVA_import.csv', csvDEVA)

  // Exportar AEVA
  const csvAEVA = parse(rowsAEVA)
  fs.writeFileSync('output/AEVA_import.csv', csvAEVA)

  console.log(`DEVA: ${rowsDEVA.length} filas`)
  console.log(`AEVA: ${rowsAEVA.length} filas`)
  console.log('Archivos generados en /output')
}

exportEvaluaciones().catch(console.error)