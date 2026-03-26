"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import styles from "./page.module.css"
import Image from "next/image"
import { useSnackbar } from "@/components/ui/snackbar"

export default function LoginPage() {
  const { showSnackbar, SnackbarComponent } = useSnackbar()

  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    // Si el bypass está activo, no redirigir aunque haya sesión real
    if (process.env.NEXT_PUBLIC_DEV_AUTH === "true") return

    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push("/dashboard")
      }
    }
    checkSession()
  }, [supabase.auth, router])

  async function sendCode(e: React.SyntheticEvent) {
    e.preventDefault()
    /* VALIDACIÓN DE CORREO CORPORATIVO
        if(!email.endsWith("@grupotritech.com") || process.env.NEXT_PUBLIC_DEV_AUTH === "true") {
          alert("Por favor, ingresa un correo corporativo de grupotritech.com")
          return
        }
    */
    if (loading || cooldown > 0) return

    setLoading(true)

    try {

      // BYPASS SOLO EN DESARROLLO (Si se configura en .env.local)
      if (process.env.NEXT_PUBLIC_DEV_AUTH === "true") {
        //console.log("DEV LOGIN BYPASS")
        router.push("/dashboard")
        return
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      })

      if (error) {
        if (error.message.includes("Signups not allowed for otp") || error.message.includes("Signups not allowed")) {
          showSnackbar("El correo electronico no esta registrado.", "warning")
        } else {
          showSnackbar(error.message, "error")
        }
        setLoading(false)
        return
      }

      setSent(true)
      showSnackbar("Código enviado exitosamente", "success")

      // cooldown para evitar rate limit
      setCooldown(180)

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
      showSnackbar("Error enviando código", "error")
    }

    setLoading(false)
  }

  /*if (sent) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Revisa tu correo</h2>
        <p>Te enviamos un código de 8 dígitos</p>

        <button
          onClick={() => router.push(`/auth/verify?email=${email}`)}
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
  }*/
  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-8 text-center">
          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Revisa tu correo
          </h2>

          {/* Descripción */}
          <p className="text-sm text-gray-600 mb-6">
            Te enviamos un código de verificación a <br />
            <span className="font-medium text-gray-800">{email}</span>
          </p>

          {/* Botón principal */}
          <button
            onClick={() => router.push(`/auth/verify?email=${email}`)}
            className="w-full py-3 mb-4 rounded-lg font-semibold text-white 
          bg-gradient-to-r from-blue-500 to-blue-600 
          hover:from-blue-600 hover:to-blue-700 
          transition shadow-md"
          >
            Ingresar código
          </button>

          {/* Reenvío */}
          <button
            onClick={sendCode}
            disabled={cooldown > 0 || loading}
            className="w-full py-2 rounded-lg text-sm font-medium transition
          disabled:opacity-50 disabled:cursor-not-allowed
          text-blue-600 hover:bg-blue-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                Reenviando...
              </span>
            ) : cooldown > 0 ? (
              `Reenviar en ${cooldown}s`
            ) : (
              "Reenviar código"
            )}
          </button>

          <p className="mt-4 text-xs text-gray-400">
            El código expira en unos minutos
          </p>

        </div>
        <SnackbarComponent />
      </div>
    )
  }

  /*return (
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
  )*/
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <form onSubmit={sendCode} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <Image
          src="/content/logoTritech.jpg"
          alt="Logo Tritech"
          width={250}
          height={100}
          className="mb-6 mx-auto"
        />
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Iniciar sesión</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Ingresa tu correo electrónico y te enviaremos un código de acceso.
        </p>

        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            placeholder="Ingresa tu correo corporativo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 text-gray-700 border border-gray-300 bg-white rounded-lg focus:border-blue-500 focus:ring-3 focus:ring-blue-200 outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || cooldown > 0}
          className="w-full py-3 px-4 text-base font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400 transition flex items-center justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Enviando...
            </span>
          ) : cooldown > 0 ? (
            `Espera ${cooldown} segundos para reenviar`
          ) : (
            "Enviar código"
          )}
        </button>

        {cooldown > 0 && (
          <p className="mt-4 text-xs text-red-600 text-center">
            Puedes solicitar un nuevo código en {cooldown} segundos.
          </p>
        )}
      </form>
      <SnackbarComponent />
    </div>
  );
}