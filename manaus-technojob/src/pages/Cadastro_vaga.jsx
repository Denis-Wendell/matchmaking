// pages/Cadastro_vaga.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card from '../components/Card';
import { API_BASE_URL } from '../services/api'

/* ========================== Catálogo de Skills (igual ao cadastro do freelancer) ========================== */
const SKILLS_OPTIONS = [
  // Back-end
  'Node.js', 'Express', 'NestJS', 'TypeScript', 'Java', 'Spring Boot',
  'Python', 'Django', 'FastAPI', 'Flask', 'PHP', 'Laravel', '.NET', 'C#',
  'Ruby on Rails', 'Go (Golang)',

  // Front-end
  'HTML', 'CSS', 'JavaScript', 'TypeScript (Front)', 'React', 'Next.js',
  'Vue.js', 'Nuxt', 'Angular', 'Svelte', 'Tailwind CSS', 'Bootstrap',

  // Mobile
  'React Native', 'Flutter', 'Kotlin', 'Swift', 'Android (Nativo)', 'iOS (Nativo)',

  // Banco de dados / Data
  'PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'MongoDB', 'Redis',
  'Elasticsearch', 'Prisma', 'Sequelize', 'TypeORM',

  // DevOps / Cloud
  'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'GitLab CI',
  'AWS', 'Azure', 'GCP', 'Linux', 'Nginx',

  // Data/AI
  'Pandas', 'NumPy', 'Power BI', 'ETL', 'Scikit-learn',
  'OpenAI API', 'LangChain',

  // UI/Design
  'Figma', 'UX/UI',

  // Testes
  'Jest', 'Vitest', 'Cypress', 'Playwright',

  // Outras
  'GraphQL', 'REST', 'WebSockets'
];

/* ================= MultiSelect com busca (mesmo UX do cadastro do freelancer) ================= */
function SkillsMultiSelect({ value = [], onChange, placeholder = 'Selecione as skills' }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');

  const selected = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return SKILLS_OPTIONS.filter(s => s.toLowerCase().includes(t));
  }, [term]);

  const toggle = (skill) => {
    const set = new Set(selected);
    if (set.has(skill)) set.delete(skill);
    else set.add(skill);
    onChange(Array.from(set));
  };

  const remove = (skill) => {
    const set = new Set(selected);
    if (set.has(skill)) {
      set.delete(skill);
      onChange(Array.from(set));
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-gray-700">
          {value.length > 0 ? `${value.length} selecionada(s)` : placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar skill..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-64 overflow-auto p-2">
            {filtered.length === 0 && (
              <div className="text-sm text-gray-500 p-2">Nenhuma skill encontrada.</div>
            )}
            {filtered.map((skill) => {
              const checked = selected.has(skill);
              return (
                <label key={skill} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={checked} onChange={() => toggle(skill)} />
                  <span className="text-sm">{skill}</span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-2 border-t border-gray-200">
            <button type="button" className="text-sm text-gray-600 hover:text-gray-800" onClick={() => onChange([])}>
              Limpar
            </button>
            <button type="button" className="text-sm text-blue-600 hover:text-blue-800" onClick={() => setOpen(false)}>
              Concluir
            </button>
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {value.length === 0 ? (
          <span className="text-sm text-gray-500">Nenhuma skill selecionada</span>
        ) : value.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
            {s}
            <button type="button" className="hover:text-blue-900" onClick={() => remove(s)} title="Remover">
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

/* =================================== Página =================================== */
function CadastroVaga() {
  const navigate = useNavigate();

  // ===== TOAST =====
  const [toast, setToast] = useState({ open: false, type: 'success', title: '', message: '' });
  const showToast = (type, title, message = '') => {
    setToast({ open: true, type, title, message });
    setTimeout(() => setToast(prev => ({ ...prev, open: false })), 3000);
  };

  // ===== MODAL DE SUCESSO =====
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // ===== ESTADOS DO FORMULÁRIO =====
  const [formData, setFormData] = useState({
    // --- Básico ---
    titulo: '',
    area_atuacao: '',
    nivel_experiencia: '',
    tipo_contrato: '',
    modalidade_trabalho: '',
    localizacao_texto: '',
    quantidade_vagas: '1',
    // --- Remuneração / Benefícios ---
    salario_minimo: '',
    salario_maximo: '',
    moeda: 'BRL',
    beneficios_oferecidos: '',
    // --- Descrição ---
    descricao_geral: '',
    principais_responsabilidades: '',
    // --- Requisitos (texto livre que continua existindo) ---
    requisitos_obrigatorios: '',
    requisitos_desejados: '',
    habilidades_comportamentais: '',
    formacao_minima: '',
    experiencia_minima: '',
    idiomas_necessarios: '',
    certificacoes_desejadas: '',
    // --- Info Extra ---
    horario_trabalho: '',
    data_inicio_desejada: '',
    data_limite_inscricoes: '',
    processo_seletivo: '',
    // --- Contato ---
    contato_nome: '',
    contato_email: '',
    contato_telefone: '',
    observacoes: '',

    // --- NOVO: Fonte da verdade para skills (arrays)
    skills_obrigatorias_selected: [],
    skills_desejaveis_selected: [],

    // --- Espelhos somente leitura (para revisão/copy-paste)
    skills_obrigatorias_text: '',
    skills_desejaveis_text: '',
    areas_relacionadas_text: '' // opcional; se quiser manter áreas temáticas
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [empresaData, setEmpresaData] = useState(null);

  // ===== AUTENTICAÇÃO =====
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    const empresaDataStored = localStorage.getItem('empresaData');

    if (!isLoggedIn || userType !== 'empresa') {
      showToast('warning', 'Acesso restrito', 'Faça login como empresa para cadastrar vagas.');
      navigate('/login');
      return;
    }

    if (empresaDataStored) {
      try {
        const parsedData = JSON.parse(empresaDataStored);
        setEmpresaData(parsedData);
        setFormData(prev => ({
          ...prev,
          contato_nome: parsedData.responsavel_nome || '',
          contato_email: parsedData.email_corporativo || ''
        }));
      } catch (err) {
        console.error('Erro ao carregar dados da empresa:', err);
        showToast('error', 'Erro', 'Falha ao carregar dados da empresa.');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // ===== HANDLERS =====
  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // manter espelhos em sincronia sempre que selected mudar
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      skills_obrigatorias_text: (prev.skills_obrigatorias_selected || []).join(', '),
      skills_desejaveis_text: (prev.skills_desejaveis_selected || []).join(', ')
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.skills_obrigatorias_selected, formData.skills_desejaveis_selected]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'Título da vaga é obrigatório';
    if (!formData.area_atuacao) newErrors.area_atuacao = 'Área de atuação é obrigatória';
    if (!formData.nivel_experiencia) newErrors.nivel_experiencia = 'Nível de experiência é obrigatório';
    if (!formData.tipo_contrato) newErrors.tipo_contrato = 'Tipo de contrato é obrigatório';
    if (!formData.modalidade_trabalho) newErrors.modalidade_trabalho = 'Modalidade de trabalho é obrigatória';
    if (!formData.localizacao_texto.trim()) newErrors.localizacao_texto = 'Localização é obrigatória';

    if (!formData.descricao_geral.trim()) {
      newErrors.descricao_geral = 'Descrição geral da vaga é obrigatória';
    } else if (formData.descricao_geral.trim().length < 20) {
      newErrors.descricao_geral = 'Descrição deve ter pelo menos 20 caracteres';
    }

    if (!formData.principais_responsabilidades.trim())
      newErrors.principais_responsabilidades = 'Principais responsabilidades são obrigatórias';

    if (!formData.contato_nome.trim()) newErrors.contato_nome = 'Nome do contato é obrigatório';
    if (!formData.contato_email.trim()) {
      newErrors.contato_email = 'Email de contato é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.contato_email)) {
      newErrors.contato_email = 'Email inválido';
    }

    // ✅ Validação para satisfazer o Model (TEXT notEmpty)
    if (!formData.requisitos_obrigatorios.trim() &&
        (!formData.skills_obrigatorias_selected || formData.skills_obrigatorias_selected.length === 0)) {
      newErrors.requisitos_obrigatorios = 'Informe os requisitos obrigatórios ou selecione ao menos 1 skill obrigatória';
    }

    // ✅ Pelo menos 1 skill obrigatória selecionada (UX)
    if (!formData.skills_obrigatorias_selected || formData.skills_obrigatorias_selected.length === 0) {
      newErrors.skills_obrigatorias_selected = 'Selecione pelo menos 1 skill obrigatória';
    }

    return newErrors;
  };

  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      titulo: '',
      area_atuacao: '',
      nivel_experiencia: '',
      tipo_contrato: '',
      modalidade_trabalho: '',
      localizacao_texto: '',
      quantidade_vagas: '1',
      salario_minimo: '',
      salario_maximo: '',
      moeda: 'BRL',
      beneficios_oferecidos: '',
      descricao_geral: '',
      principais_responsabilidades: '',
      requisitos_obrigatorios: '',
      requisitos_desejados: '',
      habilidades_comportamentais: '',
      formacao_minima: '',
      experiencia_minima: '',
      idiomas_necessarios: '',
      certificacoes_desejadas: '',
      horario_trabalho: '',
      data_inicio_desejada: '',
      data_limite_inscricoes: '',
      processo_seletivo: '',
      palavras_chave: '',
      contato_nome: empresaData?.responsavel_nome || '',
      contato_email: empresaData?.email_corporativo || '',
      contato_telefone: '',
      observacoes: '',
      skills_obrigatorias_selected: [],
      skills_desejaveis_selected: [],
      skills_obrigatorias_text: '',
      skills_desejaveis_text: '',
      areas_relacionadas_text: ''
    }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('warning', 'Revise os campos', 'Há pendências no formulário.');
      return;
    }

    setLoading(true);
    try {
      const skillsObrig = Array.from(new Set((formData.skills_obrigatorias_selected || [])
        .map(s => s.trim())
        .filter(Boolean)));
      const skillsDesej = Array.from(new Set((formData.skills_desejaveis_selected || [])
        .map(s => s.trim())
        .filter(Boolean)));
      const areasRel = Array.from(
        new Set((formData.areas_relacionadas_text || '')
          .split(/[,;\n]/g).map(s => s.trim()).filter(Boolean))
      );

      // Deriva habilidades_tecnicas
      const habilidadesTecnicasAuto = [...skillsObrig, ...skillsDesej].join(', ');

      // Deriva palavras_chave de título/área/skills
      const palavrasChaveAuto = Array.from(new Set([
        formData.titulo,
        formData.area_atuacao,
        ...skillsObrig,
        ...skillsDesej
      ].filter(Boolean))).join(', ');

      // ✅ Fallback para requisitos_obrigatorios (nunca enviar string vazia)
      const requisitosObrigTxt =
        formData.requisitos_obrigatorios.trim() ||
        (skillsObrig.length ? `Conhecimentos essenciais: ${skillsObrig.join(', ')}` : '');

      const dadosVaga = {
        titulo: formData.titulo.trim(),
        area_atuacao: formData.area_atuacao,
        nivel_experiencia: formData.nivel_experiencia, // 'junior' | 'pleno' | 'senior' | 'especialista'
        tipo_contrato: formData.tipo_contrato,
        modalidade_trabalho: formData.modalidade_trabalho,
        localizacao_texto: formData.localizacao_texto.trim(),
        quantidade_vagas: parseInt(formData.quantidade_vagas) || 1,

        salario_minimo: formData.salario_minimo ? parseFloat(formData.salario_minimo) : null,
        salario_maximo: formData.salario_maximo ? parseFloat(formData.salario_maximo) : null,
        moeda: formData.moeda,

        beneficios_oferecidos: formData.beneficios_oferecidos.trim() || null,
        descricao_geral: formData.descricao_geral.trim(),
        principais_responsabilidades: formData.principais_responsabilidades.trim(),
        requisitos_obrigatorios: requisitosObrigTxt, // <- aqui garantimos notEmpty
        requisitos_desejados: formData.requisitos_desejados.trim() || null,

        // derivados
        habilidades_tecnicas: habilidadesTecnicasAuto,
        habilidades_comportamentais: formData.habilidades_comportamentais.trim() || null,

        formacao_minima: formData.formacao_minima || null,
        experiencia_minima: formData.experiencia_minima.trim() || null,
        idiomas_necessarios: formData.idiomas_necessarios.trim() || null,
        certificacoes_desejadas: formData.certificacoes_desejadas.trim() || null,
        horario_trabalho: formData.horario_trabalho.trim() || null,
        data_inicio_desejada: formData.data_inicio_desejada || null,
        data_limite_inscricoes: formData.data_limite_inscricoes || null,
        processo_seletivo: formData.processo_seletivo.trim() || null,

        palavras_chave: palavrasChaveAuto,

        contato_nome: formData.contato_nome.trim(),
        contato_email: formData.contato_email.trim(),
        contato_telefone: formData.contato_telefone.trim() || null,
        observacoes: formData.observacoes.trim() || null,

        // Arrays — alinhados com o Model
        skills_obrigatorias: skillsObrig,
        skills_desejaveis: skillsDesej,
        areas_relacionadas: areasRel
      };

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/vagas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(dadosVaga)
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast('success', 'Vaga publicada!', 'Sua vaga foi criada com sucesso.');
        setSuccessModalOpen(true);
      } else {
        console.error('Erro da API:', result);
        if (result.errors && Array.isArray(result.errors)) {
          showToast('error', 'Erro ao criar vaga', result.errors.join(' • '));
        } else {
          showToast('error', 'Erro ao criar vaga', result.message || 'Tente novamente.');
        }
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      showToast('error', 'Erro de conexão', 'Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ===== SELECTS =====
  const areasAtuacao = [
    { value: 'Tecnologia', label: 'Tecnologia' },
    { value: 'Dados', label: 'Dados' },
    { value: 'Desenvolvimento Web', label: 'Desenvolvimento Web' },
    { value: 'Desenvolvimento Frontend', label: 'Desenvolvimento Frontend' },
    { value: 'Desenvolvimento Backend', label: 'Desenvolvimento Backend' },
    { value: 'Desenvolvimento FullStack', label: 'Desenvolvimento FullStack' },
    { value: 'Devops', label: 'Devops' },
    { value: 'Desenvolvimento Mobile', label: 'Desenvolvimento Mobile' },
    { value: 'UI/UX design', label: 'UI/UX design' },
    { value: 'Cloud Computing', label: 'Cloud Computing' },

  ];

  const niveisExperiencia = [
    { value: 'junior', label: 'Júnior' },
    { value: 'pleno', label: 'Pleno' },
    { value: 'senior', label: 'Sênior' },
    { value: 'especialista', label: 'Especialista' }
  ];

  const tiposContrato = [
    { value: 'clt', label: 'CLT' },
    { value: 'pj', label: 'PJ' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'temporario', label: 'Temporário' },
    { value: 'estagio', label: 'Estágio' }
  ];

  const modalidadesTrabalho = [
    { value: 'remoto', label: 'Remoto' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'hibrido', label: 'Híbrido' }
  ];

  const formacoesMinimas = [
    { value: 'fundamental', label: 'Ensino Fundamental' },
    { value: 'medio', label: 'Ensino Médio' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'superior', label: 'Superior' },
    { value: 'pos-graduacao', label: 'Pós-graduação' },
    { value: 'mestrado', label: 'Mestrado' },
    { value: 'doutorado', label: 'Doutorado' }
  ];

  const moedas = [
    { value: 'BRL', label: 'Real (R$)' },
    { value: 'USD', label: 'Dólar (US$)' },
    { value: 'EUR', label: 'Euro (€)' }
  ];

  if (!empresaData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Carregando dados da empresa...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastrar Nova Vaga</h1>
          <p className="text-gray-600">Publique sua vaga e encontre os melhores candidatos</p>
          <p className="text-sm text-blue-600 mt-2">Logado como: {empresaData.nome}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ===== SEÇÃO 1: BÁSICO ===== */}
          <Card title="Informações Básicas" className="fade-in">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <FormField
                label="Título da Vaga"
                value={formData.titulo}
                onChange={handleChange('titulo')}
                placeholder="Ex: Desenvolvedor React Sênior"
                error={errors.titulo}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                label="Área de Atuação"
                type="select"
                value={formData.area_atuacao}
                onChange={handleChange('area_atuacao')}
                options={areasAtuacao}
                placeholder="Selecione"
                error={errors.area_atuacao}
                required
              />
              <FormField
                label="Nível de Experiência"
                type="select"
                value={formData.nivel_experiencia}
                onChange={handleChange('nivel_experiencia')}
                options={niveisExperiencia}
                placeholder="Selecione"
                error={errors.nivel_experiencia}
                required
              />
              <FormField
                label="Tipo de Contrato"
                type="select"
                value={formData.tipo_contrato}
                onChange={handleChange('tipo_contrato')}
                options={tiposContrato}
                placeholder="Selecione"
                error={errors.tipo_contrato}
                required
              />
              <FormField
                label="Modalidade de Trabalho"
                type="select"
                value={formData.modalidade_trabalho}
                onChange={handleChange('modalidade_trabalho')}
                options={modalidadesTrabalho}
                placeholder="Selecione"
                error={errors.modalidade_trabalho}
                required
              />
              <FormField
                label="Localização"
                value={formData.localizacao_texto}
                onChange={handleChange('localizacao_texto')}
                placeholder="Ex: Manaus - AM, São Paulo - SP, Remoto"
                error={errors.localizacao_texto}
                required
              />
              <FormField
                label="Quantidade de Vagas"
                type="number"
                value={formData.quantidade_vagas}
                onChange={handleChange('quantidade_vagas')}
                placeholder="1"
                min="1"
              />
            </div>
          </Card>

          {/* ===== SEÇÃO 2: REMUNERAÇÃO ===== */}
          <Card title="Remuneração e Benefícios" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <FormField label="Salário Mínimo" type="number" value={formData.salario_minimo} onChange={handleChange('salario_minimo')} placeholder="3000" min="0" step="0.01" />
              <FormField label="Salário Máximo" type="number" value={formData.salario_maximo} onChange={handleChange('salario_maximo')} placeholder="8000" min="0" step="0.01" />
              <FormField label="Moeda" type="select" value={formData.moeda} onChange={handleChange('moeda')} options={moedas} />
              <div className="hidden xl:block" />
            </div>
            <FormField label="Benefícios Oferecidos" value={formData.beneficios_oferecidos} onChange={handleChange('beneficios_oferecidos')} placeholder="Vale refeição, plano de saúde, home office..." />
          </Card>

          {/* ===== SEÇÃO 3: DESCRIÇÃO ===== */}
          <Card title="Descrição da Vaga" className="fade-in">
            <FormField
              label="Descrição Geral da Vaga (mínimo 20 caracteres)"
              type="textarea"
              value={formData.descricao_geral}
              onChange={handleChange('descricao_geral')}
              placeholder="Descreva o que a pessoa fará, ambiente de trabalho, cultura da empresa..."
              rows={4}
              error={errors.descricao_geral}
              required
            />
            <FormField
              label="Principais Responsabilidades"
              type="textarea"
              value={formData.principais_responsabilidades}
              onChange={handleChange('principais_responsabilidades')}
              placeholder="Liste as principais atividades que o profissional irá desenvolver..."
              rows={4}
              error={errors.principais_responsabilidades}
              required
            />
          </Card>

          {/* ===== SEÇÃO 4: REQUISITOS TEXTUAIS ===== */}
          <Card title="Requisitos (Texto Livre)" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Requisitos Obrigatórios"
                type="textarea"
                value={formData.requisitos_obrigatorios}
                onChange={handleChange('requisitos_obrigatorios')}
                placeholder="Formação, experiências mínimas, conhecimentos essenciais..."
                rows={3}
                error={errors.requisitos_obrigatorios}
              />
              <FormField
                label="Requisitos Desejados"
                type="textarea"
                value={formData.requisitos_desejados}
                onChange={handleChange('requisitos_desejados')}
                placeholder="Conhecimentos extras que seriam um diferencial..."
                rows={3}
              />
              <FormField
                label="Habilidades Comportamentais"
                type="textarea"
                value={formData.habilidades_comportamentais}
                onChange={handleChange('habilidades_comportamentais')}
                placeholder="Comunicação, trabalho em equipe, proatividade..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Formação Mínima" type="select" value={formData.formacao_minima} onChange={handleChange('formacao_minima')} options={formacoesMinimas} placeholder="Selecione" />
              <FormField label="Experiência Mínima" value={formData.experiencia_minima} onChange={handleChange('experiencia_minima')} placeholder="2 anos em desenvolvimento web" />
              <FormField label="Idiomas Necessários" value={formData.idiomas_necessarios} onChange={handleChange('idiomas_necessarios')} placeholder="Inglês intermediário, Espanhol básico..." />
              <FormField label="Certificações Desejadas" value={formData.certificacoes_desejadas} onChange={handleChange('certificacoes_desejadas')} placeholder="AWS, Google Cloud, PMP..." />
            </div>
          </Card>

          {/* ===== SEÇÃO 5: SKILLS ===== */}
          <Card title="Skills e Competências (alinhadas com o cadastro do freelancer)" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills Obrigatórias
                  {errors.skills_obrigatorias_selected && (
                    <span className="ml-2 text-red-600 text-xs font-medium">• {errors.skills_obrigatorias_selected}</span>
                  )}
                </label>
                <SkillsMultiSelect
                  value={formData.skills_obrigatorias_selected}
                  onChange={(arr) => setFormData(prev => ({ ...prev, skills_obrigatorias_selected: arr }))}
                  placeholder="Selecione as skills obrigatórias"
                />
                <label className="block text-xs text-gray-500 mt-3 mb-1">Espelho (somente leitura)</label>
                <input
                  type="text"
                  readOnly
                  value={(formData.skills_obrigatorias_selected || []).join(', ')}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills Desejáveis</label>
                <SkillsMultiSelect
                  value={formData.skills_desejaveis_selected}
                  onChange={(arr) => setFormData(prev => ({ ...prev, skills_desejaveis_selected: arr }))}
                  placeholder="Selecione as skills desejáveis"
                />
                <label className="block text-xs text-gray-500 mt-3 mb-1">Espelho (somente leitura)</label>
                <input
                  type="text"
                  readOnly
                  value={(formData.skills_desejaveis_selected || []).join(', ')}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <FormField
              label="Áreas Relacionadas (opcional — vírgula, ponto e vírgula ou nova linha)"
              value={formData.areas_relacionadas_text}
              onChange={handleChange('areas_relacionadas_text')}
              placeholder="Frontend, Backend, DevOps, Mobile"
            />

            <p className="text-xs text-gray-500 mt-2">
              As <b>Habilidades Técnicas</b> e as <b>Palavras-chave</b> serão geradas automaticamente a partir do título, área e das skills informadas.
            </p>
          </Card>

          {/* ===== SEÇÃO 6: INFORMAÇÕES ADICIONAIS ===== */}
          <Card title="Informações Adicionais" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField label="Horário de Trabalho" value={formData.horario_trabalho} onChange={handleChange('horario_trabalho')} placeholder="Segunda a sexta, 8h às 18h" />
              <FormField label="Data de Início Desejada" type="date" value={formData.data_inicio_desejada} onChange={handleChange('data_inicio_desejada')} />
              <FormField label="Data Limite para Inscrições" type="date" value={formData.data_limite_inscricoes} onChange={handleChange('data_limite_inscricoes')} />
            </div>
            <FormField label="Processo Seletivo" type="textarea" value={formData.processo_seletivo} onChange={handleChange('processo_seletivo')} placeholder="Análise de currículo, teste técnico, entrevistas..." rows={2} />
          </Card>

          <Card title="Informações de Contato" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField label="Nome do Contato" value={formData.contato_nome} onChange={handleChange('contato_nome')} placeholder="Nome da pessoa responsável" error={errors.contato_nome} required />
              <FormField label="E-mail de Contato" type="email" value={formData.contato_email} onChange={handleChange('contato_email')} placeholder="recrutador@empresa.com" error={errors.contato_email} required />
              <FormField label="Telefone de Contato" value={formData.contato_telefone} onChange={handleChange('contato_telefone')} placeholder="(92) 99999-9999" />
            </div>
            <FormField label="Observações Adicionais" type="textarea" value={formData.observacoes} onChange={handleChange('observacoes')} placeholder="Informações extras sobre a vaga ou processo seletivo..." rows={3} />
          </Card>

          {/* ===== BOTÕES ===== */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="primary" type="submit" loading={loading} className="w-full sm:w-auto px-12 py-3" disabled={loading}>
              {loading ? 'Criando Vaga...' : 'Publicar Vaga'}
            </Button>
            <Button variant="secondary" type="button" className="w-full sm:w-auto px-12 py-3" disabled={loading} onClick={() => navigate('/perfil-empresa')}>
              Voltar ao Perfil
            </Button>
          </div>
        </form>
      </div>

      {/* ===== TOAST ===== */}
      {toast.open && (
        <div className="fixed top-4 right-4 z-[100]">
          <div className={`shadow-lg rounded-xl px-4 py-3 border bg-white flex items-start gap-3 min-w-[300px]
            ${toast.type === 'success' ? 'border-green-200' :
              toast.type === 'warning' ? 'border-yellow-200' : 'border-red-200'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center
              ${toast.type === 'success' ? 'bg-green-100 text-green-700' :
                toast.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '!' : '✕'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{toast.title}</div>
              {toast.message && <div className="text-sm text-gray-600">{toast.message}</div>}
            </div>
            <button onClick={() => setToast(prev => ({ ...prev, open: false }))} className="text-gray-400 hover:text-gray-600" aria-label="Fechar" title="Fechar">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL DE SUCESSO ===== */}
      {successModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-lg">✓</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">Vaga publicada com sucesso!</h3>
                <p className="text-sm text-gray-600 mt-1">O que você deseja fazer agora?</p>
              </div>
              <button onClick={() => setSuccessModalOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Fechar" title="Fechar">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setSuccessModalOpen(false); resetForm(); showToast('success', 'Pronto!', 'Você pode cadastrar outra vaga.'); }}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Cadastrar outra vaga
              </button>

              <button
                onClick={() => { setSuccessModalOpen(false); navigate('/match-empresa'); }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Ir para Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroVaga;
