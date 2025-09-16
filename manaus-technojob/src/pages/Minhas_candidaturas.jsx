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

      const response = await fetch(`http://localhost:3001/api/candidaturas/minhas?${queryParams}`, {
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

      const response = await fetch(`http://localhost:3001/api/candidaturas/${candidaturaId}`, {
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

  // Ver detalhes da vaga (implementação simples)
  const verDetalhesVaga = (vagaId) => {
    // OPÇÃO 1: Se você tem uma página de detalhes da vaga
    // navigate(`/vaga/${vagaId}`);
    
    // OPÇÃO 2: Por enquanto, apenas redireciona para match-vaga
    navigate('/match-vaga');
  };

  // Ver detalhes da candidatura (implementação simples)
  const verDetalhesCandidatura = (candidaturaId) => {
    // OPÇÃO 1: Se você tem uma página específica para isso
    // navigate(`/candidatura/${candidaturaId}`);
    
    // OPÇÃO 2: Por enquanto, mostra um alert com o ID
    alert(`Detalhes da candidatura ${candidaturaId} (funcionalidade em desenvolvimento)`);
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

                {/* Ações CORRIGIDAS */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => verDetalhesVaga(candidatura.vaga.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Ver Vaga
                  </button>
                  
                  <button
                    onClick={() => verDetalhesCandidatura(candidatura.id)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Ver Detalhes
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
    </div>
  );
}

export default Minhas_candidaturas;