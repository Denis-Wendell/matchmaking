import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [perfil, setPerfil] = useState("freelancer");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);

  const rotaCadastro =
    perfil === "freelancer" ? "/cadastro-freelancer" : "/cadastro-empresa";

  function onSubmit(e) {
    e.preventDefault();
    if (!email || !senha) return;
    nav(perfil === "freelancer" ? "/match-vaga" : "/match-empresa");
  }

  return (
    <main className="bg-slate-50 min-h-[70vh] py-12">
      <div className="mx-auto max-w-md px-6">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-6 md:p-8">
          <h1 className="text-3xl font-extrabold text-slate-900 text-center">
            Fazer Login
          </h1>
          <p className="mt-2 text-slate-500 text-center">
            Acesse sua conta TalentMatch
          </p>

          {/* Abas */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setPerfil("freelancer")}
              className={`rounded-lg py-2 text-sm font-semibold ${
                perfil === "freelancer"
                  ? "bg-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Freelancer
            </button>
            <button
              type="button"
              onClick={() => setPerfil("empresa")}
              className={`rounded-lg py-2 text-sm font-semibold ${
                perfil === "empresa"
                  ? "bg-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Empresa
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#2E86FF]"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Senha
              </label>
              <div className="relative mt-1">
                <input
                  type={show ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-12 outline-none focus:ring-2 focus:ring-[#2E86FF]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm"
                >
                  {show ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#2E86FF] px-5 py-2.5 font-semibold text-white hover:opacity-90"
            >
              Entrar
            </button>

            <p className="text-center text-sm text-slate-600">
              Não tem uma conta?{" "}
              <Link
                to={rotaCadastro}
                className="font-semibold text-[#2E86FF] hover:opacity-90"
              >
                Cadastre-se aqui
              </Link>
            </p>

            {/* Divisor */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-slate-400">
                  Ou continue com
                </span>
              </div>
            </div>

            {/* Social logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                <img
                  src="https://www.svgrepo.com/show/448234/linkedin.svg"
                  alt="LinkedIn"
                  className="h-5 w-5"
                />
                LinkedIn
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
