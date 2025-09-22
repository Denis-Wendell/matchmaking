import React, { useState } from 'react';
import CandidatoCard from './CandidatoCard';

const STATUS_OPCOES = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'visualizada', label: 'Visualizada' },
  { value: 'interessado', label: 'Interessado' },
  { value: 'nao_interessado', label: 'Não interessado' },
  { value: 'rejeitada', label: 'Rejeitada' },
  { value: 'contratado', label: 'Contratado' },
];

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
  const [savingMap, setSavingMap] = useState({}); // { [candidaturaId]: boolean }
  const [errMap, setErrMap] = useState({});       // { [candidaturaId]: string }

  // Sempre que lista externa mudar, atualiza interna
  React.useEffect(() => {
    setItens(candidatos);
  }, [candidatos]);

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

      // Update otimista
      setItens(prev =>
        prev.map(c =>
          c.id === candidaturaId ? { ...c, status: novoStatus, feedback_empresa: feedback } : c
        )
      );

      const res = await fetch(`http://localhost:3001/api/candidaturas/${candidaturaId}/status`, {
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
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Falha ao atualizar');
      }

      // Garante dados do backend (caso venham normalizados)
      setItens(prev =>
        prev.map(c => (c.id === candidaturaId ? { ...c, ...json.data } : c))
      );
    } catch (e) {
      console.error(e);
      setErrMap(prev => ({
        ...prev,
        [candidaturaId]: e.message || 'Erro ao atualizar status',
      }));
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
              {itens.map((cand) => (
                <CandidatoCard
                  key={cand.id}
                  candidatura={cand}
                  onVerPerfil={onVerPerfil}
                  statusOptions={STATUS_OPCOES}
                  saving={!!savingMap[cand.id]}
                  errorMsg={errMap[cand.id]}
                  onChangeStatus={(novoStatus, feedback) =>
                    atualizarStatus(cand.id, novoStatus, feedback)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
