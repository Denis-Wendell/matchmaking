import React, { useState } from 'react';

// Badge simpático para status
const statusBadge = (status = 'pendente') => {
  const map = {
    pendente: 'bg-gray-100 text-gray-800',
    visualizada: 'bg-blue-100 text-blue-800',
    interessado: 'bg-green-100 text-green-800',
    nao_interessado: 'bg-yellow-100 text-yellow-800',
    rejeitada: 'bg-red-100 text-red-800',
    contratado: 'bg-emerald-100 text-emerald-800',
  };
  return map[status] || map.pendente;
};

export default function CandidatoCard({
  candidatura,
  onVerPerfil,
  statusOptions = [],
  onChangeStatus, // (novoStatus, feedback) => void
  saving = false,
  errorMsg = '',
}) {
  const f = candidatura.freelancer || {};
  const [novoStatus, setNovoStatus] = useState(candidatura.status || 'pendente');
  const [feedback, setFeedback] = useState(candidatura.feedback_empresa || '');

  // >>> ADICIONADO: função para baixar o currículo em PDF <<<
  const baixarCurriculoFreelancer = async (freelancerId, nome) => {
    try {
      if (!freelancerId) {
        alert('ID do freelancer não encontrado.');
        return;
      }

      const token = localStorage.getItem('authToken');
      const resp = await fetch(`${API_BASE_URL}/api/freelancers/${freelancerId}/curriculo.pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(txt || 'Falha ao gerar currículo');
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      // nome do arquivo
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
  // <<< FIM DA FUNÇÃO ADICIONADA

  const aplicar = () => {
    if (!onChangeStatus) return;
    onChangeStatus(novoStatus, feedback);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white hover:bg-gray-50 transition">
      <div className="flex items-start justify-between gap-4">
        {/* Info do freelancer */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {f.nome?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{f.nome || '—'}</div>
              <div className="text-sm text-gray-600">
                {f.area_atuacao || '—'} • {f.nivel_experiencia || '—'} •{' '}
                {f.cidade && f.estado ? `${f.cidade} - ${f.estado}` : 'Localização não informada'}
              </div>
            </div>
          </div>

          {/* Skills rápidas */}
          {Array.isArray(f.skills_array) && f.skills_array.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {f.skills_array.slice(0, 6).map((s, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700"
                >
                  {s}
                </span>
              ))}
              {f.skills_array.length > 6 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{f.skills_array.length - 6}
                </span>
              )}
            </div>
          )}

          {/* Mensagem do candidato */}
          {candidatura.mensagem_candidato && (
            <div className="mt-3 text-sm text-gray-700">
              <span className="font-medium">Mensagem:</span> {candidatura.mensagem_candidato}
            </div>
          )}

          {/* Links */}
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {f.url_portfolio && (
              <a
                href={f.url_portfolio}
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-blue-700"
              >
                Portfólio
              </a>
            )}
            {f.linkedin && (
              <a
                href={f.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-blue-700"
              >
                LinkedIn
              </a>
            )}
            {f.github && (
              <a
                href={f.github}
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-blue-700"
              >
                GitHub
              </a>
            )}
          </div>
        </div>

        {/* Coluna de ações / status */}
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-end">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(
                candidatura.status
              )}`}
            >
              {candidatura.status?.replace('_', ' ') || 'pendente'}
            </span>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alterar status
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
              disabled={saving}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback (opcional)
            </label>
            <textarea
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Escreva um breve feedback para o candidato…"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={saving}
            />
          </div>

          {errorMsg && <div className="mt-2 text-sm text-red-600">{errorMsg}</div>}

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => onVerPerfil?.(candidatura.id)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Ver perfil completo
            </button>

            {/* Botão de baixar currículo (usa a função adicionada) */}
            <button
              onClick={() => baixarCurriculoFreelancer(f.id, f.nome)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Baixar currículo
            </button>

            <button
              onClick={aplicar}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center"
            >
              {saving && (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              {saving ? 'Salvando…' : 'Aplicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
