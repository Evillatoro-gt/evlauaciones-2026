/*"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function VerifyForm() {
    const router = useRouter()
    const params = useSearchParams()
    const email = params.get("email")

    const supabase = createClient()

    useEffect(() => {
        async function checkSession() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                router.push("/dashboard")
            }
        }
        checkSession()
    }, [supabase.auth, router])

    const [code, setCode] = useState("")

    async function verify(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!email) {
            alert("Falta el correo electrónico para verificar")
            return
        }

        const { error } = await supabase.auth.verifyOtp({
            email: email as string,
            token: code,
            type: "email"
        })

        if (!error) {
            router.push("/dashboard")
        } else {
            alert("Código inválido")
        }
    }

    return (
        <form onSubmit={verify}>
            <h2>Introduce el código</h2>

            <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
            />

            <button type="submit">
                Verificar
            </button>
        </form>
    )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <VerifyForm />
        </Suspense>
    )
}*/
"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function VerifyForm() {
    const router = useRouter();
    const params = useSearchParams();
    const email = params.get("email");

    const supabase = createClient();

    useEffect(() => {
        async function checkSession() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                router.push("/dashboard");
            }
        }
        checkSession();
    }, [supabase.auth, router]);

    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function verify(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email) {
            setError("Falta el correo electrónico para verificar");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.verifyOtp({
            email: email,
            token: code,
            type: "email",
        });

        setLoading(false);

        if (!error) {
            router.push("/dashboard");
        } else {
            setError("Código inválido. Intenta nuevamente.");
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <form onSubmit={verify} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
                    Verificar código
                </h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                    Ingresa el código de 6 dígitos que enviamos a <strong>{email}</strong>
                </p>

                <div className="mb-6">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                        Código de verificación
                    </label>
                    <input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-3 focus:ring-blue-200 outline-none transition"
                        maxLength={6}
                    />
                </div>

                {error && (
                    <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 text-base font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400 transition flex items-center justify-center"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Verificando...
                        </span>
                    ) : (
                        "Verificar"
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/auth/login")}
                    className="bg-transparent border-none text-blue-500 text-sm underline cursor-pointer mt-4 inline-block hover:text-blue-700"
                >
                    ← Volver al inicio
                </button>
            </form>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="text-center p-8">Cargando...</div>}>
            <VerifyForm />
        </Suspense>
    );
}