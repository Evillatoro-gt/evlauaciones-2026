/*"use client";
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

            {/* SECCIÓN 1: MI AUTOEVALUACIÓN */ /*}
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

{/* SECCIÓN 2: EVALUACIÓN DE EQUIPO *//*}
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
}*/

"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPrincipal() {
    const supabase = createClient();
    const [usuarioActual, setUsuarioActual] = useState<any>(null);
    const [equipo, setEquipo] = useState<any[]>([]);
    const [evaluadosHechos, setEvaluadosHechos] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarDatos() {
            setLoading(true);

            let authId: string | null = null;
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                authId = authUser.id;
            } else if (process.env.NEXT_PUBLIC_DEV_AUTH === "true") {
                authId = '5fb9c280-2c69-4398-955c-4350c9ebc722';
            }

            if (authId) {
                const { data: perfil, error: errPerfil } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", authId)
                    .single();

                let miPerfil = perfil;
                if (!miPerfil && process.env.NEXT_PUBLIC_DEV_AUTH === "true") {
                    miPerfil = { id: authId, nombre: "Dev Profile", puesto: "Director", departamento: "Dirección" };
                }

                if (miPerfil) {
                    setUsuarioActual(miPerfil);

                    const { data: evals } = await supabase
                        .from("evaluaciones_completadas")
                        .select("evaluado_id")
                        .eq("evaluador_id", miPerfil.id);

                    const setEvals = new Set<string>();
                    if (evals && evals.length > 0) {
                        evals.forEach(e => setEvals.add(e.evaluado_id));
                    }
                    setEvaluadosHechos(setEvals);

                    const { data: subordinados, error: errSub } = await supabase
                        .from("users")
                        .select("id, nombre, puesto, codigo, departamento, estado,jefe")
                        .ilike("jefe", `%${miPerfil.nombre}%`)
                        .neq("id", miPerfil.id);

                    let miEquipo = subordinados;
                    //console.log('MIEQUIPO', miEquipo)
                    if ((!miEquipo || miEquipo.length === 0) && process.env.NEXT_PUBLIC_DEV_AUTH === "true") {
                        miEquipo = [
                            { id: "11111111-1111-1111-1111-111111111111", nombre: "Colaborador Mock 1", puesto: "Gerente", departamento: "Operaciones", codigo: "EMP-001", estado: "Pendiente", jefe: "Elias / Juan" },
                            { id: "22222222-2222-2222-2222-222222222222", nombre: "Colaborador Mock 2", puesto: "Analista", departamento: "Ventas", codigo: "EMP-002", estado: "Pendiente", jefe: "Elias / Juan" }
                        ];
                    }

                    setEquipo(miEquipo || []);
                }
            }
            setLoading(false);
        }
        cargarDatos();
    }, [supabase]);

    // Estilo para el estado de carga interno (coherente con el Suspense)
    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Cargando panel...</p>
            </div>
        </div>
    );

    if (!usuarioActual) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <p className="text-red-600 mb-4">No se encontró información del perfil.</p>
                <Link href="/auth/login" className="text-blue-500 hover:text-blue-700 underline">
                    Volver al inicio
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* NAVBAR */}
            <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-32 h-10">
                        <Image src="/content/logoTritech.jpg" alt="Logo Tritech" fill className="object-contain object-left" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {(usuarioActual?.admin || process.env.NEXT_PUBLIC_DEV_AUTH === 'true') && (
                        <Link href="/dashboard/admin" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                            Panel de Admin
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition text-sm text-center"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                {/* SECCIÓN 1: MI AUTOEVALUACIÓN */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi Autoevaluación</h2>
                    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{usuarioActual.nombre}</h3>
                            <p className="text-gray-600">
                                {usuarioActual.puesto} | {usuarioActual.departamento} | {evaluadosHechos.has(usuarioActual.id) ? "Completada" : usuarioActual.estado}
                            </p>
                        </div>
                        {evaluadosHechos.has(usuarioActual.id) ? (
                            <span className="px-6 py-2 bg-gray-200 text-gray-600 rounded-full font-medium cursor-not-allowed">
                                Evaluación Completada
                            </span>
                        ) : (
                            <Link
                                href={`/dashboard/evaluacion/${usuarioActual.id}?tipo=auto`}
                                className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                            >
                                Comenzar Autoevaluación
                            </Link>
                        )}
                    </div>
                </section>

                {/* SECCIÓN 2: EVALUACIÓN DE EQUIPO */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Mi Equipo a Evaluar</h2>
                    {equipo.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {equipo.map((colaborador) => {
                                const yaCompletada = evaluadosHechos.has(colaborador.id);
                                return (
                                    <div key={colaborador.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900">{colaborador.nombre}</h3>
                                        <p className="text-gray-600 mb-2">{colaborador.puesto}</p>
                                        <p className={`text-sm font-semibold mb-4 ${yaCompletada ? 'text-green-600' : 'text-blue-600'}`}>
                                            {yaCompletada ? "Completada" : colaborador.estado}
                                        </p>
                                        {yaCompletada ? (
                                            <span className="block text-center border border-gray-300 text-gray-400 py-2 rounded-lg cursor-not-allowed bg-gray-50">
                                                Evaluación Completada
                                            </span>
                                        ) : (
                                            <Link
                                                href={`/dashboard/evaluacion/${colaborador.id}?tipo=jefe`}
                                                className="block text-center border border-blue-500 text-blue-500 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                                            >
                                                Evaluar Colaborador
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
                            No tienes subordinados asignados bajo tu nombre.
                        </div>
                    )}
                </section>
            </div>
        </div>

    );


    async function handleLogout() {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error("Error al cerrar sesión:", error)
            alert("No se pudo cerrar sesión")
        } else {
            // Redirige al login
            window.location.href = "/auth/login"
        }
    }
}