import React, { useState, useEffect, useRef } from 'react';

// Componente Team Animado
const Team = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const sectionRef = useRef(null);

  const teamMembers = [
    {
      name: 'Marina Silva',
      role: 'CEO & Fundadora',
      description: 'Especialista em tecnologia e inovação com mais de 10 anos de experiência em RH digital.',
      avatar: '👩‍💼',
      color: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-100',
      skills: ['Liderança', 'Inovação', 'RH Digital'],
      experience: '10+ anos'
    },
    {
      name: 'Carlos Santos',
      role: 'CTO',
      description: 'Engenheiro de software com expertise em IA e ML, liderando nossa equipe técnica.',
      avatar: '👨‍💻',
      color: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-100',
      skills: ['IA/ML', 'Arquitetura', 'DevOps'],
      experience: '8+ anos'
    },
    {
      name: 'Ana Costa',
      role: 'Head de Produto',
      description: 'Designer focada em experiências que conectam pessoas e oportunidades.',
      avatar: '👩‍🎨',
      color: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-100',
      skills: ['UX/UI', 'Product Design', 'Pesquisa'],
      experience: '6+ anos'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            teamMembers.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => [...new Set([...prev, index])]);
              }, index * 300);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-gradient-to-br from-gray-50 to-slate-100 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 left-20 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-20 w-72 h-72 bg-gradient-to-r from-emerald-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nossa <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Equipe</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Especialistas dedicados ao sucesso da sua carreira
          </p>
        </div>

        {/* Grid da Equipe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className={`
                group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden
                transform transition-all duration-700 ease-out cursor-pointer
                ${visibleCards.includes(index)
                  ? 'translate-y-0 opacity-100 scale-100' 
                  : 'translate-y-10 opacity-0 scale-95'
                }
                ${activeCard === index
                  ? 'translate-y-[-16px] scale-105' 
                  : 'hover:translate-y-[-12px] hover:scale-102'
                }
              `}
              style={{ 
                transitionDelay: `${index * 150}ms`,
                isolation: 'isolate'
              }}
              onClick={() => setActiveCard(activeCard === index ? null : index)}
            >
              {/* Background gradient animado */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${member.bgGradient} rounded-3xl 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
              `}></div>

              {/* Borda animada */}
              <div className={`
                absolute inset-0 rounded-3xl bg-gradient-to-r ${member.color} p-0.5
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
              `}>
                <div className="bg-white rounded-3xl w-full h-full"></div>
              </div>

              {/* Conteúdo */}
              <div className="relative z-10 p-8 text-center">
                {/* Avatar */}
                <div className={`
                  w-32 h-32 mx-auto mb-6 rounded-full 
                  bg-gradient-to-br ${member.color} 
                  flex items-center justify-center text-5xl text-white
                  transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110
                  shadow-lg group-hover:shadow-xl relative overflow-hidden
                `}>
                  <span className="relative z-10">{member.avatar}</span>
                  
                  {/* Efeito de brilho no avatar */}
                  <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Nome */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                  {member.name}
                </h3>

                {/* Cargo */}
                <p className={`
                  text-sm font-semibold uppercase tracking-wider mb-4
                  bg-gradient-to-r ${member.color} bg-clip-text text-transparent
                `}>
                  {member.role}
                </p>

                {/* Experiência */}
                <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-600 mb-4">
                  <span className="mr-1">⏱️</span>
                  {member.experience}
                </div>

                {/* Descrição */}
                <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                  {member.description}
                </p>

                {/* Skills expandíveis */}
                <div className={`
                  transition-all duration-300 ease-out overflow-hidden
                  ${activeCard === index ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}
                `}>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {member.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium text-white
                          bg-gradient-to-r ${member.color}
                          transform transition-all duration-300 hover:scale-105
                        `}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Indicador de expansão */}
                <div className="flex justify-center">
                  <button className={`
                    w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 
                    flex items-center justify-center transition-all duration-300
                    transform ${activeCard === index ? 'rotate-180' : 'rotate-0'}
                  `}>
                    <span className="text-gray-500 text-sm">↓</span>
                  </button>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;