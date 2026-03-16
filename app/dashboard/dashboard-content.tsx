import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardContent() {

    const supabase = await createClient()

    const {
        data: { user }
    } = await supabase.auth.getUser()
    console.log('USuario registrado', user)

    if (!user && process.env.NODE_ENV !== 'development') {
        redirect("/auth/login")
    }

    // Bypass ID handler para modo dev
    const userId = user?.id || (process.env.NODE_ENV === 'development' ? '5fb9c280-2c69-4398-955c-4350c9ebc722' : null);

    if (!userId) {
        redirect("/auth/login") // Fallback de seguridad
    }

    // buscar perfil
    const { data: existingProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

    let profile = existingProfile

    // Fallback de mock si la consulta falla o no existe en DEV (útil si hay RLS para sin sesión)
    if (!profile && process.env.NODE_ENV === 'development') {
        profile = {
            id: userId,
            email: 'dev@test.com',
            name: "Elias Villatoro",
            role: "jefe"
        }
    } else if (!profile) {
        const { data: newProfile, error } = await supabase
            .from("users")
            .insert({
                id: userId,
                email: user?.email || 'dev@test.com',
                name: "",
                role: "user"
            })
            .select()
            .single()

        if (error) {
            console.error(error)
            return <p>Error creando usuario</p>
        }

        profile = newProfile
    }

    return (
        <div>
            <h1>Dashboard</h1>

            <p>Email: {profile?.email}</p>
            <p>Nombre: {profile?.name}</p>
            <p>Rol: {profile?.role}</p>
        </div>
    )
}