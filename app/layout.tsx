import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Image from "next/image";
import "./globals.css";

// Variable para controlar el acceso global - Cambiar a true para abrir nuevamente las evaluaciones
const EVALUACIONES_ABIERTAS = false;

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Evalaciones 2026 | Grupo Tritech",
  description: "Evaluaciones 2026 | Equipo de Alto Desempeño | Autoevaluaciones",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {EVALUACIONES_ABIERTAS ? (
            children
          ) : (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
                <Image
                  src="/content/logoTritech.jpg"
                  alt="Logo Tritech"
                  width={250}
                  height={100}
                  className="mb-8 mx-auto"
                />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Periodo Finalizado</h2>
                <p className="text-base text-gray-600 mb-6 leading-relaxed">
                  El periodo de evaluaciones ha terminado. Agradecemos enormemente tu comprensión y valiosa participación en este gran proceso.
                </p>
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 font-medium">
                  Si tienes alguna inquietud, por favor comunícate con el equipo de Recursos Humanos.
                </div>
              </div>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
