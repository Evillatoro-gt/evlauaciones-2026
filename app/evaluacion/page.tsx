import { createClient } from "@/lib/supabase/server"

export default async function Evaluacion({ searchParams }: { searchParams: { token: string } }) {

    const token = searchParams.token

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