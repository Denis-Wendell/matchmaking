import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Match_vaga() {
  const navigate = useNavigate();
  
  // Estados principais (mantidos do seu código funcional)
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [freelancerData, setFreelancerData] = useState(null);
  
  // Estados para filtros e busca
  const [filtros, setFiltros] = useState({
    area: '',
    nivel: '',
    modalidade: '',
    tipo: '',
    salario: '',
    busca: ''
  });
  
  // Estados para paginação
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    totalPaginas: 1,
    total: 0
  });
  
  // Estados para candidatura e detalhes
  const [vagaCandidatura, setVagaCandidatura] = useState(null);
  const [modalCandidatura, setModalCandidatura] = useState(false);
  const [candidaturaLoading, setCandidaturaLoading] = useState(false);
  const [mensagemCandidatura, setMensagemCandidatura] = useState('');
  const [vagasSalvas, setVagasSalvas] = useState(new Set());
  
  // Estados para modal de detalhes da vaga
  const [vagaDetalhes, setVagaDetalhes] = useState(null);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [detalhesLoading, setDetalhesLoading] = useState(false);

  // Verificar autenticação ao carregar (sua lógica mantida)
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    const freelancerDataStored = localStorage.getItem('freelancerData');

    if (!isLoggedIn || userType !== 'freelancer') {
      navigate('/login');
      return;
    }

    if (freelancerDataStored) {
      try {
        const parsedData = JSON.parse(freelancerDataStored);
        setFreelancerData(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados do freelancer:', error);
        navigate('/login');
        return;
      }
    }

    carregarVagas();
  }, [navigate, filtros, paginacao.pagina]);

  // Carregar vagas ativas (sua lógica API mantida)
  const carregarVagas = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams({
        pagina: paginacao.pagina,
        limite: 12
      });

      // Adicionar filtros se preenchidos
      if (filtros.area) queryParams.append('area', filtros.area);
      if (filtros.nivel) queryParams.append('nivel', filtros.nivel);
      if (filtros.modalidade) queryParams.append('modalidade', filtros.modalidade);
      if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
      if (filtros.salario) queryParams.append('salario', filtros.salario);

      const response = await fetch(`http://localhost:3001/api/vagas?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setVagas(result.data.vagas);
        setPaginacao(prev => ({
          ...prev,
          total: result.data.total,
          totalPaginas: result.data.totalPaginas
        }));
      } else {
        setError(result.message || 'Erro ao carregar vagas');
      }

    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Candidatar-se a uma vaga (sua lógica mantida)
  const candidatarSe = async () => {
    if (!vagaCandidatura) return;

    try {
      setCandidaturaLoading(true);
      const token = localStorage.getItem('authToken');

      const dadosCandidatura = {
        vaga_id: vagaCandidatura.id,
        mensagem_candidato: mensagemCandidatura.trim()
      };

      const response = await fetch('http://localhost:3001/api/candidaturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosCandidatura)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setVagas(prev => prev.map(vaga => 
          vaga.id === vagaCandidatura.id 
            ? { ...vaga, candidaturas: (vaga.candidaturas || 0) + 1 }
            : vaga
        ));

        alert('Candidatura enviada com sucesso! A empresa será notificada.');
        setModalCandidatura(false);
        setVagaCandidatura(null);
        setMensagemCandidatura('');
      } else {
        if (result.message === 'Você já se candidatou a esta vaga') {
          alert('⚠️ Você já se candidatou a esta vaga anteriormente.');
        } else if (result.message === 'Esta vaga não está mais ativa para candidaturas') {
          alert('⚠️ Esta vaga não está mais disponível para candidaturas.');
          setVagas(prev => prev.filter(vaga => vaga.id !== vagaCandidatura.id));
        } else {
          alert(`❌ Erro ao enviar candidatura: ${result.message}`);
        }
        
        setModalCandidatura(false);
        setVagaCandidatura(null);
        setMensagemCandidatura('');
      }

    } catch (error) {
      console.error('Erro ao se candidatar:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setCandidaturaLoading(false);
    }
  };

  // Função para salvar vaga (inspirada no código do colega)
  const handleSalvarVaga = (vaga) => {
    const novasVagasSalvas = new Set(vagasSalvas);
    if (vagasSalvas.has(vaga.id)) {
      novasVagasSalvas.delete(vaga.id);
      alert(`Vaga "${vaga.titulo}" removida dos favoritos!`);
    } else {
      novasVagasSalvas.add(vaga.id);
      alert(`Vaga "${vaga.titulo}" salva nos favoritos!`);
    }
    setVagasSalvas(novasVagasSalvas);
  };

  // Ver detalhes completos da vaga
  const handleVerDetalhes = async (vaga) => {
    setDetalhesLoading(true);
    setModalDetalhes(true);
    
    try {
      // Buscar dados completos da vaga na API
      const response = await fetch(`http://localhost:3001/api/vagas/${vaga.id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setVagaDetalhes(result.data);
      } else {
        // Se não conseguir buscar detalhes, usa os dados que já temos
        setVagaDetalhes(vaga);
        console.warn('Não foi possível carregar detalhes completos:', result.message);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da vaga:', error);
      // Em caso de erro, usa os dados básicos que já temos
      setVagaDetalhes(vaga);
    } finally {
      setDetalhesLoading(false);
    }
  };

  // Calcular match percentual (simulado)
  const calcularMatch = (vaga) => {
    if (!freelancerData) return 75;
    
    let score = 60; // Base
    
    // Match por área
    if (freelancerData.area_atuacao && vaga.area_atuacao === freelancerData.area_atuacao) {
      score += 20;
    }
    
    // Match por modalidade
    if (freelancerData.modalidade_trabalho && vaga.modalidade_trabalho === freelancerData.modalidade_trabalho) {
      score += 10;
    }
    
    // Match por skills
    if (freelancerData.principais_habilidades && vaga.skills_obrigatorias) {
      const skillsFreelancer = freelancerData.principais_habilidades.toLowerCase();
      const matchSkills = vaga.skills_obrigatorias.some(skill => 
        skillsFreelancer.includes(skill.toLowerCase())
      );
      if (matchSkills) score += 10;
    }
    
    return Math.min(score, 98); // Max 98%
  };

  // Formatadores (suas funções mantidas)
  const formatarData = (dataString) => {
    const agora = new Date();
    const dataVaga = new Date(dataString);
    const diffTime = agora - dataVaga;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Há 1 dia';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.ceil(diffDays / 7)} semana(s)`;
    return dataVaga.toLocaleDateString('pt-BR');
  };

  const formatarSalario = (min, max, moeda = 'BRL') => {
    if (!min && !max) return 'A combinar';
    
    const formatNumber = (num) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: moeda
      }).format(num);
    };

    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)}`;
    }
    return min ? `A partir de ${formatNumber(min)}` : `Até ${formatNumber(max)}`;
  };

  const getNivelColor = (nivel) => {
    const colors = {
      'junior': 'bg-green-100 text-green-800',
      'pleno': 'bg-blue-100 text-blue-800', 
      'senior': 'bg-purple-100 text-purple-800',
      'especialista': 'bg-red-100 text-red-800'
    };
    return colors[nivel] || 'bg-gray-100 text-gray-800';
  };

  // Filtrar vagas por busca local (sua lógica mantida)
  const vagasFiltradas = vagas.filter(vaga => {
    if (!filtros.busca) return true;
    const busca = filtros.busca.toLowerCase();
    return (
      vaga.titulo.toLowerCase().includes(busca) ||
      vaga.area_atuacao.toLowerCase().includes(busca) ||
      vaga.empresa?.nome?.toLowerCase().includes(busca) ||
      vaga.localizacao_texto.toLowerCase().includes(busca) ||
      vaga.habilidades_tecnicas?.toLowerCase().includes(busca) ||
      (vaga.skills_obrigatorias && vaga.skills_obrigatorias.some(skill => 
        skill.toLowerCase().includes(busca)
      ))
    );
  });

  if (loading && vagas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando vagas disponíveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header melhorado (inspirado no código do colega) */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Match de Vagas
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Encontre oportunidades que combinam perfeitamente com seu perfil profissional
            </p>
            {freelancerData && (
              <p className="text-sm text-blue-600">
                Bem-vindo, {freelancerData.nome}! • {paginacao.total} vaga(s) disponível(is)
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros melhorados (combinando ambos os códigos) */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar Vagas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            {/* Área de Atuação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área
              </label>
              <select
                value={filtros.area}
                onChange={(e) => {
                  setFiltros(prev => ({ ...prev, area: e.target.value }));
                  setPaginacao(prev => ({ ...prev, pagina: 1 }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as áreas</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Vendas">Vendas</option>
                <option value="Financeiro">Financeiro</option>
              </select>
            </div>

            {/* Nível */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível
              </label>
              <select
                value={filtros.nivel}
                onChange={(e) => {
                  setFiltros(prev => ({ ...prev, nivel: e.target.value }));
                  setPaginacao(prev => ({ ...prev, pagina: 1 }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os níveis</option>
                <option value="junior">Júnior</option>
                <option value="pleno">Pleno</option>
                <option value="senior">Sênior</option>
                <option value="especialista">Especialista</option>
              </select>
            </div>

            {/* Modalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modalidade
              </label>
              <select
                value={filtros.modalidade}
                onChange={(e) => {
                  setFiltros(prev => ({ ...prev, modalidade: e.target.value }));
                  setPaginacao(prev => ({ ...prev, pagina: 1 }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="remoto">Remoto</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>

            {/* Tipo de Contrato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contrato
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => {
                  setFiltros(prev => ({ ...prev, tipo: e.target.value }));
                  setPaginacao(prev => ({ ...prev, pagina: 1 }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="clt">CLT</option>
                <option value="pj">PJ</option>
                <option value="freelancer">Freelancer</option>
                <option value="temporario">Temporário</option>
                <option value="estagio">Estágio</option>
              </select>
            </div>

            {/* Faixa Salarial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faixa Salarial
              </label>
              <select
                value={filtros.salario}
                onChange={(e) => {
                  setFiltros(prev => ({ ...prev, salario: e.target.value }));
                  setPaginacao(prev => ({ ...prev, pagina: 1 }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as faixas</option>
                <option value="ate5k">Até R$ 5.000</option>
                <option value="5k-10k">R$ 5.000 - R$ 10.000</option>
                <option value="acima10k">Acima de R$ 10.000</option>
              </select>
            </div>

            {/* Botão Limpar Filtros */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltros({ area: '', nivel: '', modalidade: '', tipo: '', salario: '', busca: '' });
                  setPaginacao(prev => ({ ...prev, pagina: 1 }));
                }}
                className="w-full px-3 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Busca */}
          <div className="mb-4">
            <input
              type="text"
              value={filtros.busca}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              placeholder="Busque por título, empresa, skills ou localização..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contador de resultados */}
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600">{vagasFiltradas.length}</span> vagas encontradas
          </div>
        </div>

        {/* Tratamento de erros */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={carregarVagas}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Lista de Vagas - Cada card ocupa linha completa */}
        {vagasFiltradas.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">
              {filtros.busca || filtros.area || filtros.nivel || filtros.modalidade || filtros.tipo || filtros.salario
                ? 'Nenhuma vaga encontrada com os filtros selecionados.'
                : 'Nenhuma vaga disponível no momento.'}
            </p>
            <button
              onClick={() => {
                setFiltros({ area: '', nivel: '', modalidade: '', tipo: '', salario: '', busca: '' });
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Ver todas as vagas
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {vagasFiltradas.map((vaga) => {
              const matchPercentual = calcularMatch(vaga);
              return (
                <div key={vaga.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow w-full">
                  {/* Card ocupa linha completa - layout horizontal */}
                  <div className="flex items-start space-x-4 w-full">
                    {/* Logo da empresa */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl text-white font-bold flex-shrink-0">
                      {vaga.empresa?.nome?.charAt(0) || 'E'}
                    </div>

                    {/* Informações principais - ocupam toda a largura restante */}
                    <div className="flex-1">
                      {/* Header da vaga */}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {vaga.titulo}
                          </h3>
                          <p className="text-lg text-gray-600 font-medium">
                            {vaga.empresa?.nome || 'Empresa'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {matchPercentual}% Match
                          </div>
                          <button 
                            className={`transition-colors ${
                              vagasSalvas.has(vaga.id) 
                                ? 'text-yellow-500' 
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                            onClick={() => handleSalvarVaga(vaga)}
                            title="Salvar vaga"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Informações detalhadas em grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {vaga.localizacao_texto}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1z" />
                          </svg>
                          {vaga.modalidade_trabalho}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {vaga.nivel_experiencia}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {vaga.tipo_contrato}
                        </span>
                        <span className="flex items-center font-medium text-green-600">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {formatarSalario(vaga.salario_minimo, vaga.salario_maximo, vaga.moeda)}
                        </span>
                      </div>

                      {/* Descrição da vaga */}
                      <p className="text-gray-700 mb-4">{vaga.descricao_geral}</p>

                      {/* Tags de skills */}
                      {vaga.skills_obrigatorias && vaga.skills_obrigatorias.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {vaga.skills_obrigatorias.slice(0, 8).map((skill, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                            {vaga.skills_obrigatorias.length > 8 && (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                +{vaga.skills_obrigatorias.length - 8}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer do card */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          Publicada <span className="font-medium">{formatarData(vaga.created_at)}</span> • 
                          <span className="font-medium text-red-600">Candidatar até em breve</span>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleVerDetalhes(vaga)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Ver Detalhes
                          </button>
                          <button
                            onClick={() => {
                              setVagaCandidatura(vaga);
                              setModalCandidatura(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Candidatar-se
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação melhorada */}
        {paginacao.totalPaginas > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
                disabled={paginacao.pagina === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                {paginacao.pagina} de {paginacao.totalPaginas}
              </span>
              
              <button
                onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
                disabled={paginacao.pagina === paginacao.totalPaginas || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}

        {/* Modal de Detalhes da Vaga */}
        {modalDetalhes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {detalhesLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando detalhes da vaga...</p>
                </div>
              ) : vagaDetalhes && (
                <div className="p-6">
                  {/* Header do Modal */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl text-white font-bold">
                        {vagaDetalhes.empresa?.nome?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{vagaDetalhes.titulo}</h2>
                        <p className="text-lg text-gray-600 font-medium">{vagaDetalhes.empresa?.nome || 'Empresa'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {calcularMatch(vagaDetalhes)}% Match
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(vagaDetalhes.nivel_experiencia)}`}>
                            {vagaDetalhes.nivel_experiencia}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setModalDetalhes(false);
                        setVagaDetalhes(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Informações Principais */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2">
                      {/* Descrição */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição da Vaga</h3>
                        <div className="prose prose-sm text-gray-700">
                          <p className="whitespace-pre-line">{vagaDetalhes.descricao_geral}</p>
                        </div>
                      </div>

                      {/* Responsabilidades */}
                      {vagaDetalhes.responsabilidades && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsabilidades</h3>
                          <div className="prose prose-sm text-gray-700">
                            <p className="whitespace-pre-line">{vagaDetalhes.responsabilidades}</p>
                          </div>
                        </div>
                      )}

                      {/* Requisitos */}
                      {vagaDetalhes.requisitos && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos</h3>
                          <div className="prose prose-sm text-gray-700">
                            <p className="whitespace-pre-line">{vagaDetalhes.requisitos}</p>
                          </div>
                        </div>
                      )}

                      {/* Skills Obrigatórias */}
                      {vagaDetalhes.skills_obrigatorias && vagaDetalhes.skills_obrigatorias.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Obrigatórias</h3>
                          <div className="flex flex-wrap gap-2">
                            {vagaDetalhes.skills_obrigatorias.map((skill, index) => (
                              <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills Desejáveis */}
                      {vagaDetalhes.skills_desejaveis && vagaDetalhes.skills_desejaveis.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Desejáveis</h3>
                          <div className="flex flex-wrap gap-2">
                            {vagaDetalhes.skills_desejaveis.map((skill, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Informações da Vaga - Movido para cá */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Vaga</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Salário */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Salário</label>
                            <p className="text-lg font-semibold text-green-600">
                              {formatarSalario(vagaDetalhes.salario_minimo, vagaDetalhes.salario_maximo, vagaDetalhes.moeda)}
                            </p>
                          </div>

                          {/* Localização */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Localização</label>
                            <p className="text-gray-900">{vagaDetalhes.localizacao_texto}</p>
                          </div>

                          {/* Modalidade */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Modalidade</label>
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {vagaDetalhes.modalidade_trabalho}
                            </span>
                          </div>

                          {/* Tipo de Contrato */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Contrato</label>
                            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                              {vagaDetalhes.tipo_contrato}
                            </span>
                          </div>

                          {/* Área de Atuação */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Área</label>
                            <p className="text-gray-900">{vagaDetalhes.area_atuacao}</p>
                          </div>

                          {/* Experiência */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nível</label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(vagaDetalhes.nivel_experiencia)}`}>
                              {vagaDetalhes.nivel_experiencia}
                            </span>
                          </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="border-t border-gray-200 mt-4 pt-4">
                          <label className="block text-sm font-medium text-gray-600 mb-2">Estatísticas</label>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>{vagaDetalhes.visualizacoes || 0} visualizações</span>
                            <span>{vagaDetalhes.candidaturas || 0} candidaturas</span>
                            <span>Publicada {formatarData(vagaDetalhes.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Benefícios */}
                      {vagaDetalhes.beneficios && vagaDetalhes.beneficios.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefícios</h3>
                          <div className="flex flex-wrap gap-2">
                            {vagaDetalhes.beneficios.map((beneficio, index) => (
                              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                {beneficio}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sidebar com ações */}
                    <div className="lg:col-span-1">
                      <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações</h3>
                        
                        {/* Match percentual */}
                        <div className="mb-4">
                          <div className="flex items-center justify-center">
                            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-lg font-bold">
                              {calcularMatch(vagaDetalhes)}% Match
                            </span>
                          </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              setVagaCandidatura(vagaDetalhes);
                              setModalDetalhes(false);
                              setModalCandidatura(true);
                            }}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Candidatar-se à Vaga
                          </button>
                          
                          <button
                            onClick={() => handleSalvarVaga(vagaDetalhes)}
                            className={`w-full px-4 py-3 border rounded-lg transition-colors font-medium ${
                              vagasSalvas.has(vagaDetalhes.id)
                                ? 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {vagasSalvas.has(vagaDetalhes.id) ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
                          </button>
                        </div>

                        {/* Informações rápidas */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Informações Rápidas</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Modalidade:</span>
                              <span className="font-medium">{vagaDetalhes.modalidade_trabalho}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contrato:</span>
                              <span className="font-medium">{vagaDetalhes.tipo_contrato}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nível:</span>
                              <span className="font-medium">{vagaDetalhes.nivel_experiencia}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações da Empresa */}
                  {vagaDetalhes.empresa && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre a Empresa</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">{vagaDetalhes.empresa.nome}</h4>
                          {vagaDetalhes.empresa.descricao_empresa && (
                            <p className="text-gray-600 text-sm mb-3">{vagaDetalhes.empresa.descricao_empresa}</p>
                          )}
                          {vagaDetalhes.empresa.site_empresa && (
                            <a
                              href={vagaDetalhes.empresa.site_empresa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Visitar site da empresa →
                            </a>
                          )}
                        </div>
                        <div>
                          <div className="space-y-2 text-sm text-gray-600">
                            {vagaDetalhes.empresa.setor_atuacao && (
                              <p><span className="font-medium">Setor:</span> {vagaDetalhes.empresa.setor_atuacao}</p>
                            )}
                            {vagaDetalhes.empresa.tamanho_empresa && (
                              <p><span className="font-medium">Tamanho:</span> {vagaDetalhes.empresa.tamanho_empresa}</p>
                            )}
                            {vagaDetalhes.empresa.cidade && vagaDetalhes.empresa.estado && (
                              <p><span className="font-medium">Localização:</span> {vagaDetalhes.empresa.cidade}, {vagaDetalhes.empresa.estado}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de Candidatura melhorado */}
        {modalCandidatura && vagaCandidatura && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">
                Candidatar-se à Vaga
              </h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{vagaCandidatura.titulo}</h4>
                <p className="text-sm text-gray-600">{vagaCandidatura.empresa?.nome}</p>
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {calcularMatch(vagaCandidatura)}% Match
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem para o recrutador (opcional)
                </label>
                <textarea
                  value={mensagemCandidatura}
                  onChange={(e) => setMensagemCandidatura(e.target.value)}
                  placeholder="Conte por que você é o candidato ideal para esta vaga..."
                  rows={4}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {mensagemCandidatura.length}/500 caracteres
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={candidatarSe}
                  disabled={candidaturaLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {candidaturaLoading ? 'Enviando...' : 'Confirmar Candidatura'}
                </button>
                
                <button
                  onClick={() => {
                    setModalCandidatura(false);
                    setVagaCandidatura(null);
                    setMensagemCandidatura('');
                  }}
                  disabled={candidaturaLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Match_vaga;