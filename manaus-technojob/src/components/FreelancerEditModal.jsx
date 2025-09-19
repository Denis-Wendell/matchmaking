// src/components/FreelancerEditModal.jsx
import React from "react";

export default function FreelancerEditModal({
  isOpen,
  onClose,
  data,
  onChange,
  onSave,
  loading,
  error,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-900">Editar Perfil</h3>
            <button
              onClick={onClose}
              disabled={loading}
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

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Bloco: Básico */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={data.nome || ""}
                  onChange={(e) => onChange("nome", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={data.email || ""}
                  onChange={(e) => onChange("email", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={data.telefone || ""}
                  onChange={(e) => onChange("telefone", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor/Hora</label>
                <input
                  type="number"
                  step="0.01"
                  value={data.valor_hora ?? ""}
                  onChange={(e) => onChange("valor_hora", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 85.00"
                />
              </div>
            </div>
          </div>

          {/* Bloco: Localização */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Localização</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={data.cidade || ""}
                  onChange={(e) => onChange("cidade", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
                <input
                  type="text"
                  value={data.estado || ""}
                  onChange={(e) => onChange("estado", e.target.value)}
                  maxLength={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="SP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <input
                  type="text"
                  value={data.cep || ""}
                  onChange={(e) => onChange("cep", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="00000-000"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                <textarea
                  rows={2}
                  value={data.endereco_completo || ""}
                  onChange={(e) => onChange("endereco_completo", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Rua, número, bairro..."
                />
              </div>
            </div>
          </div>

          {/* Bloco: Profissional */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Perfil Profissional</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área de Atuação *</label>
                <input
                  type="text"
                  value={data.area_atuacao || ""}
                  onChange={(e) => onChange("area_atuacao", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível *</label>
                <select
                  value={data.nivel_experiencia || "junior"}
                  onChange={(e) => onChange("nivel_experiencia", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="junior">Júnior</option>
                  <option value="pleno">Pleno</option>
                  <option value="senior">Sênior</option>
                  <option value="especialista">Especialista</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                <select
                  value={data.modalidade_trabalho || "remoto"}
                  onChange={(e) => onChange("modalidade_trabalho", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="remoto">Remoto</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
                <input
                  type="text"
                  value={data.disponibilidade || ""}
                  onChange={(e) => onChange("disponibilidade", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Período integral, Meio período..."
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumo Profissional</label>
                <textarea
                  rows={4}
                  value={data.resumo_profissional || ""}
                  onChange={(e) => onChange("resumo_profissional", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos Profissionais</label>
                <textarea
                  rows={4}
                  value={data.objetivos_profissionais || ""}
                  onChange={(e) => onChange("objetivos_profissionais", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Bloco: Habilidades / Arrays */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Habilidades & Interesses</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Principais Habilidades (texto)</label>
                <textarea
                  rows={3}
                  value={data.principais_habilidades || ""}
                  onChange={(e) => onChange("principais_habilidades", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: React, Node.js, SQL..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (lista) — separadas por vírgula</label>
                <input
                  type="text"
                  value={data.skills_array || ""}
                  onChange={(e) => onChange("skills_array", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="React, Node.js, PostgreSQL"
                />
                <p className="text-xs text-gray-500 mt-1">Iremos converter para array.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idiomas — separados por vírgula</label>
                <input
                  type="text"
                  value={data.idiomas || ""}
                  onChange={(e) => onChange("idiomas", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Português, Inglês"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Áreas de Interesse — separadas por vírgula</label>
                <input
                  type="text"
                  value={data.areas_interesse || ""}
                  onChange={(e) => onChange("areas_interesse", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Frontend, Mobile, UX"
                />
              </div>
            </div>
          </div>

          {/* Bloco: Experiência / Formação */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Experiência & Formação</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experiência Profissional</label>
                <textarea
                  rows={4}
                  value={data.experiencia_profissional || ""}
                  onChange={(e) => onChange("experiencia_profissional", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formação Acadêmica</label>
                  <input
                    type="text"
                    value={data.formacao_academica || ""}
                    onChange={(e) => onChange("formacao_academica", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Curso/Área"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                  <input
                    type="text"
                    value={data.instituicao || ""}
                    onChange={(e) => onChange("instituicao", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ano de Conclusão</label>
                  <input
                    type="number"
                    value={data.ano_conclusao || ""}
                    onChange={(e) => onChange("ano_conclusao", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="2024"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificações</label>
              <textarea
                rows={3}
                value={data.certificacoes || ""}
                onChange={(e) => onChange("certificacoes", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Bloco: Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfólio</label>
                <input
                  type="url"
                  value={data.url_portfolio || ""}
                  onChange={(e) => onChange("url_portfolio", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={data.linkedin || ""}
                  onChange={(e) => onChange("linkedin", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                <input
                  type="url"
                  value={data.github || ""}
                  onChange={(e) => onChange("github", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
