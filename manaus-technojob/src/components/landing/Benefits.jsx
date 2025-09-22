import React, { useState, useEffect, useRef } from "react";

export default function Benefits() {
  const [visibleItems, setVisibleItems] = useState([]);
  const [activeTab, setActiveTab] = useState('freelancers');
  const [headerVisible, setHeaderVisible] = useState(false);
  const sectionRef = useRef(null);

  const benefitsData = {
    freelancers: {
      title: "Benefícios para Freelancers",
      subtitle: "Acelere sua carreira e encontre projetos ideais",
      image: "/images/benefits-hiring.jpg",
      imageAlt: "Freelancer trabalhando em laptop com projetos",
      benefits: [
        { 
          text: "Oportunidades Qualificadas", 
          sub: "Receba apenas projetos que combinam com seu perfil e habilidades",
          icon: "🎯",
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-50"
        },
        { 
          text: "Perfil Otimizado por IA", 
          sub: "Nossa IA otimiza seu perfil para máxima visibilidade",
          icon: "⚡",
          color: "from-purple-500 to-pink-500", 
          bgColor: "bg-purple-50"
        },
        { 
          text: "Negociação Facilitada", 
          sub: "Ferramentas integradas para propostas e contratos",
          icon: "💼",
          color: "from-emerald-500 to-green-500",
          bgColor: "bg-emerald-50"
        },
        { 
          text: "Pagamentos Seguros", 
          sub: "Sistema de escrow que protege seus honorários",
          icon: "🛡️",
          color: "from-orange-500 to-red-500",
          bgColor: "bg-orange-50"
        },
      ],
      stats: { number: "89%", label: "Aumento na taxa de contratação" }
    },
    empresas: {
      title: "Benefícios para Empresas", 
      subtitle: "Contrate talentos com precisão e agilidade",
      image: "/images/benefits-hiring.jpg",
      imageAlt: "Gestor analisando candidatos na tela",
      benefits: [
        { 
          text: "Redução da Burocracia", 
          sub: "Processo de contratação mais ágil e eficiente",
          icon: "⚡",
          color: "from-orange-500 to-red-500",
          bgColor: "bg-orange-50"
        },
        { 
          text: "Análise Inteligente", 
          sub: "IA analisa currículos e reduz sobrecarga dos recrutadores",
          icon: "🧠",
          color: "from-purple-500 to-pink-500", 
          bgColor: "bg-purple-50"
        },
        { 
          text: "Filtragem Eficiente", 
          sub: "Candidatos pré-qualificados para cada vaga",
          icon: "🔍",
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-50"
        },
        { 
          text: "Matches Qualificados", 
          sub: "Evita contratações com candidatos desqualificados",
          icon: "✅",
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-green-50"
        },
      ],
      stats: { number: "85%", label: "Redução no tempo de contratação" }
    }
  };

  const currentData = benefitsData[activeTab];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Header primeiro
            setTimeout(() => setHeaderVisible(true), 200);
            
            // Limpar e recriar animação dos items
            setVisibleItems([]);
            currentData.benefits.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems(prev => [...new Set([...prev, index])]);
              }, 400 + (index * 200));
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
  }, [activeTab]);

  // Reset animations when changing tab
  useEffect(() => {
    setVisibleItems([]);
    setHeaderVisible(false);
    
    setTimeout(() => {
      setHeaderVisible(true);
      currentData.benefits.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => [...new Set([...prev, index])]);
        }, 200 + (index * 150));
      });
    }, 100);
  }, [activeTab]);

  return (
    <section ref={sectionRef} id="beneficios" className="py-20 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Tabs/Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/70 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20">
            <div className="flex">
              <button
                onClick={() => setActiveTab('freelancers')}
                className={`
                  relative px-8 py-3 rounded-xl font-semibold transition-all duration-300
                  ${activeTab === 'freelancers'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                👨‍💻 Para Freelancers
                {activeTab === 'freelancers' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 -z-10"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('empresas')}
                className={`
                  relative px-8 py-3 rounded-xl font-semibold transition-all duration-300
                  ${activeTab === 'empresas'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                🏢 Para Empresas
                {activeTab === 'empresas' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-30 -z-10"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Conteúdo de texto */}
          <div>
            {/* Header */}
            <div className={`mb-10 transform transition-all duration-1000 ease-out ${
              headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {currentData.title.split(' ').slice(0, 2).join(' ')}{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentData.title.split(' ').slice(2).join(' ')}
                </span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4"></div>
              <p className="text-lg text-slate-600">{currentData.subtitle}</p>
            </div>

            {/* Lista de benefícios */}
            <ul className="space-y-6">
              {currentData.benefits.map((benefit, index) => (
                <li
                  key={`${activeTab}-${index}`}
                  className={`
                    group flex items-start gap-4 p-4 rounded-2xl
                    transform transition-all duration-700 ease-out cursor-pointer
                    ${visibleItems.includes(index)
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-8 opacity-0 scale-95'
                    }
                    hover:translate-x-2 hover:shadow-lg
                  `}
                  style={{ 
                    transitionDelay: `${index * 1000}ms`,
                  }}
                >
                  {/* Background hover sutil */}
                  <div className={`absolute inset-0 ${benefit.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Ícone animado */}
                  <div className={`
                    relative z-10 flex-shrink-0 w-14 h-14 rounded-xl
                    bg-gradient-to-br ${benefit.color} 
                    flex items-center justify-center text-white text-xl
                    shadow-lg group-hover:shadow-xl
                    transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110
                  `}>
                    <span className="relative z-10">{benefit.icon}</span>
                    
                    {/* Brilho no ícone */}
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Conteúdo */}
                  <div className="relative z-10 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                      {benefit.text}
                    </h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                      {benefit.sub}
                    </p>
                    
                    {/* Indicador de progresso */}
                    <div className={`
                      mt-3 w-full h-0.5 rounded-full bg-gradient-to-r ${benefit.color}
                      transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300
                    `}></div>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </li>
              ))}
            </ul>

            {/* Estatística adicional */}
            <div className={`mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 transform transition-all duration-1000 ease-out ${
              visibleItems.length >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`} style={{ transitionDelay: '1200ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {currentData.stats.number}
                  </div>
                  <div className="text-slate-600 text-sm">
                    {currentData.stats.label}
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                  📈
                </div>
              </div>
            </div>
          </div>

          {/* Imagem */}
          <div className={activeTab === 'freelancers' ? 'order-first lg:order-none' : 'order-first lg:order-none'}>
            <div className={`
              relative group overflow-hidden rounded-3xl shadow-2xl
              transform transition-all duration-1000 ease-out
              ${headerVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}
            `}>
              {/* Borda animada */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white rounded-3xl w-full h-full"></div>
              </div>

              <div className="relative overflow-hidden rounded-3xl">
                <img
                  key={activeTab}
                  src={currentData.image}
                  alt={currentData.imageAlt}
                  className="w-full h-80 object-cover transform transition-all duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay com gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Badge flutuante */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-700 text-sm font-semibold">
                      {activeTab === 'freelancers' ? 'Perfil Ativo' : 'IA Ativa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}