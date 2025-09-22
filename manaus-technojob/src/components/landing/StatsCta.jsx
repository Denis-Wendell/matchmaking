import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function StatsCta() {
  const [visibleStats, setVisibleStats] = useState([]);
  const [animatedNumbers, setAnimatedNumbers] = useState({});
  const [ctaVisible, setCtaVisible] = useState(false);
  const sectionRef = useRef(null);

  const stats = [
    { 
      value: "5.000+", 
      label: "Freelancers Cadastrados", 
      color: "text-blue-600",
      gradient: "from-blue-500 to-indigo-600",
      icon: "👥",
      finalNumber: 5000
    },
    { 
      value: "1.200+", 
      label: "Empresas Parceiras", 
      color: "text-emerald-600",
      gradient: "from-emerald-500 to-green-600", 
      icon: "🏢",
      finalNumber: 1200
    },
    { 
      value: "8.500+", 
      label: "Matches Realizados", 
      color: "text-purple-600",
      gradient: "from-purple-500 to-pink-600",
      icon: "🎯", 
      finalNumber: 8500
    },
    { 
      value: "95%", 
      label: "Taxa de Satisfação", 
      color: "text-orange-600",
      gradient: "from-orange-500 to-red-500",
      icon: "⭐",
      finalNumber: 95
    },
  ];

  // Animação de contagem dos números
  const animateNumber = (finalNumber, index, isPercentage = false) => {
    let current = 0;
    const increment = finalNumber / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= finalNumber) {
        current = finalNumber;
        clearInterval(timer);
      }
      setAnimatedNumbers(prev => ({
        ...prev,
        [index]: isPercentage ? `${Math.floor(current)}%` : `${Math.floor(current).toLocaleString()}+`
      }));
    }, 40);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animar estatísticas primeiro
            stats.forEach((stat, index) => {
              setTimeout(() => {
                setVisibleStats(prev => [...new Set([...prev, index])]);
                
                // Iniciar animação de números após o elemento aparecer
                setTimeout(() => {
                  animateNumber(
                    stat.finalNumber, 
                    index, 
                    stat.value.includes('%')
                  );
                }, 200);
              }, index * 200);
            });

            // CTA por último
            setTimeout(() => {
              setCtaVisible(true);
            }, stats.length * 200 + 500);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="stats" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-200/15 to-purple-200/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-emerald-200/15 to-orange-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`
                group relative text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl border border-white/20 overflow-hidden
                transform transition-all duration-700 ease-out cursor-pointer
                ${visibleStats.includes(index)
                  ? 'translate-y-0 opacity-100 scale-100' 
                  : 'translate-y-8 opacity-0 scale-95'
                }
                hover:translate-y-[-4px] hover:scale-105
              `}
              style={{ 
                transitionDelay: `${index * 150}ms`,
                isolation: 'isolate'
              }}
            >
              {/* Ícone */}
              <div className={`
                w-16 h-16 mx-auto mb-4 rounded-2xl
                bg-gradient-to-br ${stat.gradient} 
                flex items-center justify-center text-2xl text-white
                shadow-lg group-hover:shadow-xl
                transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110
              `}>
                {stat.icon}
              </div>

              {/* Número animado */}
              <p className={`text-3xl md:text-4xl font-extrabold ${stat.color} mb-2 transition-colors duration-300`}>
                {animatedNumbers[index] || '0'}
              </p>

              {/* Label */}
              <p className="text-slate-600 group-hover:text-slate-800 transition-colors duration-300 font-medium">
                {stat.label}
              </p>

              {/* Indicador de progresso */}
              <div className={`
                mt-4 w-full h-1 rounded-full bg-gradient-to-r ${stat.gradient}
                transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300
              `}></div>

              {/* Shine effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`
          transform transition-all duration-1000 ease-out
          ${ctaVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
        `}>
          <div className="group relative rounded-3xl p-12 text-center text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl hover:shadow-blue-500/25 overflow-hidden">
            {/* Background animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Partículas decorativas */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                  style={{
                    left: `${10 + (i * 10)}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${3 + (i % 3)}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              {/* Título */}
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para Encontrar o{" "}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Match Perfeito?
                </span>
              </h3>

              {/* Subtítulo */}
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Junte-se a milhares de profissionais e empresas que já encontraram sucesso
              </p>

              {/* Botões */}
              <div className="flex items-center justify-center gap-6 flex-col sm:flex-row">
                <Link 
                  to="/cadastro-freelancer" 
                  className="group/btn relative inline-flex items-center justify-center rounded-2xl bg-white text-slate-900 px-8 py-4 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Cadastrar como Freelancer
                  </span>
                  {/* Shine effect no botão */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                </Link>

                <Link 
                  to="/cadastro-empresa" 
                  className="group/btn relative inline-flex items-center justify-center rounded-2xl ring-2 ring-white/60 text-white px-8 py-4 font-bold hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" />
                    </svg>
                    Cadastrar Empresa
                  </span>
                </Link>
              </div>

              {/* Info adicional */}
              <div className="mt-8 text-white/70 text-sm">
                Cadastro gratuito • Matches em minutos • Sem compromisso
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </section>
  );
}