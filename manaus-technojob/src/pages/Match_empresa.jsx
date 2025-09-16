// src/pages/Match_empresas.jsx
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';

function Match_empresa() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    area: 'todas',
    modalidade: 'todas',
    porte: 'todos'
  });

  // Dados de exemplo das empresas
  const empresasMock = [
    {
      id: 1,
      nome: "TechAmazonia Solutions",
      area: "Tecnologia",
      descricao: "Empresa líder em soluções tecnológicas para a região Norte",
      modalidade: "Híbrido",
      localizacao: "Manaus, AM",
      porte: "Média",
      vagasAbertas: 5,
      tecnologias: ["React", "Node.js", "Python", "AWS"],
      beneficios: ["Plano de saúde", "Vale refeição", "Home office"],
      matchPercentual: 95,
      salarioRange: "R$ 6.000 - R$ 12.000"
    },
    {
      id: 2,
      nome: "Design Studio Manaus",
      area: "Design",
      descricao: "Estúdio criativo especializado em UX/UI e branding",
      modalidade: "Presencial",
      localizacao: "Manaus, AM",
      porte: "Pequena",
      vagasAbertas: 3,
      tecnologias: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
      beneficios: ["Flexibilidade de horário", "Cursos pagos", "Equipamentos fornecidos"],
      matchPercentual: 88,
      salarioRange: "R$ 4.000 - R$ 8.000"
    },
    {
      id: 3,
      nome: "Agência Digital Norte",
      area: "Marketing Digital",
      descricao: "Agência especializada em marketing digital e performance",
      modalidade: "Remoto",
      localizacao: "Manaus, AM",
      porte: "Grande",
      vagasAbertas: 8,
      tecnologias: ["Google Ads", "Facebook Ads", "Analytics", "SEO"],
      beneficios: ["Plano de saúde", "Vale alimentação", "Comissão por resultado"],
      matchPercentual: 82,
      salarioRange: "R$ 5.000 - R$ 10.000"
    },
    {
      id: 4,
      nome: "StartupTech Amazônia",
      area: "Startup",
      descricao: "Startup focada em inovação e sustentabilidade na Amazônia",
      modalidade: "Híbrido",
      localizacao: "Manaus, AM",
      porte: "Pequena",
      vagasAbertas: 2,
      tecnologias: ["React Native", "Flutter", "IoT", "Machine Learning"],
      beneficios: ["Equity", "Ambiente jovem", "Projetos inovadores"],
      matchPercentual: 90,
      salarioRange: "R$ 4.500 - R$ 9.000"
    },
    {
      id: 5,
      nome: "Consultoria Tech BR",
      area: "Consultoria",
      descricao: "Consultoria em transformação digital para grandes empresas",
      modalidade: "Híbrido",
      localizacao: "Manaus, AM",
      porte: "Grande",
      vagasAbertas: 12,
      tecnologias: ["Cloud", "DevOps", "Microserviços", "Kubernetes"],
      beneficios: ["Plano premium", "Viagens", "Treinamentos internacionais"],
      matchPercentual: 85,
      salarioRange: "R$ 8.000 - R$ 15.000"
    }
  ];

  useEffect(() => {
    // Simula carregamento de dados
    setTimeout(() => {
      setEmpresas(empresasMock);
      setLoading(false);
    }, 1000);
  }, []);

  const filtrarEmpresas = () => {
    return empresas.filter(empresa => {
      if (filtros.area !== 'todas' && empresa.area !== filtros.area) return false;
      if (filtros.modalidade !== 'todas' && empresa.modalidade !== filtros.modalidade) return false;
      if (filtros.porte !== 'todos' && empresa.porte !== filtros.porte) return false;
      return true;
    });
  };

  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: valor
    }));
  };

  const empresasFiltradas = filtrarEmpresas();

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
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Match de Empresas
            </h1>
            <p className="text-xl text-gray-600">
              Encontre empresas que combinam com seu perfil profissional
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filtros.area}
                onChange={(e) => handleFiltroChange('area', e.target.value)}
              >
                <option value="todas">Todas as áreas</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Design">Design</option>
                <option value="Marketing Digital">Marketing Digital</option>
                <option value="Startup">Startup</option>
                <option value="Consultoria">Consultoria</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modalidade
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                Porte
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filtros.porte}
                onChange={(e) => handleFiltroChange('porte', e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="Pequena">Pequena</option>
                <option value="Média">Média</option>
                <option value="Grande">Grande</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => setFiltros({ area: 'todas', modalidade: 'todas', porte: 'todos' })}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium text-blue-600">{empresasFiltradas.length}</span> empresas encontradas
          </div>
        </Card>

        {/* Lista de Empresas */}
        <div className="space-y-6">
          {empresasFiltradas.map(empresa => (
            <Card key={empresa.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Logo placeholder */}
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                    🏢
                  </div>

                  {/* Informações principais */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {empresa.nome}
                      </h3>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {empresa.matchPercentual}% Match
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>{empresa.localizacao}</span>
                      <span>{empresa.modalidade}</span>
                      <span>Empresa {empresa.porte}</span>
                      <span className="font-medium text-green-600">{empresa.salarioRange}</span>
                    </div>

                    <p className="text-gray-700 mb-4">{empresa.descricao}</p>

                    {/* Tecnologias */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {empresa.tecnologias.map((tech, index) => (
                          <span 
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Benefícios */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {empresa.beneficios.map((beneficio, index) => (
                          <span 
                            key={index}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                          >
                            {beneficio}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer do card */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{empresa.vagasAbertas}</span> vagas disponíveis
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button variant="outline" size="sm">
                          Compartilhar
                        </Button>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                        <Button size="sm">
                          Tenho Interesse
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Paginação */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Match_empresa;