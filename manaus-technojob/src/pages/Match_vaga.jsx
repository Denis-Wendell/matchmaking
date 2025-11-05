// match_vaga.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  computeMatchDetailed,
  computeMatch, // fallback final
} from '../utils/matchEmpresaFreelancer';

function Match_vaga() {
  const navigate = useNavigate();

  // Estados principais
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [freelancerData, setFreelancerData] = useState(null);
  const SHOW_AI_CONTROLS = false;

  // Filtros suportados pelo endpoint de MATCH (sem 'busca')
  const [filtros, setFiltros] = useState({
    area: '',
    nivel: '',
    modalidade: '',
    tipo: ''
  });

  // Parâmetros do endpoint
  const [aiOn, setAiOn] = useState(true);       // ?ai=on  (embeddings)
  const [llmOn, setLlmOn] = useState(false);    // ?llm=on (rerank LLM)

  // Paginação
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    totalPaginas: 1,
    total: 0
  });

  // Candidaturas + toast
  const [vagaCandidatura, setVagaCandidatura] = useState(null);
  const [modalCandidatura, setModalCandidatura] = useState(false);
  const [candidaturaLoading, setCandidaturaLoading] = useState(false);
  const [mensagemCandidatura, setMensagemCandidatura] = useState('');
  const [vagasSalvas, setVagasSalvas] = useState(new Set());
  const [vagasCandidatadas, setVagasCandidatadas] = useState(new Set()); // <- usado nos cards

  const [vagaDetalhes, setVagaDetalhes] = useState(null);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [detalhesLoading, setDetalhesLoading] = useState(false);

  // ===== Novo: cache de scores detalhados (mesma lógica do lado da empresa)
  const [detalhados, setDetalhados] = useState({}); // { [vagaId]: number }
  const [detLoading, setDetLoading] = useState(false);

  // toast centralizado
  const [toast, setToast] = useState({ open: false, type: 'success', title: '', message: '' });
  const showToast = (type, title, message) => {
    setToast({ open: true, type, title, message });
    setTimeout(() => setToast(prev => ({ ...prev, open: false })), 3000);
  };

  // Verificar autenticação e perfil
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
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
    } else {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // >>> favoritos persistentes — chave por usuário
  const FAV_KEY = useMemo(
    () => (freelancerData?.id ? `fav_vagas_${freelancerData.id}` : null),
    [freelancerData?.id]
  );

  // Carregar favoritos do localStorage quando logar/alternar usuário
  useEffect(() => {
    if (!FAV_KEY) return;
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      setVagasSalvas(new Set(Array.isArray(arr) ? arr : []));
    } catch {
      setVagasSalvas(new Set());
    }
  }, [FAV_KEY]);

  // Persistir favoritos no localStorage sempre que mudar
  useEffect(() => {
    if (!FAV_KEY) return;
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(vagasSalvas)));
    } catch {}
  }, [vagasSalvas, FAV_KEY]);

  // (Opcional) Sincronizar com backend, se existir este endpoint
  const syncFavoritosComServidor = async (idsSet) => {
    if (!freelancerData?.id) return;
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`http://localhost:3001/api/freelancers/${freelancerData.id}/favoritos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ vaga_ids: Array.from(idsSet) })
      });
      // Se o endpoint não existir, só ignora.
    } catch {
      // silencioso: persistência local já garante experiência.
    }
  };

  // Carregar vagas e candidaturas sempre que algo relevante mudar
  useEffect(() => {
    if (!freelancerData?.id) return;
    carregarVagasEStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    freelancerData?.id,
    filtros.area,
    filtros.nivel,
    filtros.modalidade,
    filtros.tipo,
    paginacao.pagina,
    aiOn,
    llmOn
  ]);

  /**
   * Carrega as vagas e também descobre quais já foram candidatadas
   * para que o selo "Candidatura enviada" apareça logo de cara.
   */
  const carregarVagasEStatus = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('authToken');

    try {
      // 1) Vagas (com min_match fixo em 30%)
      const qp = new URLSearchParams({
        pagina: String(paginacao.pagina),
        limite: '12',
        min_match: '30',
      });
      qp.append('status', 'ativa'); //filtra apenas vagas ativas
      if (filtros.area)       qp.append('area', filtros.area);
      if (filtros.nivel)      qp.append('nivel', filtros.nivel);
      if (filtros.modalidade) qp.append('modalidade', filtros.modalidade);
      if (filtros.tipo)       qp.append('tipo', filtros.tipo);
      if (aiOn)               qp.append('ai', 'on');
      if (llmOn)              qp.append('llm', 'on');

      const vagasUrl = `http://localhost:3001/api/freelancers/${freelancerData.id}/matches?${qp.toString()}`;
      const vagasResp = await fetch(vagasUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const vagasJson = await vagasResp.json();

      if (!vagasResp.ok || !vagasJson.success) {
        throw new Error(vagasJson.message || 'Erro ao carregar vagas');
      }

      const list = vagasJson.data.vagas || [];
      setVagas(list);

      // Ajusta paginação
      const total = vagasJson.data.total || 0;
      const totalPaginas = vagasJson.data.totalPaginas || 1;
      const paginaResp = vagasJson.data.pagina || 1;
      setPaginacao(prev => {
        const paginaAjustada = Math.min(paginaResp, totalPaginas);
        return { ...prev, pagina: paginaAjustada, total, totalPaginas };
      });

      // 2) Deriva "já candidatado" a partir de possíveis flags do próprio objeto vaga
      const fromVagasFlags = new Set(
        list
          .filter(v =>
            v.ja_candidatado === true ||
            v.applied === true ||
            v.candidatura_enviada === true ||
            v.user_has_applied === true ||
            (typeof v.candidatura_status === 'string' &&
              ['enviada', 'pendente', 'aceita', 'rejeitada'].includes(v.candidatura_status.toLowerCase()))
          )
          .map(v => v.id)
      );

      // 3) (Opcional/robusto) Tenta buscar candidaturas do usuário para assegurar o status
      let fromApi = new Set();
      try {
        const cUrl = `http://localhost:3001/api/freelancers/${freelancerData.id}/candidaturas`;
        const cResp = await fetch(cUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (cResp.ok) {
          const cJson = await cResp.json();
          if (Array.isArray(cJson.data)) {
            fromApi = new Set(
              cJson.data
                .filter(item => {
                  const st = (item.status || '').toString().toLowerCase();
                  return st === '' || ['enviada', 'pendente', 'em_analise', 'aceita', 'rejeitada'].includes(st);
                })
                .map(item => item.vaga_id)
            );
          } else if (cJson.data && Array.isArray(cJson.data.vaga_ids)) {
            fromApi = new Set(cJson.data.vaga_ids);
          }
        }
      } catch {
        // silencia: endpoint pode não existir
      }

      // 4) Unimos as duas fontes
      const union = new Set([...fromVagasFlags, ...fromApi]);
      setVagasCandidatadas(union);
    } catch (e) {
      console.error('Erro ao carregar vagas/status:', e);
      setError(e.message || 'Erro de conexão. Tente novamente.');
      setVagas([]);
      setPaginacao(prev => ({ ...prev, total: 0, totalPaginas: 1 }));
    } finally {
      setLoading(false);
    }
  };

  // ===== Novo: cálculo dos scores detalhados por vaga (igual ao lado da empresa)
  useEffect(() => {
    let cancel = false;

    async function calcularDetalhados() {
      if (!freelancerData || !Array.isArray(vagas) || vagas.length === 0) return;

      try {
        setDetLoading(true);
        const novo = {};
        for (const v of vagas) {
          try {
            const d = computeMatchDetailed(v, freelancerData);
            if (Number.isFinite(d?.score)) {
              novo[v.id] = Math.round(d.score);
            }
          } catch (_) {
            // ignora falha individual
          }
        }
        if (!cancel) {
          setDetalhados(novo); // reseta a cada página/lista para refletir a visão atual
        }
      } finally {
        if (!cancel) setDetLoading(false);
      }
    }

    calcularDetalhados();
    return () => { cancel = true; };
  }, [vagas, freelancerData]);

  // Candidatar-se
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
        setVagasCandidatadas(prev => new Set(prev).add(vagaCandidatura.id));

        showToast('success', 'Candidatura enviada', 'A empresa será notificada.');
        setModalCandidatura(false);
        setVagaCandidatura(null);
        setMensagemCandidatura('');
      } else {
        if (result.message === 'Você já se candidatou a esta vaga') {
          setVagasCandidatadas(prev => new Set(prev).add(vagaCandidatura.id));
          showToast('warning', 'Candidatura já enviada', 'Você já se candidatou anteriormente.');
        } else if (result.message === 'Esta vaga não está mais ativa para candidaturas') {
          showToast('warning', 'Vaga indisponível', 'Esta vaga não está aceitando candidaturas.');
          setVagas(prev => prev.filter(v => v.id !== vagaCandidatura.id));
        } else {
          showToast('error', 'Erro ao enviar', result.message || 'Tente novamente.');
        }

        setModalCandidatura(false);
        setVagaCandidatura(null);
        setMensagemCandidatura('');
      }
    } catch (error) {
      console.error('Erro ao se candidatar:', error);
      showToast('error', 'Erro de conexão', 'Tente novamente.');
    } finally {
      setCandidaturaLoading(false);
    }
  };

  // Salvar vaga (favoritar) — persiste localmente e tenta sync no backend
  const handleSalvarVaga = (vaga) => {
    const novasVagasSalvas = new Set(vagasSalvas);
    if (vagasSalvas.has(vaga.id)) {
      novasVagasSalvas.delete(vaga.id);
      showToast('success', 'Removida dos favoritos', `Vaga "${vaga.titulo}" removida.`);
    } else {
      novasVagasSalvas.add(vaga.id);
      showToast('success', 'Salva nos favoritos', `Vaga "${vaga.titulo}" salva.`);
    }
    setVagasSalvas(novasVagasSalvas);
    // tentativa de sync (opcional)
    syncFavoritosComServidor(novasVagasSalvas);
  };

  // Ver detalhes — injeta match_pct do card (mantido, mas agora a badge usa getMatchPct)
  const handleVerDetalhes = async (vaga) => {
    setDetalhesLoading(true);
    setModalDetalhes(true);

    try {
      const response = await fetch(`http://localhost:3001/api/vagas/${vaga.id}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setVagaDetalhes({ ...result.data, match_pct: vaga.match_pct });
      } else {
        setVagaDetalhes(vaga);
        console.warn('Não foi possível carregar detalhes completos:', result.message);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da vaga:', error);
      setVagaDetalhes(vaga);
    } finally {
      setDetalhesLoading(false);
    }
  };

  // Utilitários
  const formatarData = (dataString) => {
    if (!dataString) return '-';
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
    const formatNumber = (num) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda }).format(num);
    if (min && max) return `${formatNumber(min)} - ${formatNumber(max)}`;
    return min ? `A partir de ${formatNumber(min)}` : `Até ${formatNumber(max)}`;
  };

  const getNivelColor = (nivel) => {
    const colors = {
      junior: 'bg-green-100 text-green-800',
      pleno: 'bg-blue-100 text-blue-800',
      senior: 'bg-purple-100 text-purple-800',
      especialista: 'bg-red-100 text-red-800'
    };
    return colors[nivel] || 'bg-gray-100 text-gray-800';
  };

  // ===== PRIORIDADE: filtros > favoritos > match =====
  const normTxt = (s) =>
    (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const passaFiltros = (v) => {
    if (filtros.area && normTxt(v.area_atuacao) !== normTxt(filtros.area)) return false;
    if (filtros.nivel && normTxt(v.nivel_experiencia) !== normTxt(filtros.nivel)) return false;
    if (filtros.modalidade && normTxt(v.modalidade_trabalho) !== normTxt(filtros.modalidade)) return false;
    if (filtros.tipo && normTxt(v.tipo_contrato) !== normTxt(filtros.tipo)) return false;
    return true;
  };

  // ======= NOVO: função unificada de match (igual à prioridade do Match_empresas.jsx)
  const getMatchPct = (vaga) => {
    const detalhado = detalhados[vaga.id];

    if (Number.isFinite(detalhado)) return detalhado;

    const raw = Number(vaga.match_pct);
    const normalized = Number.isFinite(raw) ? (raw <= 1 ? raw * 100 : raw) : NaN;

    if (Number.isFinite(normalized)) return Math.round(normalized);

    return computeMatch(freelancerData); // fallback final (heurístico)
  };

  const vagasOrdenadas = useMemo(() => {
    const aposFiltro = vagas.filter(passaFiltros);

    aposFiltro.sort((a, b) => {
      const favA = vagasSalvas.has(a.id) ? 1 : 0;
      const favB = vagasSalvas.has(b.id) ? 1 : 0;
      if (favA !== favB) return favB - favA; // favoritos primeiro

      // usa o mesmo critério de match da UI
      const mA = getMatchPct(a);
      const mB = getMatchPct(b);
      return mB - mA; // match desc
    });

    return aposFiltro;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vagas, vagasSalvas, filtros.area, filtros.nivel, filtros.modalidade, filtros.tipo, detalhados, freelancerData]);

  // Loading inicial
  if (loading && vagas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando vagas compatíveis...</p>
        </div>
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
              Match de Vagas
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Encontre oportunidades que combinam perfeitamente com seu perfil profissional
            </p>
            {freelancerData && (
              <p className="text-sm text-blue-600">
                Bem-vindo, {freelancerData.nome}! • {paginacao.total} vaga(s) compatível(is) {detLoading ? '• recalculando…' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar Vagas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
            {/* Área */}
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
                <option value="Desenvolvimento Web">Desenvolvimento Web</option>
                <option value="Desenvolvimento Frontend">Desenvolvimento Frontend</option>
                <option value="Desenvolvimento Backend">Desenvolvimento Backend</option>
                <option value="Desenvolvimento FullStack">Desenvolvimento FullStack</option>
                <option value="Devops">Devops</option>
                <option value="Desenvolvimento Mobile">Desenvolvimento Mobile</option>
                <option value="UI/UX design">UI/UX design</option>
                <option value="Cloud Computing">Cloud Computing</option>
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

            {/* Tipo de contrato */}
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

            {/* Limpar */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltros({ area: '', nivel: '', modalidade: '', tipo: '' });
                  setAiOn(true);
                  setLlmOn(false);
                  setPaginacao(prev => ({ ...prev, pagina: 1 }));
                }}
                className="w-full px-3 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Controles de IA (ocultos por padrão) */}
          {SHOW_AI_CONTROLS && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-end">
                <label className="inline-flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={aiOn}
                    onChange={(e) => {
                      setAiOn(e.target.checked);
                      setPaginacao(prev => ({ ...prev, pagina: 1 }));
                    }}
                    className="h-5 w-5 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Usar IA (embeddings)</span>
                </label>
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={llmOn}
                    onChange={(e) => {
                      setLlmOn(e.target.checked);
                      setPaginacao(prev => ({ ...prev, pagina: 1 }));
                    }}
                    className="h-5 w-5 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Usar re-rank por LLM</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Erros */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={carregarVagasEStatus}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Lista de vagas */}
        {vagasOrdenadas.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">
              {filtros.area || filtros.nivel || filtros.modalidade || filtros.tipo
                ? 'Nenhuma vaga encontrada com os filtros selecionados.'
                : 'Nenhuma vaga disponível no momento.'}
            </p>
            <button
              onClick={() => {
                setFiltros({ area: '', nivel: '', modalidade: '', tipo: '' });
                setAiOn(true);
                setLlmOn(false);
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Ver todas as vagas
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {vagasOrdenadas.map((vaga) => {
              const matchPct = getMatchPct(vaga);

              return (
                <div key={vaga.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow w-full">
                  <div className="flex items-start space-x-4 w-full">
                    {/* Logo */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl text-white font-bold flex-shrink-0">
                      {(vaga.empresa && vaga.empresa.nome && vaga.empresa.nome.charAt(0)) || 'E'}
                    </div>

                    <div className="flex-1">
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
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                            Match: {matchPct}%
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

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {vaga.localizacao_texto || '-'}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1z" />
                          </svg>
                          {vaga.modalidade_trabalho || '-'}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {vaga.nivel_experiencia || '-'}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {vaga.tipo_contrato || '-'}
                        </span>
                        <span className="flex items-center font-medium text-green-600">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {formatarSalario(vaga.salario_minimo, vaga.salario_maximo, vaga.moeda)}
                        </span>
                      </div>

                      {vaga.descricao_geral && (
                        <p className="text-gray-700 mb-4">{vaga.descricao_geral}</p>
                      )}

                      {Array.isArray(vaga.skills_obrigatorias) && vaga.skills_obrigatorias.length > 0 && (
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

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          Publicada <span className="font-medium">{formatarData(vaga.created_at)}</span>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleVerDetalhes(vaga)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Ver Detalhes
                          </button>

                          {vagasCandidatadas.has(vaga.id) && (
                            <span className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium self-center">
                              Candidatura enviada
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setVagaCandidatura(vaga);
                              setModalCandidatura(true);
                            }}
                            disabled={vagasCandidatadas.has(vaga.id)}
                            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                              vagasCandidatadas.has(vaga.id)
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {vagasCandidatadas.has(vaga.id) ? 'Já candidatado' : 'Candidatar-se'}
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

        {/* Paginação */}
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

        {/* Modal de Detalhes */}
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
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                            Match: {getMatchPct(vagaDetalhes)}%
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
                      {vagaDetalhes.descricao_geral && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição da Vaga</h3>
                          <div className="prose prose-sm text-gray-700">
                            <p className="whitespace-pre-line">{vagaDetalhes.descricao_geral}</p>
                          </div>
                        </div>
                      )}

                      {/* Responsabilidades */}
                      {vagaDetalhes.principais_responsabilidades && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsabilidades</h3>
                          <div className="prose prose-sm text-gray-700">
                            <p className="whitespace-pre-line">{vagaDetalhes.principais_responsabilidades}</p>
                          </div>
                        </div>
                      )}

                      {/* Requisitos */}
                      {(vagaDetalhes.requisitos_obrigatorios || vagaDetalhes.requisitos_desejados) && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos</h3>
                          <div className="prose prose-sm text-gray-700 space-y-3">
                            {vagaDetalhes.requisitos_obrigatorios && (
                              <>
                                <p className="font-medium">Obrigatórios:</p>
                                <p className="whitespace-pre-line">{Array.isArray(vagaDetalhes.requisitos_obrigatorios) ? vagaDetalhes.requisitos_obrigatorios.join(', ') : vagaDetalhes.requisitos_obrigatorios}</p>
                              </>
                            )}
                            {vagaDetalhes.requisitos_desejados && (
                              <>
                                <p className="font-medium">Desejáveis:</p>
                                <p className="whitespace-pre-line">{Array.isArray(vagaDetalhes.requisitos_desejados) ? vagaDetalhes.requisitos_desejados.join(', ') : vagaDetalhes.requisitos_desejados}</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Informações da Vaga */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Vaga</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Salário</label>
                            <p className="text-lg font-semibold text-green-600">
                              {formatarSalario(vagaDetalhes.salario_minimo, vagaDetalhes.salario_maximo, vagaDetalhes.moeda)}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Localização</label>
                            <p className="text-gray-900">{vagaDetalhes.localizacao_texto || '-'}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Modalidade</label>
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {vagaDetalhes.modalidade_trabalho || '-'}
                            </span>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Contrato</label>
                            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                              {vagaDetalhes.tipo_contrato || '-'}
                            </span>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Área</label>
                            <p className="text-gray-900">{vagaDetalhes.area_atuacao || '-'}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nível</label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(vagaDetalhes.nivel_experiencia)}`}>
                              {vagaDetalhes.nivel_experiencia}
                            </span>
                          </div>
                        </div>

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
                      {Array.isArray(vagaDetalhes.beneficios_oferecidos) && vagaDetalhes.beneficios_oferecidos.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefícios</h3>
                          <div className="flex flex-wrap gap-2">
                            {vagaDetalhes.beneficios_oferecidos.map((beneficio, index) => (
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

                        <div className="mb-4">
                          <div className="flex items-center justify-center">
                            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-lg font-bold">
                              Match: {getMatchPct(vagaDetalhes)}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              setVagaCandidatura(vagaDetalhes);
                              setModalDetalhes(false);
                              setModalCandidatura(true);
                            }}
                            disabled={vagasCandidatadas.has(vagaDetalhes.id)}
                            className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${
                              vagasCandidatadas.has(vagaDetalhes.id)
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {vagasCandidatadas.has(vagaDetalhes.id) ? 'Já candidatado' : 'Candidatar-se à Vaga'}
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

                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Informações Rápidas</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Modalidade:</span>
                              <span className="font-medium">{vagaDetalhes.modalidade_trabalho || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contrato:</span>
                              <span className="font-medium">{vagaDetalhes.tipo_contrato || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nível:</span>
                              <span className="font-medium">{vagaDetalhes.nivel_experiencia || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sobre a empresa */}
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
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Match: {getMatchPct(vagaCandidatura)}%
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

        {/* Toast centralizado */}
        {toast.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white border p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full ${
                    toast.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : toast.type === 'warning'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '!' : '✕'}
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{toast.title}</h4>
                  {toast.message && <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>}
                </div>

                <button
                  onClick={() => setToast(prev => ({ ...prev, open: false }))}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Fechar"
                  title="Fechar"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
