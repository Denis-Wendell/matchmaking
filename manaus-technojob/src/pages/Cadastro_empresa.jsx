// pages/Cadastro_empresa.jsx
import { useState } from 'react';
// Importando os componentes que você criou
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card from '../components/Card';

function CadastroEmpresa() {
  // ===== ESTADOS DO FORMULÁRIO =====
  const [formData, setFormData] = useState({
    // --- Informações Básicas ---
    nomeEmpresa: '',            
    cnpj: '',                   
    emailCorporativo: '',       
    telefone: '',               
    senha: '',                  
    confirmarSenha: '',         
    
    // --- Endereço ---
    enderecoCompleto: '',       
    cidade: '',                 
    estado: '',                 
    cep: '',                    
    
    // --- Informações da Empresa ---
    setorAtuacao: '',           
    tamanhoEmpresa: '',         
    siteEmpresa: '',            
    descricaoEmpresa: '',       
    principaisBeneficios: '',   
    culturaEmpresa: '',         
    
    // --- Responsável pelo Cadastro ---
    nomeResponsavel: '',        
    cargo: '',                  
    emailResponsavel: '',       
    telefoneResponsavel: ''     
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,                    
      [field]: e.target.value     
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: ''               
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validação de informações básicas (campos obrigatórios para API)
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
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }
    
    // Validação de informações da empresa (campos obrigatórios para API)
    if (!formData.setorAtuacao) {
      newErrors.setorAtuacao = 'Setor de atuação é obrigatório';
    }
    
    if (!formData.tamanhoEmpresa) {
      newErrors.tamanhoEmpresa = 'Tamanho da empresa é obrigatório';
    }
    
    if (!formData.descricaoEmpresa.trim()) {
      newErrors.descricaoEmpresa = 'Descrição da empresa é obrigatória';
    }
    
    // Validação do responsável (campos obrigatórios para API)
    if (!formData.nomeResponsavel.trim()) {
      newErrors.nomeResponsavel = 'Nome do responsável é obrigatório';
    }
    
    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
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
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados para enviar à API
      const apiData = {
        nome: formData.nomeEmpresa,
        cnpj: formData.cnpj,
        email_corporativo: formData.emailCorporativo,
        senha: formData.senha,
        telefone: formData.telefone || null,
        endereco_completo: formData.enderecoCompleto || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        cep: formData.cep || null,
        setor_atuacao: formData.setorAtuacao,
        tamanho_empresa: formData.tamanhoEmpresa,
        site_empresa: formData.siteEmpresa || null,
        descricao_empresa: formData.descricaoEmpresa,
        principais_beneficios: formData.principaisBeneficios || null,
        cultura_empresa: formData.culturaEmpresa || null,
        responsavel_nome: formData.nomeResponsavel,
        responsavel_cargo: formData.cargo,
        responsavel_email: formData.emailResponsavel || null,
        responsavel_telefone: formData.telefoneResponsavel || null,
        // Arrays vazios para campos opcionais
        areas_atuacao: [],
        beneficios_array: formData.principaisBeneficios ? 
          formData.principaisBeneficios.split(',').map(b => b.trim()).filter(b => b.length > 0) : [],
        tecnologias_usadas: []
      };

      console.log('🏢 Enviando dados para API:', apiData);

      // Chamada para API de cadastro de empresa
      const response = await fetch('http://localhost:3001/api/auth/registrar-empresa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Sucesso
        alert('✅ Cadastro da empresa realizado com sucesso!');
        console.log('🎉 Empresa cadastrada:', result.data);
        
        // Opcional: salvar token no localStorage para manter logado
        if (result.data.token) {
          localStorage.setItem('authToken', result.data.token);
          localStorage.setItem('empresaData', JSON.stringify(result.data.empresa));
          localStorage.setItem('tipoUsuario', 'empresa');
          localStorage.setItem('isLoggedIn', 'true');
        }
        
        // Limpar formulário
        setFormData({
          nomeEmpresa: '', cnpj: '', emailCorporativo: '', telefone: '',
          senha: '', confirmarSenha: '', enderecoCompleto: '', cidade: '',
          estado: '', cep: '', setorAtuacao: '', tamanhoEmpresa: '',
          siteEmpresa: '', descricaoEmpresa: '', principaisBeneficios: '',
          culturaEmpresa: '', nomeResponsavel: '', cargo: '',
          emailResponsavel: '', telefoneResponsavel: ''
        });
        
        // Redirecionar para dashboard de empresa
        // window.location.href = '/match-empresa'; // ou usar React Router
        
      } else {
        // Erro da API
        console.error('❌ Erro da API:', result);
        
        if (result.errors && Array.isArray(result.errors)) {
          alert('❌ Erros de validação:\n' + result.errors.join('\n'));
        } else {
          alert(`❌ Erro: ${result.message || 'Erro desconhecido'}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao cadastrar empresa:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('❌ Não foi possível conectar ao servidor. Verifique se o servidor está rodando e tente novamente.');
      } else {
        alert('❌ Erro de conexão. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== DADOS PARA SELECTS (ATUALIZADOS PARA BACKEND) =====
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

  // VALORES ATUALIZADOS PARA COMBINAR COM BACKEND
  const setoresAtuacao = [
    { value: 'Tecnologia', label: 'Tecnologia' },
    { value: 'Financeiro', label: 'Financeiro' },
    { value: 'Saúde', label: 'Saúde' },
    { value: 'Educação', label: 'Educação' },
    { value: 'Varejo', label: 'Varejo' },
    { value: 'Indústria', label: 'Indústria' },
    { value: 'Serviços', label: 'Serviços' },
    { value: 'Consultoria', label: 'Consultoria' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Logística', label: 'Logística' },
    { value: 'Construção Civil', label: 'Construção Civil' },
    { value: 'Agronegócio', label: 'Agronegócio' },
    { value: 'Outros', label: 'Outros' }
  ];

  // VALORES ATUALIZADOS PARA COMBINAR COM BACKEND
  const tamanhosEmpresa = [
    { value: 'Startup', label: 'Startup (1-10 funcionários)' },
    { value: 'Pequena', label: 'Pequena (11-50 funcionários)' },
    { value: 'Média', label: 'Média (51-200 funcionários)' },
    { value: 'Grande', label: 'Grande (201-1000 funcionários)' },
    { value: 'Multinacional', label: 'Multinacional (1000+ funcionários)' }
  ];

  // ===== RENDERIZAÇÃO DO COMPONENTE =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro da Empresa
          </h1>
          <p className="text-gray-600">
            Complete suas informações para encontrar os melhores talentos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ===== SEÇÃO 1: INFORMAÇÕES BÁSICAS ===== */}
          <Card title="Informações Básicas" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                label="Nome da Empresa"
                value={formData.nomeEmpresa}
                onChange={handleChange('nomeEmpresa')}
                placeholder="Digite o nome da empresa"
                error={errors.nomeEmpresa}
                required
              />
              
              <FormField
                label="CNPJ"
                value={formData.cnpj}
                onChange={handleChange('cnpj')}
                placeholder="00.000.000/0000-00 ou apenas números"
                error={errors.cnpj}
                required
              />
              
              <FormField
                label="E-mail Corporativo"
                type="email"
                value={formData.emailCorporativo}
                onChange={handleChange('emailCorporativo')}
                placeholder="contato@empresa.com"
                error={errors.emailCorporativo}
                required
              />
              
              <FormField
                label="Telefone"
                value={formData.telefone}
                onChange={handleChange('telefone')}
                placeholder="(92) 3333-4444"
                error={errors.telefone}
              />
              
              <FormField
                label="Senha"
                type="password"
                value={formData.senha}
                onChange={handleChange('senha')}
                placeholder="Mínimo 6 caracteres"
                error={errors.senha}
                required
              />
              
              <FormField
                label="Confirmar Senha"
                type="password"
                value={formData.confirmarSenha}
                onChange={handleChange('confirmarSenha')}
                placeholder="Confirme sua senha"
                error={errors.confirmarSenha}
                required
              />
            </div>
          </Card>

          {/* ===== SEÇÃO 2: ENDEREÇO ===== */}
          <Card title="Endereço" className="fade-in">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
              <div className="xl:col-span-3">
                <FormField
                  label="Endereço Completo"
                  value={formData.enderecoCompleto}
                  onChange={handleChange('enderecoCompleto')}
                  placeholder="Rua, número, bairro"
                  error={errors.enderecoCompleto}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="xl:col-span-2">
                <FormField
                  label="Cidade"
                  value={formData.cidade}
                  onChange={handleChange('cidade')}
                  placeholder="Manaus"
                  error={errors.cidade}
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
              />
              
              <FormField
                label="CEP"
                value={formData.cep}
                onChange={handleChange('cep')}
                placeholder="00000-000"
                error={errors.cep}
              />
            </div>
          </Card>

          {/* ===== SEÇÃO 3: INFORMAÇÕES DA EMPRESA ===== */}
          <Card title="Informações da Empresa" className="fade-in">
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
            <div className="text-right text-sm text-gray-500 -mt-2">
              {formData.descricaoEmpresa.length}/500
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Principais Benefícios (separados por vírgula)"
                value={formData.principaisBeneficios}
                onChange={handleChange('principaisBeneficios')}
                placeholder="Vale alimentação, plano de saúde, home office"
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
                placeholder="(92) 99999-9999"
              />
            </div>
          </Card>

          {/* ===== BOTÕES DE AÇÃO ===== */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              className="w-full sm:w-auto px-12 py-3"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
            </Button>
            
            <Button
              variant="secondary"
              type="button"
              className="w-full sm:w-auto px-12 py-3"
              onClick={() => {
                console.log('Redirecionando para login...');
                // Implementar redirecionamento
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