// src/components/PerfilCandidatoModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  buildCleanSkills,
  buildPrincipaisHabilidadesDisplay,
} from '../utils/freelaFormat';
import { computeMatchDetailed } from '../utils/matchEmpresaFreelancer';

// normalizador leve para comparar textos sem acento/maiúsculas
const normKey = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export default function PerfilCandidatoModal({
  open,
  onClose,
  loading,
  error,
  candidatura // objeto com .freelancer
}) {
  // ===== Hooks SEMPRE no topo, sem retornos antes disso =====
  const [vagaRef, setVagaRef] = useState(null);
  const [diag, setDiag] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState('');

  const f = candidatura?.freelancer || {};
  const cleanSkills = buildCleanSkills(f);
  const principaisDisplay = buildPrincipaisHabilidadesDisplay(f);

  // busca vaga de referência (quando backend mandar melhor_vaga_id)
  useEffect(() => {
    let cancel = false;

    async function fetchVaga() {
      setDiag(null);
      setDiagError('');
      setVagaRef(null);

      const vagaId = f?.melhor_vaga_id;
      if (!vagaId) return;

      try {
        setDiagLoading(true);
        const token = localStorage.getItem('authToken');
        const r = await fetch(`http://localhost:3001/api/vagas/${vagaId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const j = await r.json();
        if (!r.ok || !j?.success) throw new Error(j?.message || 'Falha ao carregar vaga');

        if (!cancel) setVagaRef(j.data);
      } catch (e) {
        if (!cancel) setDiagError(e.message || 'Erro ao carregar vaga de referência.');
      } finally {
        if (!cancel) setDiagLoading(false);
      }
    }

    // Só busca quando o modal está aberto; mas o HOOK é sempre chamado
    if (open) fetchVaga();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, f?.melhor_vaga_id]);

  // calcula diagnóstico quando tivermos vagaRef + freelancer
  useEffect(() => {
    if (!vagaRef) return;
    try {
      const d = computeMatchDetailed(vagaRef, f, {
        // você pode customizar os pesos aqui se quiser:
        // pesos: { skills: 0.60, nivel: 0.20, modalidade: 0.10, area: 0.07, idiomas: 0.03 }
      });
      setDiag(d);
    } catch (e) {
      setDiagError(e.message || 'Erro ao calcular diagnóstico.');
    }
  }, [vagaRef, f]);

  // calcula skills faltantes para exibir listas
  const faltantes = useMemo(() => {
    if (!vagaRef) return { obrigatorias: [], desejaveis: [] };

    const reqObrig = Array.isArray(vagaRef.skills_obrigatorias) ? vagaRef.skills_obrigatorias : [];
    const reqDesej = Array.isArray(vagaRef.skills_desejaveis) ? vagaRef.skills_desejaveis : [];

    const candSkillsNorm = new Set(cleanSkills.map(normKey));

    const faltObrig = reqObrig
      .map(s => String(s || ''))
      .filter(Boolean)
      .filter(s => !candSkillsNorm.has(normKey(s)));

    const faltDesej = reqDesej
      .map(s => String(s || ''))
      .filter(Boolean)
      .filter(s => !candSkillsNorm.has(normKey(s)));

    return { obrigatorias: faltObrig, desejaveis: faltDesej };
  }, [vagaRef, cleanSkills]);

  // ====== Render ======
  // NÃO retornar antes dos hooks. Aqui pode retornar condicionalmente:
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-900">Perfil do Candidato</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Fechar"
              title="Fechar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6">
          {loading || !candidatura ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando perfil completo...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold text-xl">
                  {f.nome?.charAt(0) || 'F'}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xl font-bold text-gray-900">{f.nome || 'Sem nome'}</h4>
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                      {f.nivel_experiencia || 'Nível não informada'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                      {f.modalidade_trabalho || 'Modalidade'}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    {f.area_atuacao || 'Área não informada'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {f.cidade && f.estado ? `${f.cidade} - ${f.estado}` : 'Localização não informada'}
                  </div>
                </div>
              </div>

              {/* Contatos e links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">{f.email || 'Não informado'}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Telefone</div>
                  <div className="font-medium">{f.telefone || 'Não informado'}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Disponibilidade</div>
                  <div className="font-medium">{f.disponibilidade || 'Não informado'}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Portfólio</div>
                  {f.url_portfolio ? (
                    <a href={f.url_portfolio} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
                      {f.url_portfolio}
                    </a>
                  ) : (
                    <div className="font-medium">Não informado</div>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600">LinkedIn</div>
                  {f.linkedin ? (
                    <a href={f.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
                      {f.linkedin}
                    </a>
                  ) : (
                    <div className="font-medium">Não informado</div>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600">GitHub</div>
                  {f.github ? (
                    <a href={f.github} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
                      {f.github}
                    </a>
                  ) : (
                    <div className="font-medium">Não informado</div>
                  )}
                </div>
              </div>

              {/* Resumo / Objetivos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Resumo profissional</h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {f.resumo_profissional || 'Não informado'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Objetivos profissionais</h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {f.objetivos_profissionais || 'Não informado'}
                  </p>
                </div>
              </div>

              {/* Habilidades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Habilidades (chips)</h4>
                {cleanSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {cleanSkills.map((s, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">Não informado</div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Principais habilidades</h4>
                  <p className="text-gray-700">
                    {principaisDisplay || 'Não informado'}
                  </p>
                </div>
              </div>

              {/* Experiência / Formação / Idiomas / Certificações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Experiência profissional</h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {f.experiencia_profissional || 'Não informado'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Formação acadêmica</h4>
                  <div className="text-gray-700">
                    <div><span className="font-medium">Curso/Área:</span> {f.formacao_academica || '—'}</div>
                    <div><span className="font-medium">Instituição:</span> {f.instituicao || '—'}</div>
                    <div><span className="font-medium">Ano de conclusão:</span> {f.ano_conclusao || '—'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Idiomas</h4>
                  {Array.isArray(f.idiomas) && f.idiomas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {f.idiomas.map((idioma, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200">
                          {idioma}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">Não informado</div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Certificações</h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {f.certificacoes || 'Não informado'}
                  </p>
                </div>
              </div>

              {/* ================== DIAGNÓSTICO DO MATCH ================== */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Diagnóstico do Match</h4>

                {!f.melhor_vaga_id && (
                  <p className="text-sm text-gray-500">
                    Não há <b>melhor_vaga_id</b> no payload deste candidato. O diagnóstico detalhado usa a vaga de referência quando disponível.
                  </p>
                )}

                {diagLoading && (
                  <div className="text-sm text-gray-600">Calculando diagnóstico…</div>
                )}

                {diagError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {diagError}
                  </div>
                )}

                {diag && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-700">{diag.score}%</span>
                      <span className="text-sm text-gray-600">score agregado</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Skills */}
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-900">Skills</div>
                        <div className="text-sm text-gray-700">
                          Peso {Math.round(diag.breakdown.skills.peso * 100)}% • {diag.breakdown.skills.label}
                        </div>

                        {(faltantes.obrigatorias.length > 0 || faltantes.desejaveis.length > 0) && (
                          <div className="mt-2 space-y-2">
                            {faltantes.obrigatorias.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-gray-600 mb-1">Obrigatórias faltantes:</div>
                                <div className="flex flex-wrap gap-1">
                                  {faltantes.obrigatorias.map((s, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {faltantes.desejaveis.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-gray-600 mb-1">Desejáveis faltantes:</div>
                                <div className="flex flex-wrap gap-1">
                                  {faltantes.desejaveis.map((s, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Nível */}
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-900">Nível</div>
                        <div className="text-sm text-gray-700">
                          Peso {Math.round(diag.breakdown.nivel.peso * 100)}% • {diag.breakdown.nivel.label}
                        </div>
                      </div>

                      {/* Modalidade */}
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-900">Modalidade</div>
                        <div className="text-sm text-gray-700">
                          Peso {Math.round(diag.breakdown.modalidade.peso * 100)}% • {diag.breakdown.modalidade.label}
                        </div>
                      </div>

                      {/* Área */}
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-900">Área</div>
                        <div className="text-sm text-gray-700">
                          Peso {Math.round(diag.breakdown.area.peso * 100)}% • {diag.breakdown.area.label}
                        </div>
                      </div>

                      {/* Idiomas */}
                      <div className="border border-gray-200 rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-900">Idiomas</div>
                        <div className="text-sm text-gray-700">
                          Peso {Math.round(diag.breakdown.idiomas.peso * 100)}% • {diag.breakdown.idiomas.label}
                        </div>
                      </div>
                    </div>

                    {vagaRef?.titulo && (
                      <div className="text-xs text-gray-500">
                        Vaga de referência: <b>{vagaRef.titulo}</b>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* ================== / DIAGNÓSTICO DO MATCH ================== */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
