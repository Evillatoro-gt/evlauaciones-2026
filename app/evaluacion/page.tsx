/*import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"

async function EvaluacionContent({ searchParamsPromise }: { searchParamsPromise: Promise<{ token?: string }> }) {
    const searchParams = await searchParamsPromise
    const token = searchParams?.token

    if (!token) {
        return <div>Token no proporcionado</div>
    }

    const supabase = await createClient()

    const { data } = await supabase
        .from("evaluaciones_completadas")
        .select("*")
        .eq("token", token)
        .single()

    if (!data) {
        return <div>Token inválido</div>
    }

    return (
        <div>
            <h1>Evaluación</h1>
            <p>Puesto: {data.puesto}</p>
        </div>
    )
}

export default function Evaluacion(props: { searchParams: Promise<{ token?: string }> }) {
    return (
        <Suspense fallback={<div>Cargando evaluación...</div>}>
            <EvaluacionContent searchParamsPromise={props.searchParams} />
        </Suspense>
    )
}*/

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import Link from "next/link";

async function EvaluacionContent({ searchParamsPromise }: { searchParamsPromise: Promise<{ token?: string }> }) {
    const searchParams = await searchParamsPromise;
    const token = searchParams?.token;

    if (!token) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
                    <p className="text-red-600 mb-4">Token no proporcionado</p>
                    <Link href="/" className="text-blue-500 hover:text-blue-700 underline">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    const supabase = await createClient();

    const { data } = await supabase
        .from("evaluaciones_completadas")
        .select("*")
        .eq("token", token)
        .single();

    if (!data) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
                    <p className="text-red-600 mb-4">Token inválido</p>
                    <Link href="/" className="text-blue-500 hover:text-blue-700 underline">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
                    Evaluación
                </h1>
                <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-2">
                        <p className="text-sm text-gray-500">Puesto evaluado</p>
                        <p className="text-lg font-medium text-gray-900">{data.puesto}</p>
                    </div>
                    {/* Agrega aquí más campos según tu tabla, siguiendo el mismo patrón */}
                </div>
                <div className="mt-8">
                    <Link
                        href="/dashboard"
                        className="block w-full py-3 px-4 text-center text-base font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                    >
                        Volver al dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Evaluacion(props: { searchParams: Promise<{ token?: string }> }) {
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
            <EvaluacionContent searchParamsPromise={props.searchParams} />
        </Suspense>
    );
}