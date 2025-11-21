import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Minhas_candidaturas() {
  const navigate = useNavigate();
  
  // Estados principais
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [freelancerData, setFreelancerData] = useState(null);
  
  // Estados para filtros e paginação
  const [filtros, setFiltros] = useState({
    status: 'todas'
  });
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    totalPaginas: 1,
    total: 0
  });

  // Estados para modal de detalhes da vaga
  const [vagaDetalhes, setVagaDetalhes] = useState(null);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [detalhesLoading, setDetalhesLoading] = useState(false);
  const [vagasSalvas, setVagasSalvas] = useState(new Set());

  // Verificar autenticação e carregar dados
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

    carregarCandidaturas();
  }, [navigate, filtros, paginacao.pagina]);

  // Carregar candidaturas do freelancer
  const carregarCandidaturas = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const queryParams = new URLSearchParams({
        status: filtros.status,
        pagina: paginacao.pagina,
        limite: 10
      });

      const response = await fetch(`${API_BASE_URL}/api/candidaturas/minhas?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCandidaturas(result.data.candidaturas);
        setPaginacao(prev => ({
          ...prev,
          total: result.data.total,
          totalPaginas: result.data.totalPaginas
        }));
      } else {
        setError(result.message || 'Erro ao carregar candidaturas');
      }

    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar candidatura
  const cancelarCandidatura = async (candidaturaId, tituloVaga) => {
    if (!window.confirm(`Tem certeza que deseja cancelar sua candidatura para "${tituloVaga}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/api/candidaturas/${candidaturaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Candidatura cancelada com sucesso!');
        carregarCandidaturas(); // Recarregar lista
      } else {
        alert(`Erro ao cancelar candidatura: ${result.message}`);
      }

    } catch (error) {
      console.error('Erro ao cancelar candidatura:', error);
      alert('Erro de conexão. Tente novamente.');
    }
  };

  // Ver detalhes completos da vaga (igual ao Match_vaga.jsx)
  const verDetalhesVaga = async (vaga) => {
    setDetalhesLoading(true);
    setModalDetalhes(true);
    
    try {
      // Buscar dados completos da vaga na API
      const response = await fetch(`${API_BASE_URL}/api/vagas/${vaga.id}`, {
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

  // Ver detalhes da candidatura (implementação simples)
  const verDetalhesCandidatura = (candidaturaId) => {
    // OPÇÃO 1: Se você tem uma página específica para isso
    // navigate(`/candidatura/${candidaturaId}`);
    
    // OPÇÃO 2: Por enquanto, mostra um alert com o ID
    alert(`Detalhes da candidatura ${candidaturaId} (funcionalidade em desenvolvimento)`);
  };

  // Função para salvar vaga
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

  // Formatadores
  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const getStatusInfo = (status) => {
    const statusMap = {
      'pendente': {
        label: 'Pendente',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Aguardando análise da empresa'
      },
      'visualizada': {
        label: 'Visualizada',
        color: 'bg-blue-100 text-blue-800',
        description: 'Empresa visualizou sua candidatura'
      },
      'interessado': {
        label: 'Interessado',
        color: 'bg-green-100 text-green-800',
        description: 'Empresa demonstrou interesse'
      },
      'nao_interessado': {
        label: 'Não Interessado',
        color: 'bg-gray-100 text-gray-800',
        description: 'Empresa não demonstrou interesse'
      },
      'rejeitada': {
        label: 'Rejeitada',
        color: 'bg-red-100 text-red-800',
        description: 'Candidatura rejeitada'
      },
      'contratado': {
        label: 'Contratado',
        color: 'bg-purple-100 text-purple-800',
        description: 'Você foi selecionado!'
      }
    };

    return statusMap[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-800',
      description: ''
    };
  };

  if (loading && candidaturas.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Carregando suas candidaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minhas Candidaturas</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe o status das suas candidaturas
            </p>
            {freelancerData && (
              <p className="text-sm text-blue-600 mt-2">
                {freelancerData.nome} • {paginacao.total} candidatura(s) enviada(s)
              </p>
            )}
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/match-vaga')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar Mais Vagas
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) => {
                setFiltros(prev => ({ ...prev, status: e.target.value }));
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as candidaturas</option>
              <option value="pendente">Pendentes</option>
              <option value="visualizada">Visualizadas</option>
              <option value="interessado">Interessado</option>
              <option value="nao_interessado">Não Interessado</option>
              <option value="rejeitada">Rejeitadas</option>
              <option value="contratado">Contratado</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={carregarCandidaturas}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Candidaturas */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
          <button
            onClick={carregarCandidaturas}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {candidaturas.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">
            {filtros.status === 'todas'
              ? 'Você ainda não se candidatou a nenhuma vaga.'
              : 'Nenhuma candidatura encontrada com o status selecionado.'}
          </p>
          <button
            onClick={() => navigate('/match-vaga')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Encontrar Vagas
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {candidaturas.map((candidatura) => {
            const statusInfo = getStatusInfo(candidatura.status);
            return (
              <div key={candidatura.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                {/* Header da candidatura */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {candidatura.vaga.titulo}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span className="font-medium">{candidatura.vaga.empresa?.nome || 'Empresa'}</span>
                      <span className="mx-2">•</span>
                      <span>{candidatura.vaga.localizacao_texto}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {candidatura.vaga.area_atuacao}
                      </span>
                      {candidatura.vaga.status !== 'ativo' && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          Vaga Inativa
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right mt-4 lg:mt-0">
                    <p className="text-sm text-gray-500 mb-1">
                      Candidatura enviada em:
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatarData(candidatura.data_candidatura)}
                    </p>
                  </div>
                </div>

                {/* Status e feedback */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {statusInfo.description}
                  </p>
                  
                  {candidatura.data_visualizacao && (
                    <p className="text-sm text-gray-500">
                      Visualizada em: {formatarData(candidatura.data_visualizacao)}
                    </p>
                  )}
                  
                  {candidatura.data_resposta && (
                    <p className="text-sm text-gray-500">
                      Respondida em: {formatarData(candidatura.data_resposta)}
                    </p>
                  )}
                  
                  {candidatura.feedback_empresa && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Feedback da empresa:
                      </p>
                      <p className="text-sm text-gray-600">
                        {candidatura.feedback_empresa}
                      </p>
                    </div>
                  )}
                </div>

                {/* Mensagem do candidato */}
                {candidatura.mensagem_candidato && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 mb-1">
                      Sua mensagem:
                    </p>
                    <p className="text-sm text-blue-600">
                      {candidatura.mensagem_candidato}
                    </p>
                  </div>
                )}

                {/* Informações da vaga */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Salário:</span>{' '}
                    {formatarSalario(
                      candidatura.vaga.salario_minimo,
                      candidatura.vaga.salario_maximo,
                      candidatura.vaga.moeda
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Status da vaga:</span>{' '}
                    <span className={candidatura.vaga.status === 'ativo' ? 'text-green-600' : 'text-red-600'}>
                      {candidatura.vaga.status === 'ativo' ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => verDetalhesVaga(candidatura.vaga)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Ver Vaga
                  </button>
                  
                                    
                  {/* Só permitir cancelamento se não foi processada */}
                  {['pendente', 'visualizada'].includes(candidatura.status) && candidatura.vaga.status === 'ativo' && (
                    <button
                      onClick={() => cancelarCandidatura(candidatura.id, candidatura.vaga.titulo)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Cancelar Candidatura
                    </button>
                  )}

                  {/* Mostrar motivo se não pode cancelar */}
                  {!['pendente', 'visualizada'].includes(candidatura.status) && (
                    <span className="px-4 py-2 text-sm text-gray-500 italic">
                      {candidatura.status === 'contratado' 
                        ? 'Parabéns! Você foi contratado.'
                        : 'Candidatura já foi processada'
                      }
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {paginacao.totalPaginas > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
              disabled={paginacao.pagina === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              {paginacao.pagina} de {paginacao.totalPaginas}
            </span>
            
            <button
              onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
              disabled={paginacao.pagina === paginacao.totalPaginas}
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status da Candidatura</h3>
                      
                      {/* Verificar se existe candidatura para esta vaga */}
                      {(() => {
                        const candidaturaAtual = candidaturas.find(c => c.vaga.id === vagaDetalhes.id);
                        if (candidaturaAtual) {
                          const statusInfo = getStatusInfo(candidaturaAtual.status);
                          return (
                            <div className="mb-6">
                              <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {formatarData(candidaturaAtual.data_candidatura)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {statusInfo.description}
                                </p>
                                {candidaturaAtual.mensagem_candidato && (
                                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                                    <p className="font-medium text-blue-700">Sua mensagem:</p>
                                    <p className="text-blue-600">{candidaturaAtual.mensagem_candidato}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

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
                          onClick={() => handleSalvarVaga(vagaDetalhes)}
                          className={`w-full px-4 py-3 border rounded-lg transition-colors font-medium ${
                            vagasSalvas.has(vagaDetalhes.id)
                              ? 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {vagasSalvas.has(vagaDetalhes.id) ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
                        </button>
                        
                        <button
                          onClick={() => navigate('/match-vaga')}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Buscar Vagas Similares
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
    </div>
  );
}

export default Minhas_candidaturas;