import React, { useState, useEffect, useRef } from 'react';

// Componente Objectives Animado
const Objectives = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const sectionRef = useRef(null);

  const objectives = [
    {
      icon: '📄',
      title: 'Reduzir a Burocracia',
      description: 'Simplificar e agilizar os processos de contratação, eliminando etapas desnecessárias e reduzindo o tempo para conectar talentos às oportunidades.',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: '🧠',
      title: 'Análise Inteligente',
      description: 'Facilitar a análise de currículos via IA, reduzindo a sobrecarga dos recrutadores e permitindo decisões mais assertivas.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: '🔎',
      title: 'Filtragem Eficiente',
      description: 'Implementar filtros automáticos que identifiquem os candidatos mais qualificados para cada posição específica.',
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50'
    },
    {
      icon: '✅',
      title: 'Qualidade Garantida',
      description: 'Evitar contratações equivocadas, elevando a taxa de sucesso nos processos seletivos.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            objectives.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => [...new Set([...prev, index])]);
              }, index * 200);
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
    <section ref={sectionRef} className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nossos <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Objetivos</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transformando o futuro do trabalho freelancer
          </p>
        </div>

        {/* Grid de Objetivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {objectives.map((objective, index) => (
            <div
              key={index}
              className={`
                group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl overflow-hidden
                transform transition-all duration-700 ease-out cursor-pointer
                ${visibleCards.includes(index)
                  ? 'translate-y-0 opacity-100 scale-100' 
                  : 'translate-y-8 opacity-0 scale-95'
                }
                hover:translate-y-[-8px] hover:scale-102
              `}
              style={{ 
                transitionDelay: `${index * 100}ms`,
                isolation: 'isolate'
              }}
            >
              {/* Background gradient sutil */}
              <div className={`absolute inset-0 ${objective.bgColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
              
              {/* Conteúdo */}
              <div className="relative z-10">
                {/* Ícone */}
                <div className={`
                  w-20 h-20 rounded-2xl mb-6 flex items-center justify-center text-3xl
                  bg-gradient-to-br ${objective.color} text-white
                  transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110
                  shadow-lg group-hover:shadow-xl
                `}>
                  {objective.icon}
                </div>

                {/* Título */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                  {objective.title}
                </h3>

                {/* Descrição */}
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {objective.description}
                </p>

                {/* Indicador de hover */}
                <div className={`
                  mt-6 w-full h-1 rounded-full bg-gradient-to-r ${objective.color}
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300
                `}></div>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="group">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              95%
            </div>
            <p className="text-gray-600 group-hover:text-gray-800 transition-colors">Redução no tempo de processo</p>
          </div>
          <div className="group">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              80%
            </div>
            <p className="text-gray-600 group-hover:text-gray-800 transition-colors">Melhoria na qualidade dos matches</p>
          </div>
          <div className="group">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              60%
            </div>
            <p className="text-gray-600 group-hover:text-gray-800 transition-colors">Economia de recursos</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Objectives;