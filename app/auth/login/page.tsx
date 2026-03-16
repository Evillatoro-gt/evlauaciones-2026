"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {

  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  async function sendCode(e: any) {
    e.preventDefault()

    if (loading || cooldown > 0) return

    setLoading(true)

    try {

      // BYPASS SOLO EN DESARROLLO
      if (process.env.NODE_ENV === "development") {
        console.log("DEV LOGIN BYPASS")
        router.push("/dashboard")
        return
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true
        }
      })

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      setSent(true)

      // cooldown para evitar rate limit
      setCooldown(30)

      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer)
            return 0
          }
          return c - 1
        })
      }, 1000)

    } catch (err) {
      console.error(err)
      alert("Error enviando código")
    }

    setLoading(false)
  }

  if (sent) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Revisa tu correo</h2>
        <p>Te enviamos un código de 6 dígitos</p>

        <button
          onClick={() => router.push(`/verify?email=${email}`)}
        >
          Ingresar código
        </button>

        <br /><br />

        {cooldown > 0 ? (
          <p>Podrás reenviar en {cooldown}s</p>
        ) : (
          <button onClick={sendCode}>
            Reenviar código
          </button>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={sendCode}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 300,
        margin: "100px auto"
      }}
    >

      <h2>Iniciar sesión</h2>

      <input
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading || cooldown > 0}
      >
        {loading
          ? "Enviando..."
          : cooldown > 0
            ? `Espera ${cooldown}s`
            : "Enviar código"}
      </button>

    </form>
  )
}