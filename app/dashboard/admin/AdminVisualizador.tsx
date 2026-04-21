"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type User = {
  id: string;
  nombre: string;
  puesto: string;
  departamento: string;
  pais: string;
  estado: string;
  admin: boolean;
};

export default function AdminVisualizador() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [evaluadoresCompletados, setEvaluadoresCompletados] = useState<Set<string>>(new Set());
  const [autoevaluados, setAutoevaluados] = useState<Set<string>>(new Set());
  const [evaluadosPorOtro, setEvaluadosPorOtro] = useState<Set<string>>(new Set());

  const [paisFiltro, setPaisFiltro] = useState("");
  const [departamentoFiltro, setDepartamentoFiltro] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let authId = authUser?.id;

      if (!authId && process.env.NEXT_PUBLIC_DEV_AUTH === "true") {
        authId = '5fb9c280-2c69-4398-955c-4350c9ebc722'; // Dev id
      }

      if (authId) {
        const { data: miPerfil } = await supabase
          .from("users")
          .select("*")
          .eq("id", authId)
          .single();

        let perfil = miPerfil;
        if (!perfil && process.env.NODE_ENV === "development") {
          perfil = { id: authId, admin: true, nombre: "Dev Admin" };
        }

        if (perfil?.admin === true) {
          setIsAdmin(true);

          // Fetch all users
          const { data: allUsers } = await supabase
            .from("users")
            .select("id, nombre, puesto, departamento, pais, estado, admin")
            .order("nombre");

          if (allUsers) setUsuarios(allUsers as User[]);

          // Fetch completed evaluation evaluators
          const { data: evals } = await supabase
            .from("evaluaciones_completadas")
            .select("evaluador_id, evaluado_id");

          const completedSet = new Set<string>();
          const autoSet = new Set<string>();
          const porOtroSet = new Set<string>();

          if (evals) {
            evals.forEach(e => {
              completedSet.add(e.evaluador_id);
              if (e.evaluador_id === e.evaluado_id) {
                autoSet.add(e.evaluado_id);
              } else {
                porOtroSet.add(e.evaluado_id);
              }
            });
          }
          setEvaluadoresCompletados(completedSet);
          setAutoevaluados(autoSet);
          setEvaluadosPorOtro(porOtroSet);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <p className="text-red-700 mb-2 font-bold text-2xl">Acceso Denegado</p>
          <p className="text-gray-600">No tienes permisos de administrador para ver esta página. Por favor contacta al soporte si crees que esto es un error.</p>
        </div>
      </div>
    );
  }

  const paises = Array.from(new Set(usuarios.map(u => u.pais).filter(Boolean))).sort();
  const departamentos = Array.from(new Set(usuarios.map(u => u.departamento).filter(Boolean))).sort();

  const filteredUsers = usuarios.filter(u => {
    if (paisFiltro && u.pais !== paisFiltro) return false;
    if (departamentoFiltro && u.departamento !== departamentoFiltro) return false;
    return true;
  });

  const totalGlobal = usuarios.length;
  const usuariosCompletadosCount = usuarios.filter(u => evaluadoresCompletados.has(u.id) || u.estado === "Completada").length;
  const porcentajeGlobal = totalGlobal === 0 ? 0 : Math.round((usuariosCompletadosCount / totalGlobal) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="mb-[-1rem]">
          <Link href="/dashboard/equipo" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition font-medium text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Volver al Dashboard
          </Link>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Panel de Seguimiento</h1>
            <p className="text-gray-500 text-sm">Monitoreo del progreso de evaluaciones de desempeño por usuario</p>
          </div>
          <div className="bg-blue-50 py-4 px-6 rounded-xl border border-blue-100 flex items-center gap-6 w-full md:w-auto">
            <div>
              <div className="text-sm font-semibold text-blue-800 mb-1">Avance Global</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-blue-600">{porcentajeGlobal}%</span>
                <span className="text-sm text-blue-600 font-medium">({usuariosCompletadosCount}/{totalGlobal})</span>
              </div>
            </div>
            <div className="w-32 bg-blue-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${porcentajeGlobal}%` }}></div>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por País</label>
              <select
                className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 p-3 border outline-none transition-colors text-gray-700"
                value={paisFiltro}
                onChange={(e) => setPaisFiltro(e.target.value)}
              >
                <option value="">Todos los países</option>
                {paises.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Departamento</label>
              <select
                className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 p-3 border outline-none transition-colors text-gray-700"
                value={departamentoFiltro}
                onChange={(e) => setDepartamentoFiltro(e.target.value)}
              >
                <option value="">Todos los departamentos</option>
                {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Nombre</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Puesto</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">País</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Departamento</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Autoevaluación</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Evaluado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => {
                    const isCompleted = evaluadoresCompletados.has(user.id) || user.estado === "Completado";
                    const hasAuto = autoevaluados.has(user.id);
                    const hasJefe = evaluadosPorOtro.has(user.id);

                    return (
                      <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="p-4 text-gray-900 font-semibold">{user.nombre}</td>
                        <td className="p-4 text-gray-600">{user.puesto}</td>
                        <td className="p-4 text-gray-600">{user.pais || "N/A"}</td>
                        <td className="p-4 text-gray-600">{user.departamento || "N/A"}</td>
                        <td className="p-4">
                          {hasAuto ? (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-600 text-xs font-bold border border-green-100">Sí</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200">No</span>
                          )}
                        </td>
                        <td className="p-4">
                          {hasJefe ? (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">Sí</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200">No</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500 bg-gray-50">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-lg font-medium text-gray-600">No se encontraron usuarios</p>
                        <p className="text-sm text-gray-400 mt-1">Prueba ajustando los filtros de búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
