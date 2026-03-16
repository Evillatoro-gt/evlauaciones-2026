"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function VerifyPage() {

    const router = useRouter()
    const params = useSearchParams()
    const email = params.get("email")

    const supabase = createClient()

    const [code, setCode] = useState("")

    async function verify(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!email) {
            alert("Falta el correo electrónico para verificar")
            return
        }

        const { error } = await supabase.auth.verifyOtp({
            email,
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