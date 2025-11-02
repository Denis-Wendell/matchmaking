// src/pages/Match_empresa.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import Loading from '../components/Loading';
import {
  buildCleanSkills,
  computeMatch,
  formatValorHora,
  localizacaoTxt,
  modalidadeLabel,
  nivelLabel,
  computeMatchDetailed, // usamos a mesma função do modal
} from '../utils/matchEmpresaFreelancer';
import PerfilCandidatoModal from '../components/PerfilCandidatoModal';

// ===== helpers de normalização =====
function removeAcentos(s = '') {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function toBackendEnum(value = '') {
  return removeAcentos(String(value)).toLowerCase().trim(); // remoto/presencial/hibrido, junior/pleno/etc
}

function getQueryParam(name) {
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  } catch {
    return null;
  }
}

/** Resolve o ID da empresa com 3 fontes (prioridade desc):
 *  1) query string ?empresaId=<uuid> (salva em localStorage)
 *  2) localStorage (authEmpresaId/tipo/Token)
 *  3) /api/auth/verificar (se tiver token e for empresa)
 */
async function resolveEmpresaId() {
  // 1) override via query string
  const qid = getQueryParam('empresaId');
  if (qid) {
    localStorage.setItem('authTipo', 'empresa');
    localStorage.setItem('authEmpresaId', qid);
    return qid;
  }

  // 2) cache local
  const cacheId =
    localStorage.getItem('authEmpresaId') ||
    localStorage.getItem('empresaId') ||
    null;
  const tipo =
    localStorage.getItem('authTipo') ||
    localStorage.getItem('tipo') ||
    null;
  if (tipo === 'empresa' && cacheId) return cacheId;

  // 3) valida token no backend
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    const r = await fetch('http://localhost:3001/api/auth/verificar', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const j = await r.json();
    if (r.ok && j?.success && j?.data?.tipo === 'empresa' && j?.data?.empresa?.id) {
      const id = j.data.empresa.id;
      localStorage.setItem('authTipo', 'empresa');
      localStorage.setItem('authEmpresaId', id);
      return id;
    }
  } catch (_) {}
  return null;
}

export default function Match_empresa() {
  const [empresaId, setEmpresaId] = useState(null);

  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // paginação vinda do BACK
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 12,
    total: 0,
    totalPaginas: 1,
  });

  // filtros enviados ao BACK
  const [filtros, setFiltros] = useState({
    area: 'todas',
    modalidade: 'todas',
    nivel: 'todos',
  });

  // cache de scores detalhados (alinhado com o modal)
  const [detalhados, setDetalhados] = useState({}); // { [freelancerId]: number }
  const [detLoading, setDetLoading] = useState(false);

  // modal perfil
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [perfilLoading] = useState(false);
  const [perfilError, setPerfilError] = useState('');
  const [freelancerSelecionado, setFreelancerSelecionado] = useState(null);

  // Painel de debug para alinhar empresaId
  const [showDebug, setShowDebug] = useState(false);
  const [empresaIdEdit, setEmpresaIdEdit] = useState('');

  const abrirPerfil = (f) => {
    setPerfilError('');
    setFreelancerSelecionado(f || null);
    setPerfilOpen(true);
  };
  const fecharPerfil = () => {
    setPerfilOpen(false);
    setFreelancerSelecionado(null);
  };

  const handleFiltroChange = (tipo, valor) => {
    setFiltros((prev) => ({ ...prev, [tipo]: valor }));
    setPaginacao((prev) => ({ ...prev, pagina: 1 }));
  };

  const baixarCurriculoFreelancer = async (freelancerId, nome) => {
    try {
      if (!freelancerId) {
        alert('ID do freelancer não encontrado.');
        return;
      }
      const token = localStorage.getItem('authToken');
      const resp = await fetch(`http://localhost:3001/api/freelancers/${freelancerId}/curriculo.pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(txt || 'Falha ao gerar currículo');
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const slug = (nome || 'freelancer')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-').toLowerCase()
        .replace(/[^a-z0-9\-]/g, '');
      const a = document.createElement('a');
      a.href = url;
      a.download = `curriculo-${slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Não foi possível baixar o currículo.');
    }
  };

  // resolve empresaId na montagem
  useEffect(() => {
    let mounted = true;
    (async () => {
      const id = await resolveEmpresaId();
      if (mounted) {
        setEmpresaId(id);
        setEmpresaIdEdit(id || '');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // busca lista
  useEffect(() => {
    if (!empresaId) {
      if (empresaId === null) return; // ainda resolvendo
      setLoading(false);
      setError('Não foi possível identificar a empresa logada.');
      return;
    }

    const carregar = async () => {
      try {
        setLoading(true);
        setError('');

        const url = new URL(`http://localhost:3001/api/empresas/${empresaId}/matches`);
        url.searchParams.set('pagina', String(paginacao.pagina));
        url.searchParams.set('limite', String(paginacao.limite));

        if (filtros.area && filtros.area !== 'todas') {
          url.searchParams.set('area', filtros.area);
        }
        if (filtros.modalidade && filtros.modalidade !== 'todas') {
          url.searchParams.set('modalidade', toBackendEnum(filtros.modalidade)); // remoto/presencial/hibrido
        }
        if (filtros.nivel && filtros.nivel !== 'todos') {
          url.searchParams.set('nivel', toBackendEnum(filtros.nivel)); // junior/pleno/senior/especialista
        }

        const token = localStorage.getItem('authToken');
        const res = await fetch(url.toString(), {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json();

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Erro interno ao calcular matches');
        }

        const payload = json.data || {};
        const lista = payload.freelancers || [];
        setFreelancers(Array.isArray(lista) ? lista : []);

        setPaginacao((prev) => ({
          ...prev,
          total: Number(payload.total || 0),
          totalPaginas: Number(payload.totalPaginas || 1),
        }));

        setDetalhados({}); // limpa cache ao mudar a lista
      } catch (e) {
        console.error(e);
        setError(e.message || 'Falha ao buscar freelancers/matches.');
        setFreelancers([]);
        setPaginacao((prev) => ({ ...prev, total: 0, totalPaginas: 1 }));
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [empresaId, paginacao.pagina, paginacao.limite, filtros]);

  // busca vaga de referência e calcula o score detalhado (igual ao modal)
  useEffect(() => {
    let cancel = false;

    async function calcularDetalhados() {
      const ids = Array.from(
        new Set(
          (freelancers || [])
            .map(f => f?.melhor_vaga_id)
            .filter(Boolean)
        )
      );
      if (ids.length === 0) return;

      try {
        setDetLoading(true);
        const token = localStorage.getItem('authToken');

        const vagasMap = {};
        await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await fetch(`http://localhost:3001/api/vagas/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
              const j = await r.json();
              if (r.ok && j?.success && j?.data) {
                vagasMap[id] = j.data;
              }
            } catch {}
          })
        );

        const novo = {};
        for (const f of freelancers) {
          const vagaId = f?.melhor_vaga_id;
          if (!vagaId || !vagasMap[vagaId]) continue;
          try {
            const d = computeMatchDetailed(vagasMap[vagaId], f);
            if (Number.isFinite(d?.score)) {
              novo[f.id] = Math.round(d.score);
            }
          } catch {}
        }

        if (!cancel && Object.keys(novo).length > 0) {
          setDetalhados((prev) => ({ ...prev, ...novo }));
        }
      } finally {
        if (!cancel) setDetLoading(false);
      }
    }

    if (freelancers && freelancers.length > 0) {
      calcularDetalhados();
    }
    return () => { cancel = true; };
  }, [freelancers]);

  const freelancersDaPagina = useMemo(() => freelancers, [freelancers]);

  // ===== Render =====
  if (loading && freelancersDaPagina.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full text-center">
          <p className="text-red-700 mb-3">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm">Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Match de Conhecimento</h1>
            <p className="text-xl text-gray-600 mb-2">Encontre os freelancers mais compatíveis com suas vagas</p>
            <p className="text-sm text-blue-600">
              {freelancersDaPagina.length} perfis nesta página • {paginacao.total} no total
            </p>
            <p className="text-xs text-gray-500 mt-1">
              empresaId atual: <code className="bg-gray-100 px-1 py-0.5 rounded">{empresaId || '—'}</code>
              {' '}<button
                onClick={() => setShowDebug(v => !v)}
                className="ml-2 text-blue-600 underline"
              >
                {showDebug ? 'ocultar depuração' : 'mostrar depuração'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Painel de depuração / alinhamento do empresaId */}
      {showDebug && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm">
            <div className="font-semibold mb-2">Alinhar empresaId (debug)</div>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                value={empresaIdEdit}
                onChange={(e) => setEmpresaIdEdit(e.target.value)}
                placeholder="cole aqui o UUID da empresa (igual ao empresa_id da vaga)"
                className="flex-1 p-2 border rounded"
              />
              <Button
                onClick={() => {
                  const val = (empresaIdEdit || '').trim();
                  if (!val) return;
                  localStorage.setItem('authTipo', 'empresa');
                  localStorage.setItem('authEmpresaId', val);
                  setEmpresaId(val);
                }}
              >
                Usar este ID
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('authEmpresaId');
                  localStorage.removeItem('authTipo');
                  setEmpresaId(null);
                  setEmpresaIdEdit('');
                }}
              >
                Limpar localStorage
              </Button>
            </div>
            <div className="text-gray-600 mt-2">
              Dica: você também pode abrir esta tela com <code>?empresaId=&lt;uuid&gt;</code> na URL para forçar o ID.
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Área de Atuação</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.area}
                onChange={(e) => handleFiltroChange('area', e.target.value)}>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Experiência</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.nivel}
                onChange={(e) => handleFiltroChange('nivel', e.target.value)}
              >
                <option value="todos">Todos os níveis</option>
                <option value="Júnior">Júnior</option>
                <option value="Pleno">Pleno</option>
                <option value="Sênior">Sênior</option>
                <option value="Especialista">Especialista</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFiltros({ area: 'todas', modalidade: 'todas', nivel: 'todos' });
                  setPaginacao((prev) => ({ ...prev, pagina: 1 }));
                }}
                variant="outline"
                className="w-full py-3"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 flex justify-between items-center">
            <span>
              <span className="font-medium text-blue-600">{freelancersDaPagina.length}</span> perfis nesta página •{' '}
              <span className="font-medium text-blue-600">{paginacao.total}</span> no total
            </span>
            <span className="text-sm text-gray-500">
              Ordenado por: Compatibilidade ↓ {detLoading ? '• recalculando…' : ''}
            </span>
          </div>
        </div>

        {/* Lista */}
        {freelancersDaPagina.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Nenhum freelancer encontrado para a empresa atual.</p>
            <p className="text-xs text-gray-500 mt-2">
              Verifique se o <b>empresa_id</b> da vaga no banco é o mesmo do <b>empresaId</b> acima.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {freelancersDaPagina.map((f) => {
              const skills = buildCleanSkills(f);

              // 1) preferimos o detalhado; 2) depois o valor do backend; 3) fallback heurístico
              const detalhado = detalhados[f.id];

              const raw = Number(f.match_pct);
              const normalized = Number.isFinite(raw)
                ? (raw <= 1 ? raw * 100 : raw)
                : NaN;

              const fallback = Number.isFinite(normalized)
                ? Math.round(normalized)
                : computeMatch(f);

              const matchPct = Number.isFinite(detalhado) ? detalhado : fallback;

              const nivel = nivelLabel(f.nivel_experiencia);
              const modalidade = modalidadeLabel(f.modalidade_trabalho);
              const valorHora = formatValorHora(f.valor_hora);
              const compatTxt = `${f.melhor_vaga_titulo || 'Área'} ${nivel !== '—' ? nivel : ''}`.trim();

              return (
                <div key={f.id} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{f.nome}</h3>

                          <div className="flex items-center text-blue-600 mb-2">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">
                              {f.profissao || `${f.area_atuacao || 'Profissional'} ${nivel !== '—' ? `• ${nivel}` : ''}`}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {localizacaoTxt(f)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 mb-1">{valorHora}</div>

                          <div className="inline-flex flex-col items-end gap-1">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                              Match: {matchPct}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {f.area_atuacao && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{f.area_atuacao}</span>
                        )}
                        {nivel !== '—' && (
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{nivel}</span>
                        )}
                        {modalidade !== '—' && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{modalidade}</span>
                        )}
                        {f.disponibilidade && (
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                            {f.disponibilidade}
                          </span>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-blue-700">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Compatível com: {compatTxt}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">
                        {f.experiencia_profissional || f.resumo_profissional || 'Sem resumo profissional informado.'}
                      </p>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Principais Habilidades:</h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.length > 0 ? (
                            skills.map((s, i) => (
                              <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">{s}</span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">Não informado</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Formação:</h4>
                          <p className="text-sm text-gray-600">
                            {f.formacao_academica
                              ? `${f.formacao_academica}${f.instituicao ? ` - ${f.instituicao}` : ''}`
                              : 'Não informado'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Certificações:</h4>
                          <p className="text-sm text-gray-600">{f.certificacoes || 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                          {f.url_portfolio && (
                            <a
                              href={f.url_portfolio}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 6H4v4h12v-4z" clipRule="evenodd" />
                              </svg>
                              Portfólio
                            </a>
                          )}
                          {f.linkedin && (
                            <a
                              href={f.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                              </svg>
                              LinkedIn
                            </a>
                          )}
                          {f.github && (
                            <a
                              href={f.github}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                              </svg>
                              GitHub
                            </a>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            size="sm"
                            onClick={() => abrirPerfil(f)}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            title="Ver perfil completo do candidato"
                          >
                            Ver perfil completo
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => baixarCurriculoFreelancer(f.id, f.nome)}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            title="Baixar currículo em PDF"
                          >
                            Baixar currículo
                          </Button>
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
                onClick={() => setPaginacao((prev) => ({ ...prev, pagina: prev.pagina - 1 }))}
                disabled={paginacao.pagina === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                {paginacao.pagina} de {paginacao.totalPaginas}
              </span>

              <button
                onClick={() => setPaginacao((prev) => ({ ...prev, pagina: prev.pagina + 1 }))}
                disabled={paginacao.pagina === paginacao.totalPaginas || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Perfil */}
      <PerfilCandidatoModal
        open={perfilOpen}
        onClose={fecharPerfil}
        loading={perfilLoading}
        error={perfilError}
        candidatura={freelancerSelecionado ? { freelancer: freelancerSelecionado } : null}
      />
    </div>
  );
}
