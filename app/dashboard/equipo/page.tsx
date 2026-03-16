"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function DashboardPrincipal() {
    const supabase = createClient();
    const [usuarioActual, setUsuarioActual] = useState<any>(null);
    const [equipo, setEquipo] = useState<any[]>([]);
    const [evaluadosHechos, setEvaluadosHechos] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarDatos() {
            setLoading(true);

            // 1. Obtener la sesión actual o aplicar Bypass en dev
            let authId: string | null = null;
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                authId = authUser.id;
            } else if (process.env.NODE_ENV === 'development') {
                authId = '5fb9c280-2c69-4398-955c-4350c9ebc722';
            }

            if (authId) {
                const { data: perfil, error: errPerfil } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", authId)
                    .single();

                let miPerfil = perfil;
                if (!miPerfil && process.env.NODE_ENV === 'development') {
                    miPerfil = { id: authId, nombre: "Elias Villatoro", puesto: "Director", departamento: "Dirección" };
                }

                if (miPerfil) {
                    setUsuarioActual(miPerfil);

                    // 1.5 Obtener evaluaciones ya realizadas por este usuario
                    const { data: evals } = await supabase
                        .from("evaluaciones_completadas")
                        .select("evaluado_id")
                        .eq("evaluador_id", miPerfil.id);
                        
                    const setEvals = new Set<string>();
                    if (evals && evals.length > 0) {
                        evals.forEach(e => setEvals.add(e.evaluado_id));
                    }
                    setEvaluadosHechos(setEvals);

                    // 2. Buscar subordinados (donde la columna jefe sea igual a mi nombre)
                    const { data: subordinados, error: errSub } = await supabase
                        .from("users")
                        .select("id, nombre, puesto, codigo, departamento,estado")
                        .eq("jefe", miPerfil.nombre)
                        .neq("id", miPerfil.id); // Evitar listarme a mí mismo en el equipo

                    let miEquipo = subordinados;
                    console.log('MIEQUIEPO', miEquipo)
                    if ((!miEquipo || miEquipo.length === 0) && process.env.NODE_ENV === 'development') {
                        // Mock fallback si RLS bloquea la consulta o no hay subordinados
                        miEquipo = [
                            { id: "11111111-1111-1111-1111-111111111111", nombre: "Colaborador Mock 1", puesto: "Gerente", departamento: "Operaciones", codigo: "EMP-001", estado: "Pendiente" },
                            { id: "22222222-2222-2222-2222-222222222222", nombre: "Colaborador Mock 2", puesto: "Analista", departamento: "Ventas", codigo: "EMP-002", estado: "Pendiente" }
                        ];
                    }

                    setEquipo(miEquipo || []);
                }
            }
            setLoading(false);
        }
        cargarDatos();
    }, [supabase]);

    if (loading) return <div className="p-10 text-center">Cargando panel...</div>;
    if (!usuarioActual) return <div className="p-10 text-center">No se encontró información del perfil.</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">

            {/* SECCIÓN 1: MI AUTOEVALUACIÓN */}
            <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 text-white">Mi Autoevaluación</h2>
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold">{usuarioActual.nombre}</h3>
                        <p className="opacity-90">
                            {usuarioActual.puesto} | {usuarioActual.departamento} | {evaluadosHechos.has(usuarioActual.id) ? "Completada" : usuarioActual.estado}
                        </p>
                    </div>
                    {evaluadosHechos.has(usuarioActual.id) ? (
                        <span className="bg-gray-300 text-gray-600 px-6 py-2 rounded-full font-bold cursor-not-allowed text-sm">
                            Evaluación Completada
                        </span>
                    ) : (
                        <Link
                            href={`/dashboard/evaluacion/${usuarioActual.id}?tipo=auto`}
                            className="bg-white text-blue-700 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition text-sm"
                        >
                            Comenzar Autoevaluación
                        </Link>
                    )}
                </div>
            </section>

            {/* SECCIÓN 2: EVALUACIÓN DE EQUIPO */}
            <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 text-white">Mi Equipo a Evaluar</h2>
                {equipo.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {equipo.map((colaborador) => {
                            const yaCompletada = evaluadosHechos.has(colaborador.id);
                            return (
                                <div key={colaborador.id} className="bg-white border rounded-xl p-5 shadow-sm">
                                    <h3 className="font-bold text-gray-800">{colaborador.nombre}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{colaborador.puesto}</p>
                                    <p className={`text-sm mb-4 font-semibold ${yaCompletada ? 'text-green-600' : 'text-blue-600'}`}>
                                        {yaCompletada ? "Completada" : colaborador.estado}
                                    </p>
                                    {yaCompletada ? (
                                        <span className="block text-center border border-gray-300 text-gray-400 py-2 rounded-lg cursor-not-allowed font-medium bg-gray-50">
                                            Evaluación Completada
                                        </span>
                                    ) : (
                                        <Link
                                            href={`/dashboard/evaluacion/${colaborador.id}?tipo=jefe`}
                                            className="block text-center border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                                        >
                                            Evaluar Colaborador
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 bg-gray-100 rounded-xl text-center text-gray-500">
                        No tienes subordinados asignados bajo tu nombre.
                    </div>
                )}
            </section>

        </div>
    );
}