import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Match_vaga() {
  const navigate = useNavigate();
  
  // Estados principais
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
    busca: ''
  });
  
  // Estados para paginação
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    totalPaginas: 1,
    total: 0
  });
  
  // Estados para candidatura
  const [vagaCandidatura, setVagaCandidatura] = useState(null);
  const [modalCandidatura, setModalCandidatura] = useState(false);
  const [candidaturaLoading, setCandidaturaLoading] = useState(false);
  const [mensagemCandidatura, setMensagemCandidatura] = useState('');

  // Verificar autenticação ao carregar
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

  // Carregar vagas ativas de todas as empresas
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

  // Candidatar-se a uma vaga
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
        // Atualizar contador de candidaturas localmente
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
          // Remover vaga da lista local
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

  // Formatadores
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

  // Filtrar vagas por busca local
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Carregando vagas disponíveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vagas Disponíveis
          </h1>
          <p className="text-gray-600">
            Encontre oportunidades que combinam com seu perfil
          </p>
          {freelancerData && (
            <p className="text-sm text-blue-600 mt-2">
              Bem-vindo, {freelancerData.nome}! • {paginacao.total} vaga(s) disponível(is)
            </p>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
          {/* Área de Atuação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área
            </label>
            <select
              value={filtros.area}
              onChange={(e) => {
                setFiltros(prev => ({ ...prev, area: e.target.value }));
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível
            </label>
            <select
              value={filtros.nivel}
              onChange={(e) => {
                setFiltros(prev => ({ ...prev, nivel: e.target.value }));
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modalidade
            </label>
            <select
              value={filtros.modalidade}
              onChange={(e) => {
                setFiltros(prev => ({ ...prev, modalidade: e.target.value }));
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="remoto">Remoto</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>

          {/* Tipo de Contrato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contrato
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => {
                setFiltros(prev => ({ ...prev, tipo: e.target.value }));
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="clt">CLT</option>
              <option value="pj">PJ</option>
              <option value="freelancer">Freelancer</option>
              <option value="temporario">Temporário</option>
              <option value="estagio">Estágio</option>
            </select>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltros({ area: '', nivel: '', modalidade: '', tipo: '', busca: '' });
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Busca */}
        <div>
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
            placeholder="Busque por título, empresa, skills ou localização..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Vagas */}
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

      {vagasFiltradas.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">
            {filtros.busca || filtros.area || filtros.nivel || filtros.modalidade || filtros.tipo
              ? 'Nenhuma vaga encontrada com os filtros selecionados.'
              : 'Nenhuma vaga disponível no momento.'}
          </p>
          <button
            onClick={() => {
              setFiltros({ area: '', nivel: '', modalidade: '', tipo: '', busca: '' });
              setPaginacao(prev => ({ ...prev, pagina: 1 }));
            }}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Ver todas as vagas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vagasFiltradas.map((vaga) => (
            <div key={vaga.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              {/* Header da vaga */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {vaga.titulo}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <span className="font-medium">{vaga.empresa?.nome || 'Empresa'}</span>
                    <span className="mx-2">•</span>
                    <span>{vaga.localizacao_texto}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{formatarData(vaga.created_at)}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(vaga.nivel_experiencia)}`}>
                  {vaga.nivel_experiencia}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {vaga.area_atuacao}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {vaga.modalidade_trabalho}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {vaga.tipo_contrato}
                </span>
              </div>

              {/* Salário */}
              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-900">
                  {formatarSalario(vaga.salario_minimo, vaga.salario_maximo, vaga.moeda)}
                </p>
              </div>

              {/* Descrição */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {vaga.descricao_geral}
              </p>

              {/* Skills */}
              {vaga.skills_obrigatorias && vaga.skills_obrigatorias.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills necessárias:</p>
                  <div className="flex flex-wrap gap-1">
                    {vaga.skills_obrigatorias.slice(0, 6).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {vaga.skills_obrigatorias.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{vaga.skills_obrigatorias.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer com métricas e ação */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{vaga.visualizacoes || 0} visualizações</span>
                  <span>{vaga.candidaturas || 0} candidaturas</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/vaga-detalhes/${vaga.id}`)}
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
          ))}
        </div>
      )}

      {/* Paginação */}
      {paginacao.totalPaginas > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
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

      {/* Modal de Candidatura */}
      {modalCandidatura && vagaCandidatura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Candidatar-se à Vaga
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">{vagaCandidatura.titulo}</h4>
              <p className="text-sm text-gray-600">{vagaCandidatura.empresa?.nome}</p>
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
  );
}

export default Match_vaga;