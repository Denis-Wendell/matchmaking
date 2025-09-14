import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [perfil, setPerfil] = useState("freelancer");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rotaCadastro = perfil === "freelancer" ? "/cadastro-freelancer" : "/cadastro-empresa";

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Limpar erros anteriores
    setError("");
    
    // Validação básica
    if (!email || !senha) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, insira um email válido");
      return;
    }

    setLoading(true);

    try {
      // Fazer login via API
      const response = await fetch('http://localhost:3001/api/auth/login-unificado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          senha: senha,
          tipo: perfil,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Login bem-sucedido
        console.log('✅ Login realizado:', result.data);
        
        // Salvar dados no localStorage
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('freelancerData', JSON.stringify(result.data.freelancer));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Redirecionar baseado no perfil
        if (perfil === "freelancer") {
          nav("/match-vaga");
        } else {
          // Para empresas, você precisará implementar sistema separado
          nav("/match-empresa");
        }
        
      } else {
        // Erro no login - tratar diferentes tipos de erro
        if (response.status === 401) {
          if (result.message === 'Credenciais inválidas') {
            setError("Email ou senha incorretos. Verifique seus dados e tente novamente.");
          } else if (result.message === 'Conta desativada ou pendente') {
            setError("Sua conta está desativada. Entre em contato com o suporte.");
          } else {
            setError("Email ou senha incorretos.");
          }
        } else if (response.status === 400) {
          setError("Dados inválidos. Verifique o formato do email.");
        } else if (response.status === 500) {
          setError("Erro no servidor. Tente novamente em alguns minutos.");
        } else {
          setError(result.message || "Erro ao fazer login. Tente novamente.");
        }
      }

    } catch (error) {
      console.error('❌ Erro na requisição de login:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
      } else {
        setError("Erro de conexão. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

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

          {/* Mensagem de Erro */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}

          {/* Abas */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setPerfil("freelancer");
                setError("");
              }}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                perfil === "freelancer"
                  ? "bg-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Freelancer
            </button>
            <button
              type="button"
              onClick={() => {
                setPerfil("empresa");
                setError("");
              }}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(""); // Limpar erro ao digitar
                }}
                className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#2E86FF] ${
                  error ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="seu@email.com"
                disabled={loading}
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
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setError(""); // Limpar erro ao digitar
                  }}
                  className={`w-full rounded-lg border px-3 py-2 pr-12 outline-none focus:ring-2 focus:ring-[#2E86FF] ${
                    error ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm disabled:opacity-50"
                  disabled={loading}
                >
                  {show ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !senha}
              className="w-full rounded-lg bg-[#2E86FF] px-5 py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? "Entrando..." : "Entrar"}
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

            {/* Link para recuperar senha */}
            <p className="text-center text-sm text-slate-600">
              Esqueceu sua senha?{" "}
              <button
                type="button"
                onClick={() => setError("Funcionalidade de recuperação de senha em desenvolvimento")}
                className="font-semibold text-[#2E86FF] hover:opacity-90"
              >
                Recuperar senha
              </button>
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
                disabled={loading}
                onClick={() => setError("Login social em desenvolvimento")}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
                disabled={loading}
                onClick={() => setError("Login social em desenvolvimento")}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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