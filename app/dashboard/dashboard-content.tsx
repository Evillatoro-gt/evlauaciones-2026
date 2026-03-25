/*import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function DashboardContent() {

    const supabase = await createClient()

    const {
        data: { user }
    } = await supabase.auth.getUser()
    console.log('USuario registrado', user)

    if (!user && process.env.NEXT_PUBLIC_DEV_AUTH !== 'true') {
        redirect("/auth/login")
    }

    // Bypass ID handler: si DEV_AUTH activo, ignorar sesión real y usar ID de prueba
    const devMode = process.env.NEXT_PUBLIC_DEV_AUTH === 'true'
    const userId = devMode
        ? '5fb9c280-2c69-4398-955c-4350c9ebc722'
        : (user?.id || null)

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
    if (!profile && devMode) {
        profile = {
            id: userId,
            email: 'dev@test.com',
            name: "Elias Villatoro",
            role: "jefe"
        }
    } else if (!profile && !devMode) {
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

            <p>Email: {user?.email || profile?.email || 'N/A'}</p>
            <p>Nombre: {profile?.nombre || 'N/A'}</p>
            <p>Rol: {profile?.puesto || 'N/A'}</p>

            <div style={{ marginTop: '20px' }}>
                <Link
                    href="/dashboard/equipo"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        display: 'inline-block',
                        fontWeight: 'bold'
                    }}
                >
                    Ir a Evaluaciones (Equipo)
                </Link>
            </div>
        </div>
    )
}*/

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardContent() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    //console.log("Usuario registrado", user);

    if (!user && process.env.NEXT_PUBLIC_DEV_AUTH !== "true") {
        redirect("/auth/login");
    }

    const devMode = process.env.NEXT_PUBLIC_DEV_AUTH === "true";
    const userId = devMode
        ? "5fb9c280-2c69-4398-955c-4350c9ebc722"
        : user?.id || null;

    if (!userId) {
        redirect("/auth/login");
    }

    const { data: existingProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    let profile = existingProfile;

    if (!profile && devMode) {
        profile = {
            id: userId,
            email: "dev@test.com",
            nombre: "Elias Villatoro",   // Ajusta según tu esquema (nombre o name)
            puesto: "jefe",               // Ajusta según tu esquema (puesto o role)
        };
    } else if (!profile && !devMode) {
        const { data: newProfile, error } = await supabase
            .from("users")
            .insert({
                id: userId,
                email: user?.email || "dev@test.com",
                nombre: "",                  // Ajusta según tu esquema
                puesto: "user",               // Ajusta según tu esquema
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            return (
                <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                        <p className="text-red-600 mb-4">Error creando usuario</p>
                        <Link
                            href="/auth/login"
                            className="text-blue-500 hover:text-blue-700 underline"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            );
        }

        profile = newProfile;
    }

    // Ajusta estos nombres de campo según tu tabla real
    const displayName = profile?.nombre || "No especificado";
    const displayRole = profile?.puesto || "No especificado";
    const displayEmail = user?.email || profile?.email || "No disponible";

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
                    Evaluaciones 2026
                </h1>
                <h6 className="text-md text-gray-600 text-center mb-2">
                    Por favor, valida tu información antes de continuar
                </h6>

                <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-2">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-lg font-medium text-gray-900">{displayEmail}</p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="text-lg font-medium text-gray-900">{displayName}</p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                        <p className="text-sm text-gray-500">Rol</p>
                        <p className="text-lg font-medium text-gray-900">{displayRole}</p>
                    </div>
                </div>

                <div className="mt-8">
                    <Link
                        href="/dashboard/equipo"
                        className="block w-full py-3 px-4 text-center text-base font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                    >
                        Ir a Evaluaciones (Equipo)
                    </Link>
                </div>
            </div>
        </div>
    );
}