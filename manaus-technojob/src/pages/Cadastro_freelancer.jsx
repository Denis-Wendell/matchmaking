// pages/Cadastro_freelancer.jsx
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
// Importando os componentes que você criou
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card from '../components/Card';

/* ========================== Catálogo de Skills ========================== */
/* Você pode editar/expandir esta lista. Os valores são enviados ao backend. */
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

/* =============== Componente local: MultiSelect com busca ================= */
function SkillsMultiSelect({ value = [], onChange }) {
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
      {/* Botão do dropdown */}
      <button
        type="button"
        className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-gray-700">
          {value.length > 0 ? `${value.length} selecionada(s)` : 'Selecione as skills'}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Busca */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar skill..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lista de opções */}
          <div className="max-h-64 overflow-auto p-2">
            {filtered.length === 0 && (
              <div className="text-sm text-gray-500 p-2">Nenhuma skill encontrada.</div>
            )}
            {filtered.map((skill) => {
              const checked = selected.has(skill);
              return (
                <label key={skill} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(skill)}
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              );
            })}
          </div>

          {/* Rodapé */}
          <div className="flex items-center justify-between p-2 border-t border-gray-200">
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={() => onChange([])}
            >
              Limpar
            </button>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setOpen(false)}
            >
              Concluir
            </button>
          </div>
        </div>
      )}

      {/* Chips selecionadas */}
      <div className="mt-2 flex flex-wrap gap-2">
        {value.length === 0 ? (
          <span className="text-sm text-gray-500">Nenhuma skill selecionada</span>
        ) : value.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
            {s}
            <button
              type="button"
              className="hover:text-blue-900"
              onClick={() => remove(s)}
              title="Remover"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================ Página principal ============================ */
function CadastroFreelancer() {
  const navigate = useNavigate();

  // ===== ESTADOS DO FORMULÁRIO =====
  const [formData, setFormData] = useState({
    // --- Informações Pessoais ---
    nomeCompleto: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    cpf: '',
    senha: '',
    confirmarSenha: '',

    // --- Endereço ---
    enderecoCompleto: '',
    cidade: '',
    estado: '',
    cep: '',

    // --- Informações Profissionais ---
    profissao: '',
    nivelExperiencia: '',
    areaAtuacao: '',
    valorHora: '',
    idiomas: '',
    disponibilidade: '',
    modalidadeTrabalho: '',
    resumoProfissional: '',

    // --- Formação e Experiência ---
    formacaoAcademica: '',
    instituicao: '',
    anoConclusao: '',
    certificacoes: '',
    experienciaProfissional: '',
    objetivosProfissionais: '',

    // --- Links e Portfólio ---
    urlPortfolio: '',
    linkedin: '',
    github: '',

    // --- Skills (novo) ---
    selectedSkills: [] // array de strings
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSkillsChange = (arr) => {
    setFormData(prev => ({ ...prev, selectedSkills: arr }));
    if (errors.selectedSkills) setErrors(prev => ({ ...prev, selectedSkills: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Obrigatórios básicos
    if (!formData.nomeCompleto.trim()) newErrors.nomeCompleto = 'Nome completo é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';

    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    else if (formData.senha.length < 6) newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';

    if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = 'Senhas não coincidem';

    // Profissionais
    if (!formData.areaAtuacao) newErrors.areaAtuacao = 'Área de atuação é obrigatória';
    if (!formData.nivelExperiencia) newErrors.nivelExperiencia = 'Nível de experiência é obrigatório';

    // Skills obrigatórias (via multi-select)
    if (!formData.selectedSkills || formData.selectedSkills.length === 0) {
      newErrors.selectedSkills = 'Selecione pelo menos 1 skill';
    }

    return newErrors;
  };

  // ===== FUNÇÃO PARA ENVIAR PARA API =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const finalSkillsArray = Array.from(new Set((formData.selectedSkills || []).map(s => s.trim()).filter(Boolean)));

      // Preparar dados para enviar à API
      const apiData = {
        nome: formData.nomeCompleto,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone || null,
        cpf: formData.cpf || null,
        data_nascimento: formData.dataNascimento || null,
        endereco_completo: formData.enderecoCompleto || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        cep: formData.cep || null,
        profissao: formData.profissao || null,
        area_atuacao: formData.areaAtuacao,
        nivel_experiencia: formData.nivelExperiencia, // valores: 'junior' | 'pleno' | 'senior' | 'especialista'
        valor_hora: formData.valorHora ? parseFloat(formData.valorHora) : null,

        // 👇 importante: espelhamos o seletor de skills nos dois campos usados pelo back
        skills_array: finalSkillsArray,                               // array de strings
        principais_habilidades: finalSkillsArray.join(', '),          // string (coerente com skills_array)

        idiomas: formData.idiomas ? formData.idiomas.split(',').map(i => i.trim()).filter(Boolean) : [],
        disponibilidade: formData.disponibilidade || null,
        modalidade_trabalho: formData.modalidadeTrabalho || null,
        resumo_profissional: formData.resumoProfissional || null,
        experiencia_profissional: formData.experienciaProfissional || null,
        objetivos_profissionais: formData.objetivosProfissionais || null,
        formacao_academica: formData.formacaoAcademica || null,
        instituicao: formData.instituicao || null,
        ano_conclusao: formData.anoConclusao ? parseInt(formData.anoConclusao) : null,
        certificacoes: formData.certificacoes || null,
        url_portfolio: formData.urlPortfolio || null,
        linkedin: formData.linkedin || null,
        github: formData.github || null,
      };

      // Chamada para API
      const response = await fetch('http://localhost:3001/api/auth/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('✅ Cadastro realizado com sucesso!');
        // cache leve (opcional)
        if (result.data?.token) {
          localStorage.setItem('authToken', result.data.token);
          if (result.data.freelancer) {
            localStorage.setItem('freelancerData', JSON.stringify(result.data.freelancer));
          }
        }

        // Reset
        setFormData({
          nomeCompleto: '', email: '', telefone: '', dataNascimento: '',
          cpf: '', senha: '', confirmarSenha: '', enderecoCompleto: '',
          cidade: '', estado: '', cep: '', profissao: '', nivelExperiencia: '',
          areaAtuacao: '', valorHora: '', idiomas: '', disponibilidade: '',
          modalidadeTrabalho: '', resumoProfissional: '',
          formacaoAcademica: '', instituicao: '', anoConclusao: '', certificacoes: '',
          experienciaProfissional: '', objetivosProfissionais: '',
          urlPortfolio: '', linkedin: '', github: '', selectedSkills: []
        });

        // navegação opcional
        // navigate('/login');
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          alert('❌ Erros de validação:\n' + result.errors.join('\n'));
        } else {
          alert(`❌ Erro: ${result.message || 'Erro desconhecido'}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao cadastrar:', error);
      alert('❌ Erro de conexão. Verifique se o servidor está rodando e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ===== DADOS PARA SELECTS (ATUALIZADOS PARA BACKEND) =====
  const estadosBrasil = [
    { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' }, { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' }, { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' }, { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' }, { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' }, { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' }, { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' }, { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' }, { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' }, { value: 'TO', label: 'Tocantins' }
  ];

  const niveisExperiencia = [
    { value: 'junior', label: 'Júnior' },
    { value: 'pleno', label: 'Pleno' },
    { value: 'senior', label: 'Sênior' },
    { value: 'especialista', label: 'Especialista' }
  ];

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

  const opcoesDisponibilidade = [
    { value: 'Tempo Integral', label: 'Tempo Integral' },
    { value: 'Meio Período', label: 'Meio Período' },
    { value: 'Por Projeto', label: 'Por Projeto' },
    { value: 'Consultoria', label: 'Consultoria' }
  ];

  const modalidadesTrabalho = [
    { value: 'remoto', label: 'Remoto' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'hibrido', label: 'Híbrido' }
  ];

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro do Freelancer</h1>
          <p className="text-gray-600">Crie seu perfil profissional e encontre as melhores oportunidades</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ===== SEÇÃO 1: INFORMAÇÕES PESSOAIS ===== */}
          <Card title="Informações Pessoais" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField label="Nome Completo" value={formData.nomeCompleto} onChange={handleChange('nomeCompleto')} placeholder="Seu nome completo" error={errors.nomeCompleto} required />
              <FormField label="E-mail" type="email" value={formData.email} onChange={handleChange('email')} placeholder="seu@email.com" error={errors.email} required />
              <FormField label="Telefone" value={formData.telefone} onChange={handleChange('telefone')} placeholder="(92) 99999-9999" error={errors.telefone} />
              <FormField label="Data de Nascimento" type="date" value={formData.dataNascimento} onChange={handleChange('dataNascimento')} error={errors.dataNascimento} />
              <FormField label="CPF" value={formData.cpf} onChange={handleChange('cpf')} placeholder="000.000.000-00" error={errors.cpf} />
              <FormField label="Senha" type="password" value={formData.senha} onChange={handleChange('senha')} placeholder="Mínimo 6 caracteres" error={errors.senha} required />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <FormField label="Confirmar Senha" type="password" value={formData.confirmarSenha} onChange={handleChange('confirmarSenha')} placeholder="Confirme sua senha" error={errors.confirmarSenha} required />
              <div className="hidden xl:block"></div>
              <div className="hidden xl:block"></div>
            </div>
          </Card>

          {/* ===== SEÇÃO 2: ENDEREÇO ===== */}
          <Card title="Endereço" className="fade-in">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
              <div className="xl:col-span-3">
                <FormField label="Endereço Completo" value={formData.enderecoCompleto} onChange={handleChange('enderecoCompleto')} placeholder="Rua, número, bairro" error={errors.enderecoCompleto} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="xl:col-span-2">
                <FormField label="Cidade" value={formData.cidade} onChange={handleChange('cidade')} placeholder="Sua cidade" error={errors.cidade} />
              </div>
              <FormField label="Estado" type="select" value={formData.estado} onChange={handleChange('estado')} options={estadosBrasil} placeholder="Selecione" error={errors.estado} />
              <FormField label="CEP" value={formData.cep} onChange={handleChange('cep')} placeholder="00000-000" error={errors.cep} />
            </div>
          </Card>

          {/* ===== SEÇÃO 3: INFORMAÇÕES PROFISSIONAIS ===== */}
          <Card title="Informações Profissionais" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField label="Profissão" value={formData.profissao} onChange={handleChange('profissao')} placeholder="Ex: Desenvolvedor Web, Designer, Consultor..." error={errors.profissao} />
              <FormField label="Nível de Experiência" type="select" value={formData.nivelExperiencia} onChange={handleChange('nivelExperiencia')} options={niveisExperiencia} placeholder="Selecione" error={errors.nivelExperiencia} required />
              <FormField label="Área de Atuação" type="select" value={formData.areaAtuacao} onChange={handleChange('areaAtuacao')} options={areasAtuacao} placeholder="Selecione" error={errors.areaAtuacao} required />
              <FormField label="Valor por Hora (R$)" type="number" value={formData.valorHora} onChange={handleChange('valorHora')} placeholder="50" min="1" error={errors.valorHora} />
              <FormField label="Idiomas (separados por vírgula)" value={formData.idiomas} onChange={handleChange('idiomas')} placeholder="Português, Inglês, Espanhol" />
              <FormField label="Disponibilidade" type="select" value={formData.disponibilidade} onChange={handleChange('disponibilidade')} options={opcoesDisponibilidade} placeholder="Selecione" />
            </div>

            {/* === Multi-select de Skills + espelho textual somente leitura === */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills / Tecnologias (selecione na lista)
                  {errors.selectedSkills && (
                    <span className="ml-2 text-red-600 text-xs font-medium">• {errors.selectedSkills}</span>
                  )}
                </label>
                <SkillsMultiSelect
                  value={formData.selectedSkills}
                  onChange={handleSkillsChange}
                />
              </div>

              {/* Espelho textual (só para visualização): permanece coerente com o que foi selecionado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills selecionadas (somente leitura)
                </label>
                <input
                  type="text"
                  value={(formData.selectedSkills || []).join(', ')}
                  readOnly
                  className={`w-full rounded-lg border ${errors.selectedSkills ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3 py-2 text-sm`}
                  placeholder="Selecione acima"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
              <FormField
                label="Modalidade de Trabalho"
                type="select"
                value={formData.modalidadeTrabalho}
                onChange={handleChange('modalidadeTrabalho')}
                options={modalidadesTrabalho}
                placeholder="Selecione"
                error={errors.modalidadeTrabalho}
              />
              <div className="hidden xl:block"></div>
              <div className="hidden xl:block"></div>
            </div>

            <FormField
              label="Resumo Profissional (máx. 500 caracteres)"
              type="textarea"
              value={formData.resumoProfissional}
              onChange={handleChange('resumoProfissional')}
              placeholder="Descreva sua experiência, especializações e o que busca como profissional"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 -mt-2">
              {formData.resumoProfissional.length}/500
            </div>
          </Card>

          {/* ===== SEÇÃO 4: FORMAÇÃO E EXPERIÊNCIA ===== */}
          <Card title="Formação e Experiência" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <FormField label="Formação Acadêmica" value={formData.formacaoAcademica} onChange={handleChange('formacaoAcademica')} placeholder="Ex: Ciência da Computação, Administração..." />
              <FormField label="Instituição" value={formData.instituicao} onChange={handleChange('instituicao')} placeholder="Nome da universidade/escola" />
              <FormField label="Ano de Conclusão" type="number" value={formData.anoConclusao} onChange={handleChange('anoConclusao')} placeholder="2024" min="1950" max="2030" />
              <FormField label="Certificações" value={formData.certificacoes} onChange={handleChange('certificacoes')} placeholder="AWS, Google Cloud, ..." />
            </div>

            <div className="space-y-4">
              <FormField
                label="Experiência Profissional"
                type="textarea"
                value={formData.experienciaProfissional}
                onChange={handleChange('experienciaProfissional')}
                placeholder="Descreva suas principais experiências, projetos e resultados..."
                rows={4}
              />
              <FormField
                label="Objetivos Profissionais (máx. 500 caracteres)"
                type="textarea"
                value={formData.objetivosProfissionais}
                onChange={handleChange('objetivosProfissionais')}
                placeholder="Quais são seus objetivos e que tipo de projetos busca?"
                rows={3}
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 -mt-2">
                {formData.objetivosProfissionais.length}/500
              </div>
            </div>
          </Card>

          {/* ===== SEÇÃO 5: LINKS E PORTFÓLIO ===== */}
          <Card title="Links e Portfólio" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField label="URL do Portfólio" type="url" value={formData.urlPortfolio} onChange={handleChange('urlPortfolio')} placeholder="https://meuportfolio.com" />
              <FormField label="LinkedIn" type="url" value={formData.linkedin} onChange={handleChange('linkedin')} placeholder="https://linkedin.com/in/seuusuario" />
              <FormField label="GitHub" type="url" value={formData.github} onChange={handleChange('github')} placeholder="https://github.com/seuusuario" />
            </div>
          </Card>

          {/* ===== BOTÕES DE AÇÃO ===== */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="primary" type="submit" loading={loading} className="w-full sm:w-auto px-12 py-3">
              {loading ? 'Cadastrando...' : 'Cadastrar Freelancer'}
            </Button>
            <Button variant="secondary" type="button" className="w-full sm:w-auto px-12 py-3" onClick={() => navigate('/login')}>
              Já tenho conta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroFreelancer;
