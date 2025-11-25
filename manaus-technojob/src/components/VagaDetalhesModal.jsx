// src/components/VagaDetalhesModal.jsx
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../services/api'

export default function VagaDetalhesModal({
  open,
  onClose,
  vagaId,
  vaga, // opcional; se vier com .id, usa esse id
}) {
  const [loading, setLoading] = useState(false);
  const [detalhes, setDetalhes] = useState(null);

  const id = vaga?.id || vagaId;

  useEffect(() => {
    let abort = false;
    const carregar = async () => {
      if (!open || !id) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/vagas/${id}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const json = await res.json();
        if (!abort) {
          if (res.ok && json.success) {
            setDetalhes(json.data);
          } else {
            // fallback: se veio vaga básica via prop, usa ela
            setDetalhes(vaga || null);
            console.warn('Não foi possível carregar detalhes completos:', json.message);
          }
        }
      } catch (e) {
        console.error('Erro ao carregar detalhes da vaga:', e);
        if (!abort) setDetalhes(vaga || null);
      } finally {
        if (!abort) setLoading(false);
      }
    };
    carregar();
    return () => { abort = true; };
  }, [open, id]); // eslint-disable-line

  if (!open) return null;

  // helpers locais
  const formatarData = (dataString) => {
    try {
      const d = new Date(dataString);
      if (Number.isNaN(d.getTime())) return '-';
      const diff = Date.now() - d.getTime();
      const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (dias === 1) return 'Há 1 dia';
      if (dias < 7) return `Há ${dias} dias`;
      if (dias < 30) return `Há ${Math.ceil(dias / 7)} semana(s)`;
      return d.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const formatarSalario = (min, max, moeda = 'BRL') => {
    if (!min && !max) return 'A combinar';
    const nf = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda || 'BRL' });
    if (min && max) return `${nf.format(min)} - ${nf.format(max)}`;
    return min ? `A partir de ${nf.format(min)}` : `Até ${nf.format(max)}`;
  };

  const getNivelColor = (nivel) => ({
    junior: 'bg-green-100 text-green-800',
    pleno: 'bg-blue-100 text-blue-800',
    senior: 'bg-purple-100 text-purple-800',
    especialista: 'bg-red-100 text-red-800',
  }[nivel] || 'bg-gray-100 text-gray-800');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-start sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl text-white font-bold">
              {(detalhes?.empresa?.nome || vaga?.empresa?.nome || 'E').charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {detalhes?.titulo || vaga?.titulo || 'Vaga'}
              </h2>
              <p className="text-lg text-gray-600 font-medium">
                {detalhes?.empresa?.nome || vaga?.empresa?.nome || 'Empresa'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes da vaga...</p>
          </div>
        ) : !detalhes ? (
          <div className="p-8 text-center text-gray-600">
            Não foi possível carregar os detalhes da vaga.
          </div>
        ) : (
          <div className="p-6">
            {/* grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                {/* Descrição */}
                {detalhes.descricao_geral && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição da Vaga</h3>
                    <div className="prose prose-sm text-gray-700">
                      <p className="whitespace-pre-line">{detalhes.descricao_geral}</p>
                    </div>
                  </div>
                )}

                {/* Responsabilidades (se teu backend usar outro nome, ajuste aqui) */}
                {detalhes.principais_responsabilidades && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsabilidades</h3>
                    <div className="prose prose-sm text-gray-700">
                      <p className="whitespace-pre-line">{detalhes.principais_responsabilidades}</p>
                    </div>
                  </div>
                )}

                {/* Requisitos */}
                {(detalhes.requisitos_obrigatorios || detalhes.habilidades_tecnicas) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos</h3>
                    <div className="prose prose-sm text-gray-700">
                      <p className="whitespace-pre-line">
                        {detalhes.requisitos_obrigatorios || detalhes.habilidades_tecnicas}
                      </p>
                    </div>
                  </div>
                )}

                {/* Skills obrigatórias */}
                {Array.isArray(detalhes.skills_obrigatorias) && detalhes.skills_obrigatorias.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Obrigatórias</h3>
                    <div className="flex flex-wrap gap-2">
                      {detalhes.skills_obrigatorias.map((s, i) => (
                        <span key={i} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills desejáveis */}
                {Array.isArray(detalhes.skills_desejaveis) && detalhes.skills_desejaveis.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Desejáveis</h3>
                    <div className="flex flex-wrap gap-2">
                      {detalhes.skills_desejaveis.map((s, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bloco informações */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Vaga</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Salário</label>
                      <p className="text-lg font-semibold text-green-600">
                        {formatarSalario(detalhes.salario_minimo, detalhes.salario_maximo, detalhes.moeda)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Localização</label>
                      <p className="text-gray-900">{detalhes.localizacao_texto || '-'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Modalidade</label>
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {detalhes.modalidade_trabalho || '-'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Contrato</label>
                      <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {detalhes.tipo_contrato || '-'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Área</label>
                      <p className="text-gray-900">{detalhes.area_atuacao || '-'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nível</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(detalhes.nivel_experiencia)}`}>
                        {detalhes.nivel_experiencia || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Estatísticas</label>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{detalhes.visualizacoes || 0} visualizações</span>
                      <span>{detalhes.candidaturas || 0} candidaturas</span>
                      <span>Publicada {formatarData(detalhes.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Benefícios (se teu backend usa outro campo, ajuste) */}
                {Array.isArray(detalhes.beneficios_oferecidos) && detalhes.beneficios_oferecidos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefícios</h3>
                    <div className="flex flex-wrap gap-2">
                      {detalhes.beneficios_oferecidos.map((b, i) => (
                        <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar simples (empresa não precisa de ações de candidatura) */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Rápidas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modalidade:</span>
                      <span className="font-medium">{detalhes.modalidade_trabalho || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contrato:</span>
                      <span className="font-medium">{detalhes.tipo_contrato || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nível:</span>
                      <span className="font-medium">{detalhes.nivel_experiencia || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Empresa */}
            {detalhes.empresa && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre a Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{detalhes.empresa.nome}</h4>
                    {detalhes.empresa.descricao_empresa && (
                      <p className="text-gray-600 text-sm mb-3">{detalhes.empresa.descricao_empresa}</p>
                    )}
                    {detalhes.empresa.site_empresa && (
                      <a
                        href={detalhes.empresa.site_empresa}
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
                      {detalhes.empresa.setor_atuacao && (
                        <p><span className="font-medium">Setor:</span> {detalhes.empresa.setor_atuacao}</p>
                      )}
                      {detalhes.empresa.tamanho_empresa && (
                        <p><span className="font-medium">Tamanho:</span> {detalhes.empresa.tamanho_empresa}</p>
                      )}
                      {detalhes.empresa.cidade && detalhes.empresa.estado && (
                        <p><span className="font-medium">Localização:</span> {detalhes.empresa.cidade}, {detalhes.empresa.estado}</p>
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
  );
}
