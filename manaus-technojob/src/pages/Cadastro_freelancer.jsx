// pages/Cadastro_freelancer.jsx
import { useState } from 'react';
// Importando os componentes que você criou
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card from '../components/Card';

function CadastroFreelancer() {
  // ===== ESTADOS DO FORMULÁRIO =====
  // Estado para armazenar todos os dados do formulário
  const [formData, setFormData] = useState({
    // --- Informações Pessoais ---
    nomeCompleto: '',           // Campo obrigatório
    email: '',                  // Campo obrigatório  
    telefone: '',               // Campo obrigatório
    dataNascimento: '',         // Campo obrigatório
    cpf: '',                    // Campo obrigatório
    senha: '',                  // Campo obrigatório
    confirmarSenha: '',         // Campo obrigatório
    
    // --- Endereço ---
    enderecoCompleto: '',       // Campo obrigatório
    cidade: '',                 // Campo obrigatório
    estado: '',                 // Campo obrigatório (select)
    cep: '',                    // Campo obrigatório
    
    // --- Informações Profissionais ---
    profissao: '',              // Campo obrigatório
    nivelExperiencia: '',       // Campo obrigatório (select)
    areaAtuacao: '',            // Campo obrigatório (select)
    valorHora: '',              // Campo obrigatório
    principaisHabilidades: '',   // Campo obrigatório (textarea)
    idiomas: '',                // Campo opcional
    disponibilidade: '',        // Campo opcional (select)
    modalidadeTrabalho: '',     // Campo obrigatório (select)
    resumoProfissional: '',     // Campo opcional (textarea com limite)
    
    // --- Formação e Experiência ---
    formacaoAcademica: '',      // Campo opcional
    instituicao: '',            // Campo opcional
    anoConclusao: '',           // Campo opcional
    certificacoes: '',          // Campo opcional
    experienciaProfissional: '', // Campo opcional (textarea)
    objetivosProfissionais: '', // Campo opcional (textarea com limite)
    
    // --- Links e Portfólio ---
    urlPortfolio: '',           // Campo opcional (URL)
    linkedin: '',               // Campo opcional (URL)
    github: ''                  // Campo opcional (URL)
  });

  // Estado para controlar erros de validação
  const [errors, setErrors] = useState({});
  
  // Estado para controlar loading do botão de envio
  const [loading, setLoading] = useState(false);

  // ===== FUNÇÃO PARA ATUALIZAR DADOS =====
  // Esta função retorna uma função que atualiza um campo específico
  const handleChange = (field) => (e) => {
    // Atualiza o estado do formData para o campo específico
    setFormData(prev => ({
      ...prev,                    // Mantém todos os dados anteriores
      [field]: e.target.value     // Atualiza apenas o campo modificado
    }));
    
    // Se havia erro neste campo, remove o erro quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: ''               // Limpa o erro deste campo
      }));
    }
  };

  // ===== FUNÇÃO DE VALIDAÇÃO =====
  const validateForm = () => {
    const newErrors = {};

    // Validação de campos obrigatórios
    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    if (!formData.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    }
    
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    }
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }
    
    // Validação de endereço
    if (!formData.enderecoCompleto.trim()) {
      newErrors.enderecoCompleto = 'Endereço é obrigatório';
    }
    
    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    
    if (!formData.estado) {
      newErrors.estado = 'Estado é obrigatório';
    }
    
    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    }
    
    // Validação de informações profissionais
    if (!formData.profissao.trim()) {
      newErrors.profissao = 'Profissão é obrigatória';
    }
    
    if (!formData.nivelExperiencia) {
      newErrors.nivelExperiencia = 'Nível de experiência é obrigatório';
    }
    
    if (!formData.areaAtuacao) {
      newErrors.areaAtuacao = 'Área de atuação é obrigatória';
    }
    
    if (!formData.valorHora) {
      newErrors.valorHora = 'Valor por hora é obrigatório';
    }
    
    if (!formData.principaisHabilidades.trim()) {
      newErrors.principaisHabilidades = 'Principais habilidades é obrigatório';
    }
    
    if (!formData.modalidadeTrabalho) {
      newErrors.modalidadeTrabalho = 'Modalidade de trabalho é obrigatória';
    }

    return newErrors;
  };

  // ===== FUNÇÃO PARA ENVIAR FORMULÁRIO =====
  const handleSubmit = async (e) => {
    e.preventDefault();         // Previne reload da página
    
    // Valida o formulário
    const validationErrors = validateForm();
    
    // Se houver erros, exibe e para execução
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Scroll para o primeiro erro
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }

    // Inicia loading
    setLoading(true);
    
    try {
      // Aqui você faria a chamada para sua API
      console.log('📋 Dados do freelancer:', formData);
      
      // Simula chamada API (remover depois)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sucesso
      alert('✅ Cadastro realizado com sucesso!');
      
      // Limpa formulário após sucesso
      setFormData({
        nomeCompleto: '', email: '', telefone: '', dataNascimento: '',
        cpf: '', senha: '', confirmarSenha: '', enderecoCompleto: '',
        cidade: '', estado: '', cep: '', profissao: '', nivelExperiencia: '',
        areaAtuacao: '', valorHora: '', principaisHabilidades: '', idiomas: '',
        disponibilidade: '', modalidadeTrabalho: '', resumoProfissional: '',
        formacaoAcademica: '', instituicao: '', anoConclusao: '', certificacoes: '',
        experienciaProfissional: '', objetivosProfissionais: '', urlPortfolio: '',
        linkedin: '', github: ''
      });
      
    } catch (error) {
      console.error('❌ Erro ao cadastrar:', error);
      alert('❌ Erro ao realizar cadastro. Tente novamente.');
    } finally {
      // Para loading
      setLoading(false);
    }
  };

  // ===== DADOS PARA SELECTS =====
  // Estados brasileiros para o select
  const estadosBrasil = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  // Opções para nível de experiência
  const niveisExperiencia = [
    { value: 'junior', label: 'Júnior' },
    { value: 'pleno', label: 'Pleno' },
    { value: 'senior', label: 'Sênior' },
    { value: 'especialista', label: 'Especialista' }
  ];

  // Opções para área de atuação
  const areasAtuacao = [
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'consultoria', label: 'Consultoria' },
    { value: 'educacao', label: 'Educação' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'juridico', label: 'Jurídico' },
    { value: 'recursos-humanos', label: 'Recursos Humanos' },
    { value: 'outros', label: 'Outros' }
  ];

  // Opções para disponibilidade
  const opcoesDisponibilidade = [
    { value: 'integral', label: 'Tempo Integral' },
    { value: 'parcial', label: 'Meio Período' },
    { value: 'projeto', label: 'Por Projeto' },
    { value: 'consultoria', label: 'Consultoria' }
  ];

  // Opções para modalidade de trabalho
  const modalidadesTrabalho = [
    { value: 'remoto', label: 'Remoto' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'hibrido', label: 'Híbrido' }
  ];

  // ===== RENDERIZAÇÃO DO COMPONENTE =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* CONTAINER COM LARGURA RESPONSIVA PARA TELAS GRANDES */}
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4">
        {/* HEADER DO FORMULÁRIO */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro do Freelancer
          </h1>
          <p className="text-gray-600">
            Crie seu perfil profissional e encontre as melhores oportunidades
          </p>
        </div>

        {/* FORMULÁRIO PRINCIPAL */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ===== SEÇÃO 1: INFORMAÇÕES PESSOAIS ===== */}
          <Card title="Informações Pessoais" className="fade-in">
            {/* Grid responsivo: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Nome Completo */}
              <FormField
                label="Nome Completo"
                value={formData.nomeCompleto}
                onChange={handleChange('nomeCompleto')}
                placeholder="Seu nome completo"
                error={errors.nomeCompleto}
                required
              />
              
              {/* Email */}
              <FormField
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="seu@email.com"
                error={errors.email}
                required
              />
              
              {/* Telefone */}
              <FormField
                label="Telefone"
                value={formData.telefone}
                onChange={handleChange('telefone')}
                placeholder="(11) 99999-9999"
                error={errors.telefone}
                required
              />
              
              {/* Data de Nascimento */}
              <FormField
                label="Data de Nascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleChange('dataNascimento')}
                error={errors.dataNascimento}
                required
              />
              
              {/* CPF */}
              <FormField
                label="CPF"
                value={formData.cpf}
                onChange={handleChange('cpf')}
                placeholder="000.000.000-00"
                error={errors.cpf}
                required
              />
              
              {/* Senha */}
              <FormField
                label="Senha"
                type="password"
                value={formData.senha}
                onChange={handleChange('senha')}
                placeholder="******"
                error={errors.senha}
                required
              />
            </div>
            
            {/* Confirmar Senha - Grid especial para alinhamento */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <FormField
                label="Confirmar Senha"
                type="password"
                value={formData.confirmarSenha}
                onChange={handleChange('confirmarSenha')}
                placeholder="******"
                error={errors.confirmarSenha}
                required
              />
              {/* Espaços vazios para alinhamento em telas grandes */}
              <div className="hidden xl:block"></div>
              <div className="hidden xl:block"></div>
            </div>
          </Card>

          {/* ===== SEÇÃO 2: ENDEREÇO ===== */}
          <Card title="Endereço" className="fade-in">
            {/* Endereço Completo - ocupa largura total */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
              <div className="xl:col-span-3">
                <FormField
                  label="Endereço Completo"
                  value={formData.enderecoCompleto}
                  onChange={handleChange('enderecoCompleto')}
                  placeholder="Rua, número, bairro"
                  error={errors.enderecoCompleto}
                  required
                />
              </div>
            </div>
            
            {/* Cidade (2 cols), Estado, CEP */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="xl:col-span-2">
                <FormField
                  label="Cidade"
                  value={formData.cidade}
                  onChange={handleChange('cidade')}
                  placeholder="Sua cidade"
                  error={errors.cidade}
                  required
                />
              </div>
              
              <FormField
                label="Estado"
                type="select"
                value={formData.estado}
                onChange={handleChange('estado')}
                options={estadosBrasil}
                placeholder="Selecione"
                error={errors.estado}
                required
              />
              
              <FormField
                label="CEP"
                value={formData.cep}
                onChange={handleChange('cep')}
                placeholder="00000-000"
                error={errors.cep}
                required
              />
            </div>
          </Card>

          {/* ===== SEÇÃO 3: INFORMAÇÕES PROFISSIONAIS ===== */}
          <Card title="Informações Profissionais" className="fade-in">
            {/* Grid com 3 colunas em telas grandes */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                label="Profissão"
                value={formData.profissao}
                onChange={handleChange('profissao')}
                placeholder="Ex: Desenvolvedor Web, Designer, Consultor..."
                error={errors.profissao}
                required
              />
              
              <FormField
                label="Nível de Experiência"
                type="select"
                value={formData.nivelExperiencia}
                onChange={handleChange('nivelExperiencia')}
                options={niveisExperiencia}
                placeholder="Selecione"
                error={errors.nivelExperiencia}
                required
              />
              
              <FormField
                label="Área de Atuação"
                type="select"
                value={formData.areaAtuacao}
                onChange={handleChange('areaAtuacao')}
                options={areasAtuacao}
                placeholder="Selecione"
                error={errors.areaAtuacao}
                required
              />
              
              <FormField
                label="Valor por Hora (R$)"
                type="number"
                value={formData.valorHora}
                onChange={handleChange('valorHora')}
                placeholder="50"
                min="1"
                error={errors.valorHora}
                required
              />
              
              <FormField
                label="Idiomas"
                value={formData.idiomas}
                onChange={handleChange('idiomas')}
                placeholder="Português (nativo), Inglês (fluente)..."
              />
              
              <FormField
                label="Disponibilidade"
                type="select"
                value={formData.disponibilidade}
                onChange={handleChange('disponibilidade')}
                options={opcoesDisponibilidade}
                placeholder="Selecione"
              />
            </div>
            
            {/* Campos que ocupam largura total */}
            <div className="space-y-4">
              <FormField
                label="Principais Habilidades"
                value={formData.principaisHabilidades}
                onChange={handleChange('principaisHabilidades')}
                placeholder="JavaScript, React, Node.js, Python..."
                error={errors.principaisHabilidades}
                required
              />
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <FormField
                  label="Modalidade de Trabalho"
                  type="select"
                  value={formData.modalidadeTrabalho}
                  onChange={handleChange('modalidadeTrabalho')}
                  options={modalidadesTrabalho}
                  placeholder="Selecione"
                  error={errors.modalidadeTrabalho}
                  required
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
              {/* Contador de caracteres */}
              <div className="text-right text-sm text-gray-500 -mt-2">
                {formData.resumoProfissional.length}/500
              </div>
            </div>
          </Card>

          {/* ===== SEÇÃO 4: FORMAÇÃO E EXPERIÊNCIA ===== */}
          <Card title="Formação e Experiência" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <FormField
                label="Formação Acadêmica"
                value={formData.formacaoAcademica}
                onChange={handleChange('formacaoAcademica')}
                placeholder="Ex: Ciência da Computação, Administração..."
              />
              
              <FormField
                label="Instituição"
                value={formData.instituicao}
                onChange={handleChange('instituicao')}
                placeholder="Nome da universidade/escola"
              />
              
              <FormField
                label="Ano de Conclusão"
                type="number"
                value={formData.anoConclusao}
                onChange={handleChange('anoConclusao')}
                placeholder="2024"
                min="1950"
                max="2030"
              />
              
              <FormField
                label="Certificações"
                value={formData.certificacoes}
                onChange={handleChange('certificacoes')}
                placeholder="AWS, Google Cloud, Facebook Certified..."
              />
            </div>
            
            <div className="space-y-4">
              <FormField
                label="Experiência Profissional"
                type="textarea"
                value={formData.experienciaProfissional}
                onChange={handleChange('experienciaProfissional')}
                placeholder="Descreva suas principais experiências profissionais, projetos relevantes e resultados alcançados..."
                rows={4}
              />
              
              <FormField
                label="Objetivos Profissionais (máx. 500 caracteres)"
                type="textarea"
                value={formData.objetivosProfissionais}
                onChange={handleChange('objetivosProfissionais')}
                placeholder="Quais são seus objetivos profissionais e que tipo de projetos busca trabalhar?"
                rows={3}
                maxLength={500}
              />
              {/* Contador de caracteres */}
              <div className="text-right text-sm text-gray-500 -mt-2">
                {formData.objetivosProfissionais.length}/500
              </div>
            </div>
          </Card>

          {/* ===== SEÇÃO 5: LINKS E PORTFÓLIO ===== */}
          <Card title="Links e Portfólio" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                label="URL do Portfólio"
                type="url"
                value={formData.urlPortfolio}
                onChange={handleChange('urlPortfolio')}
                placeholder="https://meuportfolio.com"
              />
              
              <FormField
                label="LinkedIn"
                type="url"
                value={formData.linkedin}
                onChange={handleChange('linkedin')}
                placeholder="https://linkedin.com/in/seuusuario"
              />
              
              <FormField
                label="GitHub"
                type="url"
                value={formData.github}
                onChange={handleChange('github')}
                placeholder="https://github.com/seuusuario"
              />
            </div>
          </Card>

          {/* ===== BOTÕES DE AÇÃO ===== */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {/* Botão Principal de Cadastro */}
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              className="w-full sm:w-auto px-12 py-3"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Freelancer'}
            </Button>
            
            {/* Botão Secundário */}
            <Button
              variant="secondary"
              type="button"
              className="w-full sm:w-auto px-12 py-3"
              onClick={() => {
                // Aqui redirecionaria para login
                console.log('Redirecionando para login...');
              }}
            >
              Já tenho conta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroFreelancer;