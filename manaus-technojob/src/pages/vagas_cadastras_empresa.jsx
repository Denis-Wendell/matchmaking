// src/pages/Vagas_cadastrada_empresa.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// componentes
import CandidatosModal from '../components/CandidatosModal';
import PerfilCandidatoModal from '../components/PerfilCandidatoModal';
import VagaDetalhesModal from '../components/VagaDetalhesModal';

function Vagas_cadastrada_empresa() {
  const navigate = useNavigate();
  
  // ================= ESTADOS PRINCIPAIS =================
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [empresaData, setEmpresaData] = useState(null);
  
  // ================= FILTROS & PAGINAÇÃO =================
  const [filtros, setFiltros] = useState({ status: 'todas', busca: '' });
  const [paginacao, setPaginacao] = useState({ pagina: 1, totalPaginas: 1, total: 0 });
  
  // ================= AÇÕES SOBRE VAGA =================
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [acaoLoading, setAcaoLoading] = useState(false);

  // ================= CANDIDATOS (MODAL DE LISTA) =================
  const [candidatosOpen, setCandidatosOpen] = useState(false);
  const [candidatos, setCandidatos] = useState([]);
  const [loadingCandidatos, setLoadingCandidatos] = useState(false);
  const [candidatosError, setCandidatosError] = useState('');

  // ================= PERFIL (MODAL DE DETALHE) =================
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [candidaturaSelecionada, setCandidaturaSelecionada] = useState(null);
  const [detalheLoading, setDetalheLoading] = useState(false);
  const [detalheError, setDetalheError] = useState('');

  // ================= DETALHES DA VAGA (MODAL OVERFLOW) =================
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [detalhesVagaLoading, setDetalhesVagaLoading] = useState(false);
  const [vagaDetalhes, setVagaDetalhes] = useState(null);

  // ================= AUTH / CARGA INICIAL =================
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    const empresaDataStored = localStorage.getItem('empresaData');

    if (!isLoggedIn || userType !== 'empresa') {
      navigate('/login');
      return;
    }

    if (empresaDataStored) {
      try {
        const parsedData = JSON.parse(empresaDataStored);
        setEmpresaData(parsedData);
      } catch (err) {
        console.error('Erro ao carregar dados da empresa:', err);
        navigate('/login');
        return;
      }
    }

    carregarVagas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, filtros, paginacao.pagina]);

  // ================= FUNÇÕES: VAGAS =================
  const carregarVagas = async () => {
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

      const response = await fetch(`http://localhost:3001/api/vagas/empresa/minhas?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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

    } catch (err) {
      console.error('Erro ao carregar vagas:', err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const alterarStatusVaga = async (vagaId, novoStatus) => {
    try {
      setAcaoLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:3001/api/vagas/${vagaId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: novoStatus })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setVagas(prev => prev.map(vaga => 
          vaga.id === vagaId ? { ...vaga, status: novoStatus } : vaga
        ));
        setModalAberto(false);
        alert(`Vaga ${novoStatus} com sucesso!`);
      } else {
        alert(`Erro ao alterar status: ${result.message}`);
      }

    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setAcaoLoading(false);
    }
  };

  // ================= FUNÇÕES: CANDIDATOS E PERFIL =================
  const abrirCandidatos = async (vaga) => {
    try {
      setVagaSelecionada(vaga);
      setCandidatosOpen(true);
      setLoadingCandidatos(true);
      setCandidatosError('');
      setCandidatos([]);

      const token = localStorage.getItem('authToken');
      const resp = await fetch(`http://localhost:3001/api/candidaturas/vaga/${vaga.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await resp.json();
      if (resp.ok && json.success) {
        setCandidatos(json.data?.candidaturas ?? []);
      } else {
        setCandidatosError(json.message || 'Erro ao buscar candidatos da vaga.');
      }
    } catch (err) {
      console.error('Erro ao carregar candidatos:', err);
      setCandidatosError('Erro de conexão ao carregar candidatos.');
    } finally {
      setLoadingCandidatos(false);
    }
  };

  const abrirPerfilCompleto = async (candidaturaId) => {
    try {
      setPerfilOpen(true);
      setDetalheLoading(true);
      setDetalheError('');
      setCandidaturaSelecionada(null);

      const token = localStorage.getItem('authToken');
      const resp = await fetch(`http://localhost:3001/api/candidaturas/empresa/${candidaturaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await resp.json();
      if (resp.ok && json.success) {
        setCandidaturaSelecionada(json.data);
      } else {
        setDetalheError(json.message || 'Erro ao carregar perfil do candidato.');
      }
    } catch (err) {
      console.error('Erro ao carregar detalhe candidatura:', err);
      setDetalheError('Erro de conexão ao carregar perfil.');
    } finally {
      setDetalheLoading(false);
    }
  };

  // ================= DETALHES DA VAGA (OVERFLOW) =================
  const abrirDetalhesVaga = async (vaga) => {
    setModalDetalhes(true);
    setDetalhesVagaLoading(true);
    setVagaDetalhes(null);

    try {
      const resp = await fetch(`http://localhost:3001/api/vagas/${vaga.id}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await resp.json();
      if (resp.ok && json.success) {
        setVagaDetalhes(json.data);
      } else {
        // fallback: usar os dados já carregados
        setVagaDetalhes(vaga);
      }
    } catch (e) {
      console.error('Erro ao carregar detalhes da vaga:', e);
      setVagaDetalhes(vaga);
    } finally {
      setDetalhesVagaLoading(false);
    }
  };

  // ================= FORMATADORES =================
  const formatarData = (dataString) => new Date(dataString).toLocaleDateString('pt-BR');

  const formatarSalario = (min, max, moeda = 'BRL') => {
    if (!min && !max) return 'A combinar';
    const formatNumber = (num) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda }).format(num);
    if (min && max) return `${formatNumber(min)} - ${formatNumber(max)}`;
    return min ? `A partir de ${formatNumber(min)}` : `Até ${formatNumber(max)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'ativo': 'bg-green-100 text-green-800',
      'inativo': 'bg-red-100 text-red-800',
      'pausado': 'bg-yellow-100 text-yellow-800',
      'pendente': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = { 'ativo': 'Ativa', 'inativo': 'Inativa', 'pausado': 'Pausada', 'pendente': 'Pendente' };
    return labels[status] || status;
  };

  // ================= FILTRO LOCAL =================
  const vagasFiltradas = vagas.filter(vaga => {
    if (!filtros.busca) return true;
    const busca = filtros.busca.toLowerCase();
    return (
      vaga.titulo.toLowerCase().includes(busca) ||
      vaga.area_atuacao.toLowerCase().includes(busca) ||
      (vaga.localizacao_texto || '').toLowerCase().includes(busca)
    );
  });

  // ================= UI LOADING =================
  if (loading && vagas.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Carregando suas vagas...</p>
        </div>
      </div>
    );
  }

  // ================= RENDER =================
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minhas Vagas</h1>
            <p className="text-gray-600 mt-1">Gerencie todas as vagas da sua empresa</p>
            {empresaData && (
              <p className="text-sm text-blue-600 mt-2">
                {empresaData.nome} • {paginacao.total} vaga(s) cadastrada(s)
              </p>
            )}
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/cadastro-vaga')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nova Vaga
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Status</label>
            <select
              value={filtros.status}
              onChange={(e) => {
                setFiltros(prev => ({ ...prev, status: e.target.value }));
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as vagas</option>
              <option value="ativo">Ativas</option>
              <option value="pausado">Pausadas</option>
              <option value="inativo">Inativas</option>
              <option value="pendente">Pendentes</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Vagas</label>
            <input
              type="text"
              value={filtros.busca}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              placeholder="Busque por título, área ou localização..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={carregarVagas}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
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
            {filtros.status === 'todas' && !filtros.busca
              ? 'Você ainda não possui vagas cadastradas.'
              : 'Nenhuma vaga encontrada com os filtros selecionados.'}
          </p>
          {filtros.status === 'todas' && !filtros.busca && (
            <button
              onClick={() => navigate('/cadastro-vaga')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cadastrar Primeira Vaga
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {vagasFiltradas.map((vaga) => (
            <div key={vaga.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                {/* Informações principais */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{vaga.titulo}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vaga.status)}`}>{getStatusLabel(vaga.status)}</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{vaga.area_atuacao}</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">{vaga.nivel_experiencia}</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{vaga.modalidade_trabalho}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div><span className="font-medium">Localização:</span> {vaga.localizacao_texto}</div>
                    <div><span className="font-medium">Tipo:</span> {vaga.tipo_contrato}</div>
                    <div><span className="font-medium">Vagas:</span> {vaga.quantidade_vagas || 1}</div>
                    <div><span className="font-medium">Salário:</span> {formatarSalario(vaga.salario_minimo, vaga.salario_maximo, vaga.moeda)}</div>
                    <div><span className="font-medium">Visualizações:</span> {vaga.visualizacoes || 0}</div>
                    <div><span className="font-medium">Candidaturas:</span> {vaga.candidaturas || 0}</div>
                  </div>

                  {/* Descrição resumida */}
                  {vaga.descricao_geral && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {vaga.descricao_geral.substring(0, 150)}
                      {vaga.descricao_geral.length > 150 && '...'}
                    </p>
                  )}

                  {/* Skills */}
                  {Array.isArray(vaga.skills_obrigatorias) && vaga.skills_obrigatorias.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700 mr-2">Skills:</span>
                      <div className="inline-flex flex-wrap gap-1">
                        {vaga.skills_obrigatorias.slice(0, 5).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{skill}</span>
                        ))}
                        {vaga.skills_obrigatorias.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{vaga.skills_obrigatorias.length - 5} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">Criada em {formatarData(vaga.created_at)}</p>
                </div>

                {/* Ações */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                  {/* AGORA abre overflow modal em vez de navegar */}
                  <button
                    onClick={() => abrirDetalhesVaga(vaga)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Ver Detalhes
                  </button>

                  <button
                    onClick={() => navigate(`/editar-vaga/${vaga.id}`)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => abrirCandidatos(vaga)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Candidatos
                  </button>
                  
                  <button
                    onClick={() => {
                      setVagaSelecionada(vaga);
                      setModalAberto(true);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Alterar Status
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

      {/* Modal: Alterar Status */}
      {modalAberto && vagaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Alterar Status da Vaga</h3>
            <p className="text-gray-600 mb-6">
              <strong>Vaga:</strong> {vagaSelecionada.titulo}<br/>
              <strong>Status atual:</strong> {getStatusLabel(vagaSelecionada.status)}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => alterarStatusVaga(vagaSelecionada.id, 'ativo')}
                disabled={acaoLoading || vagaSelecionada.status === 'ativo'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ativar
              </button>
              <button
                onClick={() => alterarStatusVaga(vagaSelecionada.id, 'pausado')}
                disabled={acaoLoading || vagaSelecionada.status === 'pausado'}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Pausar
              </button>
              <button
                onClick={() => alterarStatusVaga(vagaSelecionada.id, 'inativo')}
                disabled={acaoLoading || vagaSelecionada.status === 'inativo'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Inativar
              </button>
              <button
                onClick={() => setModalAberto(false)}
                disabled={acaoLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
            </div>
            {acaoLoading && <p className="text-center text-gray-600 mt-4">Atualizando status...</p>}
          </div>
        </div>
      )}

      {/* Modal: Candidatos (lista) */}
      <CandidatosModal
        open={candidatosOpen}
        onClose={() => setCandidatosOpen(false)}
        vagaSelecionada={vagaSelecionada}
        loading={loadingCandidatos}
        error={candidatosError}
        candidatos={candidatos}
        onVerPerfil={abrirPerfilCompleto}
      />

      {/* Modal: Perfil Completo */}
      <PerfilCandidatoModal
        open={perfilOpen}
        onClose={() => setPerfilOpen(false)}
        loading={detalheLoading}
        error={detalheError}
        candidatura={candidaturaSelecionada}
      />

      {/* Modal: Detalhes da Vaga (overflow) */}
      <VagaDetalhesModal
        open={modalDetalhes}
        onClose={() => setModalDetalhes(false)}
        vagaId={vagaDetalhes?.id || vagaSelecionada?.id}
        vaga={vagaDetalhes || vagaSelecionada}
        loading={detalhesVagaLoading}
      />
    </div>
  );
}

export default Vagas_cadastrada_empresa;
