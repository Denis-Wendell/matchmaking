// src/pages/Match_empresas.jsx
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';

function Match_empresa() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    area: 'todas',
    modalidade: 'todas',
    nivel: 'todos'
  });

  // Dados de exemplo dos freelancers
  const freelancersMock = [
    {
      id: 1,
      nome: "Ana Silva Santos",
      titulo: "Desenvolvedora React Sênior",
      area: "Desenvolvimento Web",
      nivel: "Sênior",
      modalidade: "Híbrido",
      periodo: "Período integral",
      localizacao: "Manaus - AM",
      experiencia: "6 anos de experiência em desenvolvimento web, especializada em React e arquiteturas escaláveis.",
      valorHora: "R$ 85/hora",
      habilidades: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Jest", "Redux"],
      formacao: "Bacharelado em Ciência da Computação - UFAM",
      certificacoes: "AWS Certified Developer, React Advanced",
      matchPercentual: 95,
      portfolio: true,
      linkedin: true,
      github: true,
      compatibilidadeVaga: "Desenvolvedor React Sênior"
    },
    {
      id: 2,
      nome: "Lucas Mendes Silva",
      titulo: "Desenvolvedor Mobile Flutter",
      area: "Desenvolvimento Mobile",
      nivel: "Pleno",
      modalidade: "Remoto",
      periodo: "Período integral",
      localizacao: "Manaus - AM",
      experiencia: "3 anos desenvolvendo apps mobile, com foco em performance e experiência do usuário.",
      valorHora: "R$ 70/hora",
      habilidades: ["Flutter", "Dart", "Firebase", "REST APIs", "Git", "SQLite", "Provider"],
      formacao: "Análise e Desenvolvimento de Sistemas - IFAM",
      certificacoes: "Flutter Certified, Firebase Associate",
      matchPercentual: 94,
      portfolio: true,
      linkedin: true,
      github: true,
      compatibilidadeVaga: "Desenvolvedor Mobile Flutter"
    },
    {
      id: 3,
      nome: "Mariana Costa Lima",
      titulo: "UX/UI Designer",
      area: "Design",
      nivel: "Pleno",
      modalidade: "Híbrido",
      periodo: "Meio período",
      localizacao: "Manaus - AM",
      experiencia: "4 anos criando interfaces centradas no usuário para web e mobile.",
      valorHora: "R$ 65/hora",
      habilidades: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research", "Design System"],
      formacao: "Design Gráfico - UEA",
      certificacoes: "Google UX Design Certificate",
      matchPercentual: 92,
      portfolio: true,
      linkedin: true,
      github: false,
      compatibilidadeVaga: "UX/UI Designer Pleno"
    },
    {
      id: 4,
      nome: "Rafael Santos Oliveira",
      titulo: "Desenvolvedor Full Stack",
      area: "Desenvolvimento Web",
      nivel: "Sênior",
      modalidade: "Remoto",
      periodo: "Período integral",
      localizacao: "Manaus - AM",
      experiencia: "8 anos de experiência em desenvolvimento full stack, especializado em JavaScript.",
      valorHora: "R$ 90/hora",
      habilidades: ["JavaScript", "React", "Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
      formacao: "Engenharia de Software - UNINORTE",
      certificacoes: "AWS Solutions Architect, Node.js Certified",
      matchPercentual: 89,
      portfolio: true,
      linkedin: true,
      github: true,
      compatibilidadeVaga: "Desenvolvedor Full Stack Sênior"
    },
    {
      id: 5,
      nome: "Camila Rodrigues",
      titulo: "Marketing Digital Specialist",
      area: "Marketing",
      nivel: "Pleno",
      modalidade: "Presencial",
      periodo: "Período integral",
      localizacao: "Manaus - AM",
      experiencia: "5 anos em marketing digital, especializada em campanhas para e-commerce.",
      valorHora: "R$ 60/hora",
      habilidades: ["Google Ads", "Facebook Ads", "Analytics", "SEO", "Email Marketing", "Copywriting"],
      formacao: "Marketing - FAMETRO",
      certificacoes: "Google Ads Certified, Facebook Blueprint",
      matchPercentual: 87,
      portfolio: true,
      linkedin: true,
      github: false,
      compatibilidadeVaga: "Especialista em Marketing Digital"
    }
  ];

  useEffect(() => {
    // Simula carregamento de dados
    setTimeout(() => {
      setFreelancers(freelancersMock);
      setLoading(false);
    }, 1000);
  }, []);

  const filtrarFreelancers = () => {
    return freelancers.filter(freelancer => {
      if (filtros.area !== 'todas' && !freelancer.area.toLowerCase().includes(filtros.area.toLowerCase())) return false;
      if (filtros.modalidade !== 'todas' && freelancer.modalidade !== filtros.modalidade) return false;
      if (filtros.nivel !== 'todos' && freelancer.nivel !== filtros.nivel) return false;
      return true;
    });
  };

  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: valor
    }));
  };

  const freelancersFiltrados = filtrarFreelancers();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Match de Freelancers
            </h1>
            <p className="text-xl text-gray-600">
              Encontre os freelancers mais compatíveis com suas vagas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área de Atuação
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.area}
                onChange={(e) => handleFiltroChange('area', e.target.value)}
              >
                <option value="todas">Todas as áreas</option>
                <option value="desenvolvimento">Desenvolvimento</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modalidade
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.modalidade}
                onChange={(e) => handleFiltroChange('modalidade', e.target.value)}
              >
                <option value="todas">Todas</option>
                <option value="Remoto">Remoto</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Experiência
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.nivel}
                onChange={(e) => handleFiltroChange('nivel', e.target.value)}
              >
                <option value="todos">Todos os níveis</option>
                <option value="Júnior">Júnior</option>
                <option value="Pleno">Pleno</option>
                <option value="Sênior">Sênior</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => setFiltros({ area: 'todas', modalidade: 'todas', nivel: 'todos' })}
                variant="outline"
                className="w-full py-3"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 flex justify-between items-center">
            <span>
              <span className="font-medium text-blue-600">{freelancersFiltrados.length}</span> freelancers compatíveis encontrados
            </span>
            <span className="text-sm text-gray-500">
              Ordenado por: Compatibilidade ↓
            </span>
          </div>
        </div>

        {/* Lista de Freelancers */}
        <div className="space-y-4">
          {freelancersFiltrados.map(freelancer => (
            <div key={freelancer.id} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {freelancer.nome}
                      </h3>
                      <div className="flex items-center text-blue-600 mb-2">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{freelancer.titulo}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {freelancer.localizacao}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {freelancer.valorHora}
                      </div>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        Match: {freelancer.matchPercentual}%
                      </div>
                    </div>
                  </div>

                  {/* Tags de caracteristicas */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {freelancer.area}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {freelancer.nivel}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {freelancer.modalidade}
                    </span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      {freelancer.periodo}
                    </span>
                  </div>

                  {/* Box de compatibilidade */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center text-blue-700">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Compatível com: {freelancer.compatibilidadeVaga}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{freelancer.experiencia}</p>

                  {/* Principais Habilidades */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Principais Habilidades:</h4>
                    <div className="flex flex-wrap gap-2">
                      {freelancer.habilidades.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Formação e Certificações */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Formação:</h4>
                      <p className="text-sm text-gray-600">{freelancer.formacao}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Certificações:</h4>
                      <p className="text-sm text-gray-600">{freelancer.certificacoes}</p>
                    </div>
                  </div>

                  {/* Footer com links e botões */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      {freelancer.portfolio && (
                        <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 6H4v4h12v-4z" clipRule="evenodd" />
                          </svg>
                          Portfólio
                        </button>
                      )}
                      {freelancer.linkedin && (
                        <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                          </svg>
                          LinkedIn
                        </button>
                      )}
                      {freelancer.github && (
                        <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                          </svg>
                          GitHub
                        </button>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        Favoritar
                      </Button>
                      <Button variant="outline" size="sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Conversar
                      </Button>
                      <Button size="sm">
                        Convidar para Vaga
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Match_empresa;