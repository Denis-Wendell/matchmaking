import React from 'react';
import CandidatoCard from './CandidatoCard';

export default function CandidatosModal({
  open,
  onClose,
  vagaSelecionada,
  loading,
  error,
  candidatos = [],
  onVerPerfil
}) {
  if (!open) return null;

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
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
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
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
              {error}
            </div>
          ) : candidatos.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              Nenhuma candidatura para esta vaga ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {candidatos.map((cand) => (
                <CandidatoCard
                  key={cand.id}
                  candidatura={cand}
                  onVerPerfil={onVerPerfil}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
