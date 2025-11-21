// src/components/CandidatosModal.jsx
import React, { useState, useEffect } from 'react';
import CandidatoCard from './CandidatoCard';
import { computeMatchDetailed } from '../utils/matchEmpresaFreelancer';

const STATUS_OPCOES = [
  { value: 'interessado', label: 'Interessado' },
  { value: 'rejeitada', label: 'Rejeitada' },
  { value: 'contratado', label: 'Contratado' },
];

// Normaliza qualquer formato para 0–100
function toPct(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n <= 1) return Math.round(n * 100);     // 0–1  ➜ 0–100
  if (n <= 100) return Math.round(n);         // 0–100 ➜ 0–100
  if (n <= 10000) return Math.round(n / 100); // 0–10000 (ex: 7000) ➜ 0–100
  return 100;
}

// Cores do selo conforme % (ajuste se quiser)
function badgeColor(pct) {
  if (pct >= 80) return 'bg-green-100 text-green-700 border-green-200';
  if (pct >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (pct >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

export default function CandidatosModal({
  open,
  onClose,
  vagaSelecionada,
  loading,
  error,
  candidatos = [],
  onVerPerfil,
}) {
  const [itens, setItens] = useState(candidatos);
  const [savingMap, setSavingMap] = useState({});
  const [errMap, setErrMap] = useState({});
  const [matchMap, setMatchMap] = useState({}); // { [candidaturaId]: number|null }

  // Sincroniza lista interna
  useEffect(() => {
    setItens(candidatos);
  }, [candidatos]);

  // Calcula o match assim que itens/vaga mudarem
  useEffect(() => {
    if (!vagaSelecionada || !Array.isArray(itens) || itens.length === 0) {
      setMatchMap({});
      return;
    }
    const next = {};
    for (const c of itens) {
      try {
        const freelancer = c.freelancer || c?.dados?.freelancer || null;
        if (!freelancer) {
          next[c.id] = null;
          continue;
        }
        const res = computeMatchDetailed(vagaSelecionada, freelancer);
        const raw = res?.score ?? res?.match ?? null;
        next[c.id] = toPct(raw);
      } catch {
        next[c.id] = null;
      }
    }
    setMatchMap(next);
  }, [itens, vagaSelecionada]);

  if (!open) return null;

  const atualizarStatus = async (candidaturaId, novoStatus, feedback = '') => {
    try {
      setSavingMap(prev => ({ ...prev, [candidaturaId]: true }));
      setErrMap(prev => ({ ...prev, [candidaturaId]: '' }));

      const token = localStorage.getItem('authToken');
      if (!token) {
        setErrMap(prev => ({ ...prev, [candidaturaId]: 'Sem autenticação' }));
        return;
      }

      // atualização otimista
      setItens(prev =>
        prev.map(c =>
          c.id === candidaturaId ? { ...c, status: novoStatus, feedback_empresa: feedback } : c
        )
      );

      const res = await fetch(`${API_BASE_URL}/api/candidaturas/${candidaturaId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: novoStatus,
          ...(feedback?.trim() ? { feedback_empresa: feedback.trim() } : {}),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Falha ao atualizar');

      // confirma dados do backend
      setItens(prev => prev.map(c => (c.id === candidaturaId ? { ...c, ...json.data } : c)));
    } catch (e) {
      setErrMap(prev => ({ ...prev, [candidaturaId]: e.message || 'Erro ao atualizar status' }));
    } finally {
      setSavingMap(prev => ({ ...prev, [candidaturaId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">Candidatos</h3>
              <p className="text-gray-600 text-sm">
                Vaga: <span className="font-medium">{vagaSelecionada?.titulo}</span>
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando candidatos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">{error}</div>
          ) : itens.length === 0 ? (
            <div className="text-center py-10 text-gray-600">Nenhuma candidatura para esta vaga ainda.</div>
          ) : (
            <div className="space-y-4">
              {itens.map((cand) => {
                const pct = matchMap[cand.id];
                return (
                  <div key={cand.id} className="relative">
                    {/* selo no canto superior-direito do card */}
                    <div className={` rounded right-9 px-2 py-0.5  text-xs font-semibold border-2 ${Number.isFinite(pct) ? badgeColor(pct) : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {Number.isFinite(pct) ? `Match ${pct}%` : 'Match —'}
                    </div>

                    <CandidatoCard
                      candidatura={cand}
                      onVerPerfil={onVerPerfil}
                      statusOptions={STATUS_OPCOES}
                      saving={!!savingMap[cand.id]}
                      errorMsg={errMap[cand.id]}
                      onChangeStatus={(novoStatus, feedback) =>
                        atualizarStatus(cand.id, novoStatus, feedback)
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
