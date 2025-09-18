import React from 'react';
import { buildCleanSkills, buildPrincipaisHabilidadesDisplay, formatarTelefone } from '../utils/freelaFormat';

export default function PerfilCandidatoModal({
  open,
  onClose,
  loading,
  error,
  candidatura // objeto com .freelancer
}) {
  if (!open) return null;

  const f = candidatura?.freelancer || {};
  const cleanSkills = buildCleanSkills(f);
  const principaisDisplay = buildPrincipaisHabilidadesDisplay(f);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-900">Perfil do Candidato</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
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
                  <div className="font-medium">{f.telefone ? formatarTelefone(f.telefone) : 'Não informado'}</div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
