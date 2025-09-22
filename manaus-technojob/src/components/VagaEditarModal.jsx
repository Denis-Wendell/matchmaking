// src/components/VagaEditarModal.jsx
import React, { useEffect, useMemo, useState } from 'react';

export default function VagaEditarModal({
  open,
  onClose,
  vagaId,
  initialData = null,
  onUpdated, // (vagaAtualizada) => void
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [vaga, setVaga] = useState(null);

  // campos editáveis (controlados)
  const [form, setForm] = useState({
    // Básico
    titulo: '',
    area_atuacao: '',
    nivel_experiencia: 'junior',
    tipo_contrato: 'clt',
    modalidade_trabalho: 'presencial',
    // Local/quantidade
    localizacao_texto: '',
    quantidade_vagas: 1,
    // Salário
    salario_minimo: '',
    salario_maximo: '',
    moeda: 'BRL',
    // Descrição e blocos
    descricao_geral: '',
    principais_responsabilidades: '',
    requisitos_obrigatorios: '',
    requisitos_desejados: '',
    habilidades_tecnicas: '',
    habilidades_comportamentais: '',
    formacao_minima: '',
    experiencia_minima: '',
    idiomas_necessarios: '',
    certificacoes_desejadas: '',
    horario_trabalho: '',
    // Datas e extras
    data_inicio_desejada: '',
    data_limite_inscricoes: '',
    processo_seletivo: '',
    palavras_chave: '',
    observacoes: '',
    // Contato
    contato_nome: '',
    contato_email: '',
    contato_telefone: '',
    // Arrays (string -> array)
    skills_obrigatorias_str: '',
    skills_desejaveis_str: '',
    areas_relacionadas_str: '',
  });
  const minLen = (str = '', n) => (str?.trim()?.length || 0) >= n;
  const requiredFilled = (v) => (v ?? '').toString().trim() !== '';

  const required = useMemo(() => ([
    'titulo',
    'area_atuacao',
    'nivel_experiencia',
    'tipo_contrato',
    'modalidade_trabalho',
    'localizacao_texto',
    'descricao_geral',
    'principais_responsabilidades',
    'requisitos_obrigatorios',
    'habilidades_tecnicas',
    'contato_nome',
    'contato_email',
  ]), []);

  const preencherForm = (src) => {
    setForm({
      titulo: src.titulo || '',
      area_atuacao: src.area_atuacao || '',
      nivel_experiencia: src.nivel_experiencia || 'junior',
      tipo_contrato: src.tipo_contrato || 'clt',
      modalidade_trabalho: src.modalidade_trabalho || 'presencial',

      localizacao_texto: src.localizacao_texto || '',
      quantidade_vagas: src.quantidade_vagas ?? 1,

      salario_minimo: src.salario_minimo ?? '',
      salario_maximo: src.salario_maximo ?? '',
      moeda: src.moeda || 'BRL',

      descricao_geral: src.descricao_geral || '',
      principais_responsabilidades: src.principais_responsabilidades || '',
      requisitos_obrigatorios: src.requisitos_obrigatorios || '',
      requisitos_desejados: src.requisitos_desejados || '',
      habilidades_tecnicas: src.habilidades_tecnicas || '',
      habilidades_comportamentais: src.habilidades_comportamentais || '',
      formacao_minima: src.formacao_minima || '',
      experiencia_minima: src.experiencia_minima || '',
      idiomas_necessarios: src.idiomas_necessarios || '',
      certificacoes_desejadas: src.certificacoes_desejadas || '',
      horario_trabalho: src.horario_trabalho || '',

      data_inicio_desejada: src.data_inicio_desejada || '',
      data_limite_inscricoes: src.data_limite_inscricoes || '',
      processo_seletivo: src.processo_seletivo || '',
      palavras_chave: src.palavras_chave || '',
      observacoes: src.observacoes || '',

      contato_nome: src.contato_nome || '',
      contato_email: src.contato_email || '',
      contato_telefone: src.contato_telefone || '',

      skills_obrigatorias_str: Array.isArray(src.skills_obrigatorias) ? src.skills_obrigatorias.join(', ') : '',
      skills_desejaveis_str: Array.isArray(src.skills_desejaveis) ? src.skills_desejaveis.join(', ') : '',
      areas_relacionadas_str: Array.isArray(src.areas_relacionadas) ? src.areas_relacionadas.join(', ') : '',
    });
  };

  // carrega dados ao abrir
  useEffect(() => {
    if (!open) return;
    setError('');
    setVaga(null);

    // usa initialData se veio da lista (evita uma requisição)
    if (initialData) {
      setVaga(initialData);
      preencherForm(initialData);
      return;
    }

    // se não veio, busca detalhes
    (async () => {
      try {
        setLoading(true);
        const resp = await fetch(`http://localhost:3001/api/vagas/${vagaId}`);
        const json = await resp.json();
        if (resp.ok && json.success) {
          setVaga(json.data);
          preencherForm(json.data);
        } else {
          setError(json.message || 'Não foi possível carregar a vaga.');
        }
      } catch (e) {
        console.error(e);
        setError('Erro de conexão ao carregar a vaga.');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, vagaId, initialData]);

  const update = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const validar = () => {
    // obrigatórios
    for (const k of required) {
        if (!requiredFilled(form[k])) {
        setError(`Campo obrigatório ausente: ${k.replace('_', ' ')}`);
        return false;
        }
    }
    // mínimo de 20 caracteres na descrição
    if (!minLen(form.descricao_geral, 20)) {
        setError('Descrição geral precisa ter pelo menos 20 caracteres.');
        return false;
    }
    setError('');
    return true;
    };

  const parseList = (str) =>
    (str || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

  const handleSalvar = async () => {
    if (!validar()) return;

    try {
      setSaving(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Sessão expirada. Faça login novamente.');
        return;
      }

      // monta payload conforme seu model
      const payload = {
        titulo: form.titulo.trim(),
        area_atuacao: form.area_atuacao.trim(),
        nivel_experiencia: form.nivel_experiencia,
        tipo_contrato: form.tipo_contrato,
        modalidade_trabalho: form.modalidade_trabalho,

        localizacao_texto: form.localizacao_texto.trim(),
        quantidade_vagas: Number(form.quantidade_vagas) || 1,

        salario_minimo: form.salario_minimo === '' ? null : Number(form.salario_minimo),
        salario_maximo: form.salario_maximo === '' ? null : Number(form.salario_maximo),
        moeda: form.moeda || 'BRL',

        descricao_geral: form.descricao_geral,
        principais_responsabilidades: form.principais_responsabilidades,
        requisitos_obrigatorios: form.requisitos_obrigatorios,
        requisitos_desejados: form.requisitos_desejados || null,
        habilidades_tecnicas: form.habilidades_tecnicas,
        habilidades_comportamentais: form.habilidades_comportamentais || null,
        formacao_minima: form.formacao_minima || null,
        experiencia_minima: form.experiencia_minima || null,
        idiomas_necessarios: form.idiomas_necessarios || null,
        certificacoes_desejadas: form.certificacoes_desejadas || null,
        horario_trabalho: form.horario_trabalho || null,

        data_inicio_desejada: form.data_inicio_desejada || null,
        data_limite_inscricoes: form.data_limite_inscricoes || null,
        processo_seletivo: form.processo_seletivo || null,
        palavras_chave: form.palavras_chave || null,
        observacoes: form.observacoes || null,

        contato_nome: form.contato_nome,
        contato_email: form.contato_email,
        contato_telefone: form.contato_telefone || null,

        skills_obrigatorias: parseList(form.skills_obrigatorias_str),
        skills_desejaveis: parseList(form.skills_desejaveis_str),
        areas_relacionadas: parseList(form.areas_relacionadas_str),
      };

      // supondo que seu backend tenha PUT (ou PATCH) /api/vagas/:id para edição
      const resp = await fetch(`http://localhost:3001/api/vagas/${vagaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await resp.json();
      if (resp.ok && json.success) {
        onUpdated?.(json.data);
        onClose?.();
      } else {
        setError(json.message || 'Falha ao salvar alterações da vaga.');
      }
    } catch (e) {
      console.error(e);
      setError('Erro de conexão ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Editar Vaga</h3>
            <p className="text-gray-600 text-sm">
              {vaga?.titulo || 'Carregando...'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="px-6 pt-4">
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Conteúdo */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados da vaga...</p>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Básico */}
            <section>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    value={form.titulo}
                    onChange={(e) => update('titulo', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área de atuação *</label>
                  <input
                    value={form.area_atuacao}
                    onChange={(e) => update('area_atuacao', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nível *</label>
                  <select
                    value={form.nivel_experiencia}
                    onChange={(e) => update('nivel_experiencia', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="junior">Júnior</option>
                    <option value="pleno">Pleno</option>
                    <option value="senior">Sênior</option>
                    <option value="especialista">Especialista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contrato *</label>
                  <select
                    value={form.tipo_contrato}
                    onChange={(e) => update('tipo_contrato', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="clt">CLT</option>
                    <option value="pj">PJ</option>
                    <option value="estagio">Estágio</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="temporario">Temporário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade *</label>
                  <select
                    value={form.modalidade_trabalho}
                    onChange={(e) => update('modalidade_trabalho', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="remoto">Remoto</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localização *</label>
                  <input
                    value={form.localizacao_texto}
                    onChange={(e) => update('localizacao_texto', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Cidade/UF ou Remoto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. vagas</label>
                  <input
                    type="number"
                    value={form.quantidade_vagas}
                    onChange={(e) => update('quantidade_vagas', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min={1}
                  />
                </div>
              </div>
            </section>

            {/* Salário */}
            <section>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Remuneração</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salário mínimo</label>
                  <input
                    type="number"
                    value={form.salario_minimo}
                    onChange={(e) => update('salario_minimo', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salário máximo</label>
                  <input
                    type="number"
                    value={form.salario_maximo}
                    onChange={(e) => update('salario_maximo', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                  <input
                    value={form.moeda}
                    onChange={(e) => update('moeda', e.target.value.toUpperCase().slice(0,3))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="BRL"
                    maxLength={3}
                  />
                </div>
              </div>
            </section>

            {/* Blocos descritivos */}
            <section>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Descrição e Requisitos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição geral *
                </label>
                <textarea
                    rows={4}
                    value={form.descricao_geral}
                    onChange={(e) => update('descricao_geral', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 ${
                    minLen(form.descricao_geral, 20)
                        ? 'border-gray-300'
                        : 'border-red-300 focus:border-red-400'
                    }`}
                    placeholder="Descreva a vaga (mín. 20 caracteres)"
                />
                <div className="flex items-center justify-between mt-1 text-xs">
                    <span className={minLen(form.descricao_geral, 20) ? 'text-gray-500' : 'text-red-600'}>
                    {minLen(form.descricao_geral, 20)
                        ? ''
                        : 'Mínimo de 20 caracteres'}
                    </span>
                    <span className="text-gray-500">
                    {(form.descricao_geral?.trim()?.length || 0)}/20
                    </span>
                </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principais responsabilidades *</label>
                  <textarea
                    rows={3}
                    value={form.principais_responsabilidades}
                    onChange={(e) => update('principais_responsabilidades', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos obrigatórios *</label>
                  <textarea
                    rows={3}
                    value={form.requisitos_obrigatorios}
                    onChange={(e) => update('requisitos_obrigatorios', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos desejados</label>
                  <textarea
                    rows={3}
                    value={form.requisitos_desejados}
                    onChange={(e) => update('requisitos_desejados', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Habilidades técnicas *</label>
                  <textarea
                    rows={3}
                    value={form.habilidades_tecnicas}
                    onChange={(e) => update('habilidades_tecnicas', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Habilidades comportamentais</label>
                  <textarea
                    rows={3}
                    value={form.habilidades_comportamentais}
                    onChange={(e) => update('habilidades_comportamentais', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formação mínima</label>
                  <input
                    value={form.formacao_minima}
                    onChange={(e) => update('formacao_minima', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experiência mínima</label>
                  <input
                    value={form.experiencia_minima}
                    onChange={(e) => update('experiencia_minima', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idiomas necessários</label>
                  <input
                    value={form.idiomas_necessarios}
                    onChange={(e) => update('idiomas_necessarios', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificações desejadas</label>
                  <input
                    value={form.certificacoes_desejadas}
                    onChange={(e) => update('certificacoes_desejadas', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário de trabalho</label>
                  <input
                    value={form.horario_trabalho}
                    onChange={(e) => update('horario_trabalho', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </section>

            {/* Arrays e palavras-chave */}
            <section>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills e Relações</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills obrigatórias *</label>
                  <input
                    value={form.skills_obrigatorias_str}
                    onChange={(e) => update('skills_obrigatorias_str', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ex: React, Node.js, PostgreSQL"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separe por vírgulas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills desejáveis</label>
                  <input
                    value={form.skills_desejaveis_str}
                    onChange={(e) => update('skills_desejaveis_str', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ex: AWS, Docker"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Áreas relacionadas</label>
                  <input
                    value={form.areas_relacionadas_str}
                    onChange={(e) => update('areas_relacionadas_str', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ex: Back-end, DevOps"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave</label>
                  <input
                    value={form.palavras_chave}
                    onChange={(e) => update('palavras_chave', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ex: fintech, pagamentos, B2B"
                  />
                </div>
              </div>
            </section>

            {/* Datas e processo */}
            <section>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Processo & Datas</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início desejado</label>
                  <input
                    type="date"
                    value={form.data_inicio_desejada || ''}
                    onChange={(e) => update('data_inicio_desejada', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite inscrições</label>
                  <input
                    type="date"
                    value={form.data_limite_inscricoes || ''}
                    onChange={(e) => update('data_limite_inscricoes', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Processo seletivo</label>
                  <textarea
                    rows={3}
                    value={form.processo_seletivo}
                    onChange={(e) => update('processo_seletivo', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </section>

            {/* Contato */}
            <section>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contato</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    value={form.contato_nome}
                    onChange={(e) => update('contato_nome', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.contato_email}
                    onChange={(e) => update('contato_email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    value={form.contato_telefone}
                    onChange={(e) => update('contato_telefone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {saving && <span className="animate-spin h-4 w-4 border-b-2 mr-2 rounded-full"></span>}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
