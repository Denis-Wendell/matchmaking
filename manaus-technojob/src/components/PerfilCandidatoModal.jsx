// src/components/PerfilCandidatoModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  buildCleanSkills,
  buildPrincipaisHabilidadesDisplay,
} from '../utils/freelaFormat';
import { computeMatchDetailed } from '../utils/matchEmpresaFreelancer';
import { API_BASE_URL } from '../services/api'

const normKey = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/**
 * Uso flexível:
 * <PerfilCandidatoModal open onClose candidatura={{ freelancer }} />
 * <PerfilCandidatoModal open onClose freelancer={...} />
 * <PerfilCandidatoModal open onClose freelancer={...} vagaId="uuid" />
 * <PerfilCandidatoModal open onClose freelancer={...} vaga={{ ...obj da vaga... }} fetchVaga={false} />
 */
export default function PerfilCandidatoModal({
  open,
  onClose,
  loading,
  error,
  candidatura,   // opcional: { freelancer: {...} }
  freelancer,     // opcional: objeto freelancer direto
  vagaId,         // opcional: UUID da vaga
  vaga,           // opcional: objeto da vaga já carregado
  fetchVaga = true,
  apiBase = API_BASE_URL,
}) {
  // Resolve o objeto freelancer independentemente da forma vinda
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const f = (candidatura && candidatura.freelancer) ? candidatura.freelancer : (freelancer || {}) ;

  const [vagaRef, setVagaRef] = useState(vaga || null);
  const [diag, setDiag] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState('');

  // Helpers defensivos (evitam falhas em páginas que não passaram tudo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let cleanSkills = [];
  let principaisDisplay = '';
  try {
    cleanSkills = buildCleanSkills(f) || [];
    principaisDisplay = buildPrincipaisHabilidadesDisplay(f) || '';
  } catch {
    cleanSkills = [];
    principaisDisplay = '';
  }

  // ESC fecha o modal
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Busca vaga de referência quando necessário:
  // prioridade: prop `vaga` -> prop `vagaId` -> f.melhor_vaga_id
  useEffect(() => {
    let cancel = false;

    async function fetchVagaById(id) {
      if (!id || !fetchVaga) return;
      try {
        setDiagLoading(true);
        setDiagError('');
        setVagaRef(null);
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const r = await fetch(`${apiBase}/api/vagas/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j?.success || !j?.data) {
          throw new Error(j?.message || 'Falha ao carregar vaga');
        }
        if (!cancel) setVagaRef(j.data);
      } catch (e) {
        if (!cancel) setDiagError(e?.message || 'Erro ao carregar vaga de referência.');
      } finally {
        if (!cancel) setDiagLoading(false);
      }
    }

    if (!open) return;

    // Se veio a vaga pronta por prop, usa e não busca
    if (vaga && typeof vaga === 'object') {
      setVagaRef(vaga);
      return () => { cancel = true; };
    }

    const efetivo = vagaId || f?.melhor_vaga_id;
    if (efetivo) {
      fetchVagaById(efetivo);
    } else {
      // sem vaga — limpa estado
      setVagaRef(null);
      setDiag(null);
      setDiagError('');
      setDiagLoading(false);
    }

    return () => { cancel = true; };
  }, [open, vaga, vagaId, f?.melhor_vaga_id, apiBase, fetchVaga]);

  // Calcula diagnóstico quando tiver (vagaRef + freelancer)
  useEffect(() => {
    if (!open || !vagaRef || !f) return;
    try {
      const d = computeMatchDetailed(vagaRef, f);
      setDiag(d);
    } catch (e) {
      setDiagError(e?.message || 'Erro ao calcular diagnóstico.');
    }
  }, [open, vagaRef, f]);

  // Cleanup duro ao fechar
  useEffect(() => {
    if (open) return;
    setVagaRef(vaga || null);
    setDiag(null);
    setDiagError('');
    setDiagLoading(false);
  }, [open, vaga]);

  const faltantes = useMemo(() => {
    if (!vagaRef) return { obrigatorias: [], desejaveis: [] };
    const reqObrig = Array.isArray(vagaRef.skills_obrigatorias) ? vagaRef.skills_obrigatorias : [];
    const reqDesej = Array.isArray(vagaRef.skills_desejaveis) ? vagaRef.skills_desejaveis : [];
    const candSkillsNorm = new Set((cleanSkills || []).map(normKey));

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

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div
        className="relative bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={stop}
        role="dialog"
        aria-modal="true"
      >
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
              <p className="text-red-700 text-sm">{String(error)}</p>
            </div>
          )}
        </div>

        <div className="p-6">
          {loading || !f ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando perfil completo...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold text-xl">
                  {f?.nome?.charAt?.(0) || 'F'}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xl font-bold text-gray-900">{f?.nome || 'Sem nome'}</h4>
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                      {f?.nivel_experiencia || 'Nível não informado'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                      {f?.modalidade_trabalho || 'Modalidade'}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    {f?.area_atuacao || 'Área não informada'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {f?.cidade && f?.estado ? `${f.cidade} - ${f.estado}` : 'Localização não informada'}
                  </div>
                </div>
              </div>

              {/* Contatos e links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoBox label="Email" value={f?.email} />
                <InfoBox label="Telefone" value={f?.telefone} />
                <InfoBox label="Disponibilidade" value={f?.disponibilidade} />
                <LinkBox label="Portfólio" href={f?.url_portfolio} />
                <LinkBox label="LinkedIn" href={f?.linkedin} />
                <LinkBox label="GitHub" href={f?.github} />
              </div>

              {/* Resumo / Objetivos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextBlock title="Resumo profissional" text={f?.resumo_profissional} />
                <TextBlock title="Objetivos profissionais" text={f?.objetivos_profissionais} />
              </div>

              {/* Habilidades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Habilidades (chips)</h4>
                  {(cleanSkills || []).length > 0 ? (
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
                  <p className="text-gray-700">{principaisDisplay || 'Não informado'}</p>
                </div>
              </div>

              {/* Experiência / Formação / Idiomas / Certificações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextBlock title="Experiência profissional" text={f?.experiencia_profissional} />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Formação acadêmica</h4>
                  <div className="text-gray-700">
                    <div><span className="font-medium">Curso/Área:</span> {f?.formacao_academica || '—'}</div>
                    <div><span className="font-medium">Instituição:</span> {f?.instituicao || '—'}</div>
                    <div><span className="font-medium">Ano de conclusão:</span> {f?.ano_conclusao || '—'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Idiomas</h4>
                  {Array.isArray(f?.idiomas) && f.idiomas.length > 0 ? (
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
                <TextBlock title="Certificações" text={f?.certificacoes} />
              </div>

              {/* Diagnóstico */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Diagnóstico do Match</h4>

                {!vaga && !vagaId && !f?.melhor_vaga_id && (
                  <p className="text-sm text-gray-500">
                    Não há <b>vaga</b>/<b>vagaId</b> (props) nem <b>melhor_vaga_id</b> no payload.
                  </p>
                )}

                {diagLoading && <div className="text-sm text-gray-600">Calculando diagnóstico…</div>}

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
                      <DiagCard title="Skills" item={diag.breakdown?.skills} faltantes={faltantes} />
                      <DiagCard title="Nível" item={diag.breakdown?.nivel} />

                    </div>

                    {vagaRef?.titulo && (
                      <div className="text-xs text-gray-500">
                        Vaga de referência: <b>{vagaRef.titulo}</b>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==== Subcomponentes simples ==== */
function InfoBox({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-medium">{value || 'Não informado'}</div>
    </div>
  );
}
function LinkBox({ label, href }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 break-words">
      <div className="text-sm text-gray-600">{label}</div>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
          {href}
        </a>
      ) : (
        <div className="font-medium">Não informado</div>
      )}
    </div>
  );
}
function TextBlock({ title, text }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-700 whitespace-pre-line">{text || 'Não informado'}</p>
    </div>
  );
}
function DiagCard({ title, item, faltantes }) {
 
  const label = item?.label || '—';

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-700">
       {label}
      </div>

      {title === 'Skills' && faltantes && (faltantes.obrigatorias?.length > 0 || faltantes.desejaveis?.length > 0) && (
        <div className="mt-2 space-y-2">
          {faltantes.obrigatorias?.length > 0 && (
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
          {faltantes.desejaveis?.length > 0 && (
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
  );
}
