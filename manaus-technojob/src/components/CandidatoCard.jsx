import React from 'react';
import { buildCleanSkills, buildPrincipaisHabilidadesDisplay, formatarTelefone } from '../utils/freelaFormat';

export default function CandidatoCard({ candidatura, onVerPerfil }) {
  const f = candidatura?.freelancer || {};
  const cleanSkills = buildCleanSkills(f);
  const principaisDisplay = buildPrincipaisHabilidadesDisplay(f);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold">
              {f.nome?.charAt(0) || 'F'}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{f.nome || 'Sem nome'}</div>
              <div className="text-sm text-gray-600">
                {f.area_atuacao || 'Área não informada'} • {f.nivel_experiencia || 'Nível não informado'} • {f.modalidade_trabalho || 'Modalidade'}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Local:</span>{' '}
              {f.cidade && f.estado ? `${f.cidade} - ${f.estado}` : 'Não informado'}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Contato:</span>{' '}
              {f.email || '—'} {f.telefone ? `• ${formatarTelefone(f.telefone)}` : ''}
            </div>
            <div className="text-sm text-gray-700 md:col-span-2">
              <span className="font-medium">Principais habilidades:</span>{' '}
              {principaisDisplay || 'Não informado'}
            </div>
            <div className="text-sm text-gray-700 md:col-span-2">
              <span className="font-medium block mb-1">Habilidades (chips):</span>
              {cleanSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {cleanSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">Não informado</span>
              )}
            </div>
          </div>

          {candidatura?.mensagem_candidato && (
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-900 mb-1">Mensagem do candidato:</div>
              <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 p-3 rounded">
                {candidatura.mensagem_candidato}
              </div>
            </div>
          )}
        </div>

        <div className="flex md:flex-col gap-2">
          <button
            onClick={() => onVerPerfil?.(candidatura.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Ver perfil completo
          </button>
          <a
            href={f.url_portfolio || '#'}
            target={f.url_portfolio ? "_blank" : "_self"}
            rel="noreferrer"
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
              f.url_portfolio
                ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                : 'pointer-events-none opacity-50 bg-white text-gray-400 border-gray-200'
            }`}
          >
            Portfólio
          </a>
          <a
            href={f.linkedin || '#'}
            target={f.linkedin ? "_blank" : "_self"}
            rel="noreferrer"
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
              f.linkedin
                ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                : 'pointer-events-none opacity-50 bg-white text-gray-400 border-gray-200'
            }`}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}