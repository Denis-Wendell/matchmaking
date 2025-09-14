// pages/Cadastro_freelancer.jsx
import { useState } from 'react';
// Importando os componentes que você criou
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card from '../components/Card';

function CadastroFreelancer() {
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
    principaisHabilidades: '',   
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
    github: ''                  
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

    // Validação de campos obrigatórios
    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }
    
    // Validação de informações profissionais (campos obrigatórios para API)
    if (!formData.areaAtuacao) {
      newErrors.areaAtuacao = 'Área de atuação é obrigatória';
    }
    
    if (!formData.nivelExperiencia) {
      newErrors.nivelExperiencia = 'Nível de experiência é obrigatório';
    }
    
    if (!formData.principaisHabilidades.trim()) {
      newErrors.principaisHabilidades = 'Principais habilidades é obrigatório';
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
        nivel_experiencia: formData.nivelExperiencia,
        valor_hora: formData.valorHora ? parseFloat(formData.valorHora) : null,
        principais_habilidades: formData.principaisHabilidades,
        idiomas: formData.idiomas ? formData.idiomas.split(',').map(i => i.trim()) : [],
        disponibilidade: formData.disponibilidade || null,
        modalidade_trabalho: formData.modalidadeTrabalho || 'Remoto',
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
        // Criar array de skills a partir das principais habilidades
        skills_array: formData.principaisHabilidades.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
      };

      console.log('📋 Enviando dados para API:', apiData);

      // Chamada para API
      const response = await fetch('http://localhost:3001/api/auth/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Sucesso
        alert('✅ Cadastro realizado com sucesso!');
        console.log('🎉 Freelancer cadastrado:', result.data);
        
        // Opcional: salvar token no localStorage para manter logado
        if (result.data.token) {
          localStorage.setItem('authToken', result.data.token);
          localStorage.setItem('freelancerData', JSON.stringify(result.data.freelancer));
        }
        
        // Limpar formulário
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
        
        // Redirecionar para dashboard ou login
        // window.location.href = '/dashboard'; // ou usar React Router
        
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
      console.error('❌ Erro ao cadastrar:', error);
      alert('❌ Erro de conexão. Verifique se o servidor está rodando e tente novamente.');
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
  const niveisExperiencia = [
    { value: 'Junior', label: 'Júnior' },
    { value: 'Pleno', label: 'Pleno' },
    { value: 'Senior', label: 'Sênior' },
    { value: 'Especialista', label: 'Especialista' }
  ];

  const areasAtuacao = [
    { value: 'Tecnologia', label: 'Tecnologia' },
    { value: 'Design Gráfico', label: 'Design Gráfico' },
    { value: 'Marketing Digital', label: 'Marketing Digital' },
    { value: 'Consultoria', label: 'Consultoria' },
    { value: 'Educação', label: 'Educação' },
    { value: 'Vendas', label: 'Vendas' },
    { value: 'Financeiro', label: 'Financeiro' },
    { value: 'Jurídico', label: 'Jurídico' },
    { value: 'Recursos Humanos', label: 'Recursos Humanos' },
    { value: 'Redação', label: 'Redação' },
    { value: 'Tradução', label: 'Tradução' },
    { value: 'Fotografia', label: 'Fotografia' },
    { value: 'Outros', label: 'Outros' }
  ];

  const opcoesDisponibilidade = [
    { value: 'Tempo Integral', label: 'Tempo Integral' },
    { value: 'Meio Período', label: 'Meio Período' },
    { value: 'Por Projeto', label: 'Por Projeto' },
    { value: 'Consultoria', label: 'Consultoria' }
  ];

  const modalidadesTrabalho = [
    { value: 'Remoto', label: 'Remoto' },
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Híbrido', label: 'Híbrido' }
  ];

  // ===== RENDERIZAÇÃO DO COMPONENTE =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro do Freelancer
          </h1>
          <p className="text-gray-600">
            Crie seu perfil profissional e encontre as melhores oportunidades
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ===== SEÇÃO 1: INFORMAÇÕES PESSOAIS ===== */}
          <Card title="Informações Pessoais" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                label="Nome Completo"
                value={formData.nomeCompleto}
                onChange={handleChange('nomeCompleto')}
                placeholder="Seu nome completo"
                error={errors.nomeCompleto}
                required
              />
              
              <FormField
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="seu@email.com"
                error={errors.email}
                required
              />
              
              <FormField
                label="Telefone"
                value={formData.telefone}
                onChange={handleChange('telefone')}
                placeholder="(92) 99999-9999"
                error={errors.telefone}
              />
              
              <FormField
                label="Data de Nascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleChange('dataNascimento')}
                error={errors.dataNascimento}
              />
              
              <FormField
                label="CPF"
                value={formData.cpf}
                onChange={handleChange('cpf')}
                placeholder="000.000.000-00"
                error={errors.cpf}
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
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <FormField
                label="Confirmar Senha"
                type="password"
                value={formData.confirmarSenha}
                onChange={handleChange('confirmarSenha')}
                placeholder="Confirme sua senha"
                error={errors.confirmarSenha}
                required
              />
              <div className="hidden xl:block"></div>
              <div className="hidden xl:block"></div>
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
                  placeholder="Sua cidade"
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

          {/* ===== SEÇÃO 3: INFORMAÇÕES PROFISSIONAIS ===== */}
          <Card title="Informações Profissionais" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                label="Profissão"
                value={formData.profissao}
                onChange={handleChange('profissao')}
                placeholder="Ex: Desenvolvedor Web, Designer, Consultor..."
                error={errors.profissao}
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
              />
              
              <FormField
                label="Idiomas (separados por vírgula)"
                value={formData.idiomas}
                onChange={handleChange('idiomas')}
                placeholder="Português, Inglês, Espanhol"
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
            
            <div className="space-y-4">
              <FormField
                label="Principais Habilidades (separadas por vírgula)"
                value={formData.principaisHabilidades}
                onChange={handleChange('principaisHabilidades')}
                placeholder="JavaScript, React, Node.js, Python, Figma"
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
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              className="w-full sm:w-auto px-12 py-3"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Freelancer'}
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

export default CadastroFreelancer;