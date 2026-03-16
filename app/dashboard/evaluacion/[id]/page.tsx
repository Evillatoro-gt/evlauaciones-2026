/*"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ContenidoEvaluacion() {
    const { id: evaluadoId } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [evaluador, setEvaluador] = useState<any>(null);
    const [evaluado, setEvaluado] = useState<any>(null);
    const [competencias, setCompetencias] = useState<any[]>([]);
    const [respuestas, setRespuestas] = useState<{ [key: string]: { habilidad: string, ponderacion: string } }>({});
    const [loading, setLoading] = useState(true);

    const escalas = {
        habilidad: ["FALTO DE COMPETENCIA", "EN DESARROLLO", "NORMAL", "ALTAMENTE DESARROLLADO", "ABUSO DE COMPETENCIA"],
        ponderacion: ["BUENO", "DESEABLE", "SOBRESALIENTE", "EXCEDE LAS EXPECTATIVAS"]
    };

    useEffect(() => {
        async function cargarDatos() {
            setLoading(true);
            // 1. Obtener mi perfil (Evaluador) o Bypass DEV
            let evalId: string | null = null;
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                evalId = authUser.id;
            } else if (process.env.NODE_ENV === 'development') {
                evalId = '5fb9c280-2c69-4398-955c-4350c9ebc722';
            }

            if (evalId) {
                const { data: profile } = await supabase.from("users").select("nombre").eq("id", evalId).single();
                let evaluadorData = profile;
                if (!evaluadorData && process.env.NODE_ENV === 'development') {
                    evaluadorData = { nombre: "Elias Villatoro" };
                }
                setEvaluador(evaluadorData);
            }

            // 2. Obtener datos del evaluado e IdealPond
            const { data: user } = await supabase.from("users").select("*").eq("id", evaluadoId).single();
            let evaluadoData = user;

            if (!evaluadoData && process.env.NODE_ENV === 'development') {
                evaluadoData = { id: evaluadoId, nombre: "Evaluado de Prueba", puesto: "Desarrollador" };
            }

            if (evaluadoData) {
                setEvaluado(evaluadoData);
                const { data: pond } = await supabase.from("idealpond").select("*").eq("puesto", evaluadoData.puesto);
                let competenciasData = pond;

                if ((!competenciasData || competenciasData.length === 0) && process.env.NODE_ENV === 'development') {
                    competenciasData = [
                        { id: 1, competencia: "Comunicación Efectiva", puesto: evaluadoData.puesto },
                        { id: 2, competencia: "Liderazgo", puesto: evaluadoData.puesto },
                        { id: 3, competencia: "Resolución de Problemas", puesto: evaluadoData.puesto }
                    ];
                }
                setCompetencias(competenciasData || []);
            }
            setLoading(false);
        }
        cargarDatos();
    }, [evaluadoId, supabase]);

    const handleUpdateResponse = (compName: string, field: 'habilidad' | 'ponderacion', value: string) => {
        setRespuestas(prev => ({
            ...prev,
            [compName]: {
                ...(prev[compName] || { habilidad: '', ponderacion: '' }),
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let evalId: string | null = null;
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) evalId = authUser.id;
        else if (process.env.NODE_ENV === 'development') evalId = '5fb9c280-2c69-4398-955c-4350c9ebc722';

        if (!evalId) {
            alert("Error: No se pudo identificar al evaluador.");
            return;
        }

        const { error } = await supabase.from("evaluaciones_completadas").insert({
            evaluador_id: evalId,
            evaluado_id: evaluadoId,
            puesto: evaluado?.puesto,
            datos_competencias: respuestas, // Se guarda el objeto de doble nivel
            token: crypto.randomUUID(),
        });

        if (!error) {
            // Actualizar estado del evaluado a 'Completada'
            await supabase.from("users").update({ estado: "Completada" }).eq("id", evaluadoId);

            // Limpieza de evaluación temporal (si existe tal tabla u operación requerida)
            await supabase.from("evaluaciones_temp").delete().match({
                evaluador_id: evalId,
                evaluado_id: evaluadoId
            });

            alert("Evaluación completada exitosamente");
            router.push("/dashboard/equipo");
        } else {
            alert("Verifica la consola. Ocurrió un error al guardar.");
            console.error(error);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 shadow-xl rounded-xl">

                {/* SECCIÓN ENCABEZADO *//*}
<div className="grid grid-cols-1 gap-6 border-b pb-8">
    <div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4 border-b pb-2">Evaluación de Competencias</h1>
        <label className="block text-sm font-bold text-gray-700 uppercase">Seleccione su nombre y apellido</label>
        <select className="mt-1 block w-full p-3 border rounded-md bg-gray-100 text-black" disabled>
            <option>{evaluador?.nombre || "Cargando..."}</option>
        </select>
    </div>

    <div>
        <label className="block text-sm font-bold text-gray-700 uppercase">Seleccione la persona a evaluar</label>
        <select className="mt-1 block w-full p-3 border rounded-md bg-gray-100 text-black" disabled>
            <option>{evaluado?.nombre || "Cargando..."}</option>
        </select>
    </div>

    <div>
        <label className="block text-sm font-bold text-gray-700 uppercase">Puesto de trabajo</label>
        <div className="mt-1 p-3 border rounded-md bg-blue-50 text-blue-800 font-semibold">
            {evaluado?.puesto}
        </div>
        <p className="text-sm text-gray-600 mt-2">El siguiente formulario debe llenarse evaluando las capacidades descritas en el archivo "Definición de competencias".</p>
    </div>
</div>

{/* SECCIÓN COMPETENCIAS *//*}
{competencias.map((comp) => (
    <div key={comp.id} className="p-6 border rounded-lg bg-gray-50 space-y-4">
        <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-600 pl-3">
            {comp.competencia}
        </h3>

        {/* Escala 1: Habilidades *//*}
<div>
    <p className="text-sm font-bold text-gray-600 mb-2"> HABILIDADES:</p>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {escalas.habilidad.map(op => (
            <label key={op} className="flex flex-col items-center p-2 border rounded bg-white hover:bg-blue-100 cursor-pointer text-center text-black">
                <input
                    type="radio"
                    required
                    name={`hab-${comp.id}`}
                    onChange={() => handleUpdateResponse(comp.competencia, 'habilidad', op)}
                    className="mb-2"
                />
                <span className="text-[10px] leading-tight font-medium">{op}</span>
            </label>
        ))}
    </div>
</div>

{/* Escala 2: Ponderación *//*}
<div>
    <p className="text-sm font-bold text-gray-600 mb-2">PONDERACION:</p>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {escalas.ponderacion.map(op => (
            <label key={op} className="flex flex-col items-center p-2 border rounded bg-white hover:bg-green-100 cursor-pointer text-center text-black">
                <input
                    type="radio"
                    required
                    name={`pond-${comp.id}`}
                    onChange={() => handleUpdateResponse(comp.competencia, 'ponderacion', op)}
                    className="mb-2 text-black"
                />
                <span className="text-[10px] leading-tight font-medium">{op}</span>
            </label>
        ))}
    </div>
</div>
</div>
))}

<button type="submit" className="w-full bg-blue-700 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition shadow-lg ">
ENVIAR EVALUACIÓN
</button>
</form>
</div>
);
}

export default function PaginaEvaluacion() {
return <Suspense fallback={null}><ContenidoEvaluacion /></Suspense>;
}*/

"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ContenidoEvaluacion() {
    const { id: evaluadoId } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [evaluador, setEvaluador] = useState<any>(null);
    const [evaluado, setEvaluado] = useState<any>(null);
    const [competencias, setCompetencias] = useState<any[]>([]);
    const [respuestas, setRespuestas] = useState<{ [key: string]: { habilidad: string; ponderacion: string } }>({});
    const [loading, setLoading] = useState(true);

    const escalas = {
        habilidad: ["FALTO DE COMPETENCIA", "EN DESARROLLO", "NORMAL", "ALTAMENTE DESARROLLADO", "ABUSO DE COMPETENCIA"],
        ponderacion: ["BUENO", "DESEABLE", "SOBRESALIENTE", "EXCEDE LAS EXPECTATIVAS"],
    };

    useEffect(() => {
        async function cargarDatos() {
            setLoading(true);
            let evalId: string | null = null;
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                evalId = authUser.id;
            } else if (process.env.NODE_ENV === 'development') {
                evalId = '5fb9c280-2c69-4398-955c-4350c9ebc722';
            }

            if (evalId) {
                const { data: profile } = await supabase.from("users").select("nombre").eq("id", evalId).single();
                let evaluadorData = profile;
                if (!evaluadorData && process.env.NODE_ENV === 'development') {
                    evaluadorData = { nombre: "Elias Villatoro" };
                }
                setEvaluador(evaluadorData);
            }

            const { data: user } = await supabase.from("users").select("*").eq("id", evaluadoId).single();
            let evaluadoData = user;

            if (!evaluadoData && process.env.NODE_ENV === 'development') {
                evaluadoData = { id: evaluadoId, nombre: "Evaluado de Prueba", puesto: "Desarrollador" };
            }

            if (evaluadoData) {
                setEvaluado(evaluadoData);
                const { data: pond } = await supabase.from("idealpond").select("*").eq("puesto", evaluadoData.puesto);
                let competenciasData = pond;

                if ((!competenciasData || competenciasData.length === 0) && process.env.NODE_ENV === 'development') {
                    competenciasData = [
                        { id: 1, competencia: "Comunicación Efectiva", puesto: evaluadoData.puesto },
                        { id: 2, competencia: "Liderazgo", puesto: evaluadoData.puesto },
                        { id: 3, competencia: "Resolución de Problemas", puesto: evaluadoData.puesto },
                    ];
                }
                setCompetencias(competenciasData || []);
            }
            setLoading(false);
        }
        cargarDatos();
    }, [evaluadoId, supabase]);

    const handleUpdateResponse = (compName: string, field: 'habilidad' | 'ponderacion', value: string) => {
        setRespuestas(prev => ({
            ...prev,
            [compName]: {
                ...(prev[compName] || { habilidad: '', ponderacion: '' }),
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let evalId: string | null = null;
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) evalId = authUser.id;
        else if (process.env.NODE_ENV === 'development') evalId = '5fb9c280-2c69-4398-955c-4350c9ebc722';

        if (!evalId) {
            alert("Error: No se pudo identificar al evaluador.");
            return;
        }

        const { error } = await supabase.from("evaluaciones_completadas").insert({
            evaluador_id: evalId,
            evaluado_id: evaluadoId,
            puesto: evaluado?.puesto,
            datos_competencias: respuestas,
            token: crypto.randomUUID(),
        });

        if (!error) {
            await supabase.from("users").update({ estado: "Completada" }).eq("id", evaluadoId);
            await supabase.from("evaluaciones_temp").delete().match({
                evaluador_id: evalId,
                evaluado_id: evaluadoId,
            });

            alert("Evaluación completada exitosamente");
            router.push("/dashboard/equipo");
        } else {
            alert("Verifica la consola. Ocurrió un error al guardar.");
            console.error(error);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Cargando evaluación...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
                {/* ENCABEZADO */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900 text-center border-b border-gray-200 pb-4">
                        Evaluación de Competencias
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                Evaluador
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
                                disabled
                            >
                                <option>{evaluador?.nombre || "Cargando..."}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                Persona a evaluar
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
                                disabled
                            >
                                <option>{evaluado?.nombre || "Cargando..."}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Puesto de trabajo
                        </label>
                        <div className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-semibold">
                            {evaluado?.puesto}
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                            El siguiente formulario debe llenarse evaluando las capacidades descritas en el archivo "Definición de competencias".
                        </p>
                    </div>
                </div>

                {/* COMPETENCIAS */}
                {competencias.map((comp) => (
                    <div key={comp.id} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-500 pl-4">
                            {comp.competencia}
                        </h3>

                        {/* HABILIDADES */}
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Habilidades</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                                {escalas.habilidad.map((op) => (
                                    <label
                                        key={op}
                                        className="flex flex-col items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition"
                                    >
                                        <input
                                            type="radio"
                                            required
                                            name={`hab-${comp.id}`}
                                            onChange={() => handleUpdateResponse(comp.competencia, 'habilidad', op)}
                                            className="mb-2 accent-blue-500"
                                        />
                                        <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                                            {op}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* PONDERACIÓN */}
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Ponderación</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {escalas.ponderacion.map((op) => (
                                    <label
                                        key={op}
                                        className="flex flex-col items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-green-50 hover:border-green-300 cursor-pointer transition"
                                    >
                                        <input
                                            type="radio"
                                            required
                                            name={`pond-${comp.id}`}
                                            onChange={() => handleUpdateResponse(comp.competencia, 'ponderacion', op)}
                                            className="mb-2 accent-green-600"
                                        />
                                        <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                                            {op}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg transition duration-200"
                >
                    ENVIAR EVALUACIÓN
                </button>
            </form>
        </div>
    );
}

export default function PaginaEvaluacion() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center min-h-screen bg-gray-50">
                    <div className="text-center">
                        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Cargando evaluación...</p>
                    </div>
                </div>
            }
        >
            <ContenidoEvaluacion />
        </Suspense>
    );
}