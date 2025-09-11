// pages/Cadastro_empresa.jsx
import { useState } from 'react';
// Importando os componentes que você criou
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card from '../components/Card';

function CadastroEmpresa() {
  // ===== ESTADOS DO FORMULÁRIO =====
  // Estado para armazenar todos os dados do formulário
  const [formData, setFormData] = useState({
    // --- Informações Básicas ---
    nomeEmpresa: '',            // Campo obrigatório
    cnpj: '',                   // Campo obrigatório
    emailCorporativo: '',       // Campo obrigatório
    telefone: '',               // Campo obrigatório
    senha: '',                  // Campo obrigatório
    confirmarSenha: '',         // Campo obrigatório
    
    // --- Endereço ---
    enderecoCompleto: '',       // Campo obrigatório
    cidade: '',                 // Campo obrigatório
    estado: '',                 // Campo obrigatório (select)
    cep: '',                    // Campo obrigatório
    
    // --- Informações da Empresa ---
    setorAtuacao: '',           // Campo obrigatório (select)
    tamanhoEmpresa: '',         // Campo obrigatório (select)
    siteEmpresa: '',            // Campo opcional (URL)
    descricaoEmpresa: '',       // Campo obrigatório (textarea com limite)
    principaisBeneficios: '',   // Campo opcional
    culturaEmpresa: '',         // Campo opcional
    
    // --- Responsável pelo Cadastro ---
    nomeResponsavel: '',        // Campo obrigatório
    cargo: '',                  // Campo obrigatório
    emailResponsavel: '',       // Campo opcional
    telefoneResponsavel: ''     // Campo opcional
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

    // Validação de informações básicas
    if (!formData.nomeEmpresa.trim()) {
      newErrors.nomeEmpresa = 'Nome da empresa é obrigatório';
    }
    
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    }
    
    if (!formData.emailCorporativo.trim()) {
      newErrors.emailCorporativo = 'Email corporativo é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailCorporativo)) {
      newErrors.emailCorporativo = 'Email inválido';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
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
    
    // Validação de informações da empresa
    if (!formData.setorAtuacao) {
      newErrors.setorAtuacao = 'Setor de atuação é obrigatório';
    }
    
    if (!formData.tamanhoEmpresa) {
      newErrors.tamanhoEmpresa = 'Tamanho da empresa é obrigatório';
    }
    
    if (!formData.descricaoEmpresa.trim()) {
      newErrors.descricaoEmpresa = 'Descrição da empresa é obrigatória';
    }
    
    // Validação do responsável
    if (!formData.nomeResponsavel.trim()) {
      newErrors.nomeResponsavel = 'Nome do responsável é obrigatório';
    }
    
    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
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
      console.log('🏢 Dados da empresa:', formData);
      
      // Simula chamada API (remover depois)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sucesso
      alert('✅ Cadastro da empresa realizado com sucesso!');
      
      // Limpa formulário após sucesso
      setFormData({
        nomeEmpresa: '', cnpj: '', emailCorporativo: '', telefone: '',
        senha: '', confirmarSenha: '', enderecoCompleto: '', cidade: '',
        estado: '', cep: '', setorAtuacao: '', tamanhoEmpresa: '',
        siteEmpresa: '', descricaoEmpresa: '', principaisBeneficios: '',
        culturaEmpresa: '', nomeResponsavel: '', cargo: '',
        emailResponsavel: '', telefoneResponsavel: ''
      });
      
    } catch (error) {
      console.error('❌ Erro ao cadastrar empresa:', error);
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

  // Opções para setor de atuação
  const setoresAtuacao = [
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'varejo', label: 'Varejo' },
    { value: 'industria', label: 'Indústria' },
    { value: 'servicos', label: 'Serviços' },
    { value: 'consultoria', label: 'Consultoria' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'logistica', label: 'Logística' },
    { value: 'construcao', label: 'Construção Civil' },
    { value: 'agronegocio', label: 'Agronegócio' },
    { value: 'outros', label: 'Outros' }
  ];

  // Opções para tamanho da empresa
  const tamanhosEmpresa = [
    { value: 'startup', label: 'Startup (1-10 funcionários)' },
    { value: 'pequena', label: 'Pequena (11-50 funcionários)' },
    { value: 'media', label: 'Média (51-200 funcionários)' },
    { value: 'grande', label: 'Grande (201-1000 funcionários)' },
    { value: 'multinacional', label: 'Multinacional (1000+ funcionários)' }
  ];

  // ===== RENDERIZAÇÃO DO COMPONENTE =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* CONTAINER COM LARGURA RESPONSIVA PARA TELAS GRANDES */}
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4">
        {/* HEADER DO FORMULÁRIO */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro da Empresa
          </h1>
          <p className="text-gray-600">
            Complete suas informações para encontrar os melhores talentos
          </p>
        </div>

        {/* FORMULÁRIO PRINCIPAL */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ===== SEÇÃO 1: INFORMAÇÕES BÁSICAS ===== */}
          <Card title="Informações Básicas" className="fade-in">
            {/* Grid responsivo: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Nome da Empresa */}
              <FormField
                label="Nome da Empresa"
                value={formData.nomeEmpresa}
                onChange={handleChange('nomeEmpresa')}
                placeholder="Digite o nome da empresa"
                error={errors.nomeEmpresa}
                required
              />
              
              {/* CNPJ */}
              <FormField
                label="CNPJ"
                value={formData.cnpj}
                onChange={handleChange('cnpj')}
                placeholder="00.000.000/0000-00"
                error={errors.cnpj}
                required
              />
              
              {/* Email Corporativo */}
              <FormField
                label="E-mail Corporativo"
                type="email"
                value={formData.emailCorporativo}
                onChange={handleChange('emailCorporativo')}
                placeholder="contato@empresa.com"
                error={errors.emailCorporativo}
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
              
              {/* Senha */}
              <FormField
                label="Senha"
                type="password"
                value={formData.senha}
                onChange={handleChange('senha')}
                placeholder="*******"
                error={errors.senha}
                required
              />
              
              {/* Confirmar Senha */}
              <FormField
                label="Confirmar Senha"
                type="password"
                value={formData.confirmarSenha}
                onChange={handleChange('confirmarSenha')}
                placeholder="*******"
                error={errors.confirmarSenha}
                required
              />
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
                  placeholder="São Paulo"
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

          {/* ===== SEÇÃO 3: INFORMAÇÕES DA EMPRESA ===== */}
          <Card title="Informações da Empresa" className="fade-in">
            {/* Setor e Tamanho */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                label="Setor de Atuação"
                type="select"
                value={formData.setorAtuacao}
                onChange={handleChange('setorAtuacao')}
                options={setoresAtuacao}
                placeholder="Selecione"
                error={errors.setorAtuacao}
                required
              />
              
              <FormField
                label="Tamanho da Empresa"
                type="select"
                value={formData.tamanhoEmpresa}
                onChange={handleChange('tamanhoEmpresa')}
                options={tamanhosEmpresa}
                placeholder="Selecione"
                error={errors.tamanhoEmpresa}
                required
              />
              
              <FormField
                label="Site da Empresa"
                type="url"
                value={formData.siteEmpresa}
                onChange={handleChange('siteEmpresa')}
                placeholder="https://www.empresa.com"
              />
            </div>
            
            {/* Descrição da Empresa */}
            <FormField
              label="Descrição da Empresa (máx. 500 caracteres)"
              type="textarea"
              value={formData.descricaoEmpresa}
              onChange={handleChange('descricaoEmpresa')}
              placeholder="Descreva sua empresa, missão, valores e o que vocês fazem..."
              rows={4}
              maxLength={500}
              error={errors.descricaoEmpresa}
              required
            />
            {/* Contador de caracteres */}
            <div className="text-right text-sm text-gray-500 -mt-2">
              {formData.descricaoEmpresa.length}/500
            </div>
            
            {/* Benefícios e Cultura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Principais Benefícios"
                value={formData.principaisBeneficios}
                onChange={handleChange('principaisBeneficios')}
                placeholder="Vale alimentação, plano de saúde, home office..."
              />
              
              <FormField
                label="Cultura da Empresa"
                value={formData.culturaEmpresa}
                onChange={handleChange('culturaEmpresa')}
                placeholder="Inovadora, colaborativa, dinâmica..."
              />
            </div>
          </Card>

          {/* ===== SEÇÃO 4: RESPONSÁVEL PELO CADASTRO ===== */}
          <Card title="Responsável pelo Cadastro" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <FormField
                label="Nome do Responsável"
                value={formData.nomeResponsavel}
                onChange={handleChange('nomeResponsavel')}
                placeholder="Nome completo"
                error={errors.nomeResponsavel}
                required
              />
              
              <FormField
                label="Cargo"
                value={formData.cargo}
                onChange={handleChange('cargo')}
                placeholder="Ex: Gerente de RH, CEO, Diretor..."
                error={errors.cargo}
                required
              />
              
              <FormField
                label="E-mail do Responsável"
                type="email"
                value={formData.emailResponsavel}
                onChange={handleChange('emailResponsavel')}
                placeholder="responsavel@empresa.com"
              />
              
              <FormField
                label="Telefone do Responsável"
                value={formData.telefoneResponsavel}
                onChange={handleChange('telefoneResponsavel')}
                placeholder="(11) 99999-9999"
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
              {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
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

export default CadastroEmpresa;