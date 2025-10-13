import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);

  const highlightWords = ["Talentos", "os Melhores", "Sucesso"];

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 300);

    // Animação das palavras destacadas
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % highlightWords.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="inicio" className="relative h-[88vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background com parallax effect */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-office.jpg"
          alt="Equipe trabalhando em escritório"
          className="absolute inset-0 h-full w-full object-cover transform scale-110 transition-transform duration-[8000ms] ease-out hover:scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-800/60 to-blue-900/70" />
        
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-ping" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className={`relative z-10 max-w-5xl px-6 text-center transform transition-all duration-1000 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        {/* Badge animado */}
        <div className={`mb-8 transform transition-all duration-1000 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '200ms' }}>
          <span className="inline-block bg-blue-600/20 backdrop-blur-sm text-blue-200 px-6 py-3 rounded-full text-sm font-medium border border-blue-400/30 hover:border-blue-300/50 transition-all duration-300 cursor-default">
            ✨ Powered by IA • Conectando o Amazonas
          </span>
        </div>

        {/* Título Principal com animação de palavras */}
        <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white mb-6 transform transition-all duration-1000 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`} style={{ transitionDelay: '400ms' }}>
          Conectamos{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
              {highlightWords[currentWord]}
            </span>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transform scale-x-0 animate-pulse"></div>
          </span>
          {" "}às Melhores{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Oportunidades
          </span>
        </h1>

        {/* Subtítulo */}
        <p className={`text-slate-100/90 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed transform transition-all duration-1000 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`} style={{ transitionDelay: '600ms' }}>
          Plataforma inteligente de matchmaking que{" "}
          <span className="text-blue-300 font-semibold">revoluciona a contratação</span>{" "}
          e otimiza processos através de Inteligência Artificial
        </p>

        {/* Botões com efeitos hover avançados */}
        <div className={`mt-10 flex items-center justify-center gap-6 flex-col sm:flex-row transform transition-all duration-1000 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`} style={{ transitionDelay: '800ms' }}>
          <Link
            to="/cadastro-freelancer"
            className="group relative inline-flex items-center justify-center rounded-2xl px-8 py-4 font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Sou Freelancer
            </span>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>

          <Link
            to="/cadastro-empresa"
            className="group relative inline-flex items-center justify-center rounded-2xl px-8 py-4 font-bold bg-white/10 backdrop-blur-sm text-white ring-2 ring-white/30 hover:bg-white hover:text-slate-900 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" />
              </svg>
              Sou Empresa
            </span>
          </Link>
        </div>

        {/* Indicador de scroll animado */}
        <div className={`mt-16 transform transition-all duration-1000 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`} style={{ transitionDelay: '1000ms' }}>
          <div className="flex flex-col items-center">
            <span className="text-white/60 text-sm mb-2">Descubra mais</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Partículas flutuantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { transform: translateY(-100vh) rotate(180deg); }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </section>
  );
}