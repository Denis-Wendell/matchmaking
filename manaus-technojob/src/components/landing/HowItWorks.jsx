import React, { useState, useEffect, useRef } from "react";

export default function HowItWorks() {
  const [visibleCards, setVisibleCards] = useState([]);
  const sectionRef = useRef(null);

  const steps = [
    {
      title: "Cadastre-se",
      desc: "Freelancers criam perfis detalhados com habilidades e experiências. Empresas cadastram informações e necessidades de contratação.",
      icon: "👤",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      number: "01"
    },
    {
      title: "IA Analisa",
      desc: "Nossa Inteligência Artificial analisa perfis, habilidades e requisitos para encontrar as melhores combinações possíveis.",
      icon: "🤖",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      number: "02"
    },
    {
      title: "Match Perfeito",
      desc: "Apresentamos matches compatíveis, facilitando conexões eficientes entre freelancers qualificados e empresas.",
      icon: "💜",
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50",
      number: "03"
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            steps.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => [...new Set([...prev, index])]);
              }, index * 300);
            });
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
    <section ref={sectionRef} id="como-funciona" className="py-20 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 left-10 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-10 w-72 h-72 bg-gradient-to-r from-emerald-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Como <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Funciona</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Processo simples e eficiente com tecnologia avançada
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {/* Linha conectora - apenas desktop */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5">
            <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full opacity-30"></div>
          </div>

          {steps.map((step, index) => (
            <div
              key={index}
              className={`
                group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 overflow-hidden
                transform transition-all duration-700 ease-out cursor-pointer
                ${visibleCards.includes(index)
                  ? 'translate-y-0 opacity-100 scale-100' 
                  : 'translate-y-10 opacity-0 scale-95'
                }
                hover:translate-y-[-8px] hover:scale-105
              `}
              style={{ 
                transitionDelay: `${index * 200}ms`,
                isolation: 'isolate'
              }}
            >
              {/* Background gradient sutil */}
              <div className={`absolute inset-0 ${step.bgColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

              {/* Número do passo */}
              <div className={`
                absolute -top-1 -right-1 w-12 h-12 rounded-2xl
                bg-gradient-to-br ${step.color} text-white
                flex items-center justify-center text-lg font-bold
                shadow-lg transform group-hover:scale-110 transition-all duration-300
              `}>
                {step.number}
              </div>

              {/* Conteúdo */}
              <div className="relative z-10 text-center">
                {/* Ícone */}
                <div className={`
                  w-20 h-20 mx-auto mb-6 rounded-2xl 
                  bg-gradient-to-br ${step.color} 
                  flex items-center justify-center text-4xl text-white
                  transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110
                  shadow-lg group-hover:shadow-xl relative overflow-hidden
                `}>
                  <span className="relative z-10">{step.icon}</span>
                  
                  {/* Efeito de brilho no ícone */}
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Título */}
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                  {step.title}
                </h3>

                {/* Descrição */}
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                  {step.desc}
                </p>

                {/* Indicador de progresso */}
                <div className={`
                  mt-6 w-full h-1 rounded-full bg-gradient-to-r ${step.color}
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300
                `}></div>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
              
              {/* Borda animada */}
              <div className={`
                absolute inset-0 rounded-3xl bg-gradient-to-r ${step.color} p-0.5
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
              `}>
                <div className="bg-white rounded-3xl w-full h-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 text-slate-700">
            <span className="mr-2">⚡</span>
            <span className="font-semibold">Processo completo em menos de 5 minutos</span>
          </div>
        </div>
      </div>
    </section>
  );
}