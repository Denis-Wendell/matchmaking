// pages/Cadastro_vaga.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importando os componentes que você criou
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card from '../components/Card';

function CadastroVaga() {
  const navigate = useNavigate();
  
  // ===== ESTADOS DO FORMULÁRIO =====
  // Estado para armazenar todos os dados do formulário
  const [formData, setFormData] = useState({
    // --- Informações Básicas ---
    titulo: '',                     // titulo (obrigatório)
    area_atuacao: '',              // area_atuacao (obrigatório)
    nivel_experiencia: '',         // nivel_experiencia (obrigatório)
    tipo_contrato: '',             // tipo_contrato (obrigatório)
    modalidade_trabalho: '',       // modalidade_trabalho (obrigatório)
    localizacao_texto: '',         // localizacao_texto (obrigatório)
    quantidade_vagas: '1',         // quantidade_vagas (opcional, padrão 1)
    
    // --- Remuneração e Benefícios ---
    salario_minimo: '',            // salario_minimo (opcional)
    salario_maximo: '',            // salario_maximo (opcional)
    moeda: 'BRL',                  // moeda (padrão BRL)
    beneficios_oferecidos: '',     // beneficios_oferecidos (opcional)
    
    // --- Descrição da Vaga ---
    descricao_geral: '',           // descricao_geral (obrigatório)
    principais_responsabilidades: '', // principais_responsabilidades (obrigatório)
    
    // --- Requisitos ---
    requisitos_obrigatorios: '',   // requisitos_obrigatorios (obrigatório)
    requisitos_desejados: '',      // requisitos_desejados (opcional)
    habilidades_tecnicas: '',      // habilidades_tecnicas (obrigatório)
    habilidades_comportamentais: '', // habilidades_comportamentais (opcional)
    formacao_minima: '',           // formacao_minima (opcional)
    experiencia_minima: '',        // experiencia_minima (opcional)
    idiomas_necessarios: '',       // idiomas_necessarios (opcional)
    certificacoes_desejadas: '',   // certificacoes_desejadas (opcional)
    
    // --- Informações Adicionais ---
    horario_trabalho: '',          // horario_trabalho (opcional)
    data_inicio_desejada: '',      // data_inicio_desejada (opcional)
    data_limite_inscricoes: '',    // data_limite_inscricoes (opcional)
    processo_seletivo: '',         // processo_seletivo (opcional)
    palavras_chave: '',            // palavras_chave (opcional)
    
    // --- Informações de Contato ---
    contato_nome: '',              // contato_nome (obrigatório)
    contato_email: '',             // contato_email (obrigatório)
    contato_telefone: '',          // contato_telefone (opcional)
    observacoes: '',               // observacoes (opcional)
    
    // --- Skills como arrays ---
    skills_obrigatorias_text: '',  // Para input de texto
    skills_desejaveis_text: '',    // Para input de texto
    areas_relacionadas_text: ''    // Para input de texto
  });

  // Estados de controle
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [empresaData, setEmpresaData] = useState(null);

  // ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
  useEffect(() => {
    // Verificar se usuário está logado e é uma empresa
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    const empresaDataStored = localStorage.getItem('empresaData');

    if (!isLoggedIn || userType !== 'empresa') {
      alert('Acesso restrito a empresas. Faça login como empresa.');
      navigate('/login');
      return;
    }

    if (empresaDataStored) {
      try {
        const parsedData = JSON.parse(empresaDataStored);
        setEmpresaData(parsedData);
        
        // Pré-preencher dados da empresa
        setFormData(prev => ({
          ...prev,
          contato_nome: parsedData.responsavel_nome || '',
          contato_email: parsedData.email_corporativo || ''
        }));
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // ===== FUNÇÃO PARA ATUALIZAR DADOS =====
  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Limpar erro se existir
    if (errors[field]) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: ''
      }));
    }
  };

  // ===== FUNÇÃO DE VALIDAÇÃO =====
  const validateForm = () => {
    const newErrors = {};

    // Campos obrigatórios do backend
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título da vaga é obrigatório';
    }
    
    if (!formData.area_atuacao) {
      newErrors.area_atuacao = 'Área de atuação é obrigatória';
    }
    
    if (!formData.nivel_experiencia) {
      newErrors.nivel_experiencia = 'Nível de experiência é obrigatório';
    }
    
    if (!formData.tipo_contrato) {
      newErrors.tipo_contrato = 'Tipo de contrato é obrigatório';
    }
    
    if (!formData.modalidade_trabalho) {
      newErrors.modalidade_trabalho = 'Modalidade de trabalho é obrigatória';
    }
    
    if (!formData.localizacao_texto.trim()) {
      newErrors.localizacao_texto = 'Localização é obrigatória';
    }
    
    if (!formData.descricao_geral.trim()) {
      newErrors.descricao_geral = 'Descrição geral da vaga é obrigatória';
    } else if (formData.descricao_geral.trim().length < 20) {
      newErrors.descricao_geral = 'Descrição deve ter pelo menos 20 caracteres';
    }
    
    if (!formData.principais_responsabilidades.trim()) {
      newErrors.principais_responsabilidades = 'Principais responsabilidades são obrigatórias';
    }
    
    if (!formData.requisitos_obrigatorios.trim()) {
      newErrors.requisitos_obrigatorios = 'Requisitos obrigatórios são necessários';
    }
    
    if (!formData.habilidades_tecnicas.trim()) {
      newErrors.habilidades_tecnicas = 'Habilidades técnicas são obrigatórias';
    }
    
    if (!formData.contato_nome.trim()) {
      newErrors.contato_nome = 'Nome do contato é obrigatório';
    }
    
    if (!formData.contato_email.trim()) {
      newErrors.contato_email = 'Email de contato é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.contato_email)) {
      newErrors.contato_email = 'Email inválido';
    }

    if (!formData.skills_obrigatorias_text.trim()) {
      newErrors.skills_obrigatorias_text = 'Skills obrigatórias são necessárias';
    }

    return newErrors;
  };

  // ===== FUNÇÃO PARA PROCESSAR SKILLS EM ARRAYS =====
  const processSkillsToArray = (skillsText) => {
    if (!skillsText.trim()) return [];
    return skillsText.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  };

  // ===== FUNÇÃO PARA ENVIAR FORMULÁRIO =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Scroll para o primeiro erro
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados para a API
      const dadosVaga = {
        titulo: formData.titulo.trim(),
        area_atuacao: formData.area_atuacao,
        nivel_experiencia: formData.nivel_experiencia,
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
        requisitos_obrigatorios: formData.requisitos_obrigatorios.trim(),
        requisitos_desejados: formData.requisitos_desejados.trim() || null,
        habilidades_tecnicas: formData.habilidades_tecnicas.trim(),
        habilidades_comportamentais: formData.habilidades_comportamentais.trim() || null,
        formacao_minima: formData.formacao_minima || null,
        experiencia_minima: formData.experiencia_minima.trim() || null,
        idiomas_necessarios: formData.idiomas_necessarios.trim() || null,
        certificacoes_desejadas: formData.certificacoes_desejadas.trim() || null,
        horario_trabalho: formData.horario_trabalho.trim() || null,
        data_inicio_desejada: formData.data_inicio_desejada || null,
        data_limite_inscricoes: formData.data_limite_inscricoes || null,
        processo_seletivo: formData.processo_seletivo.trim() || null,
        palavras_chave: formData.palavras_chave.trim() || null,
        contato_nome: formData.contato_nome.trim(),
        contato_email: formData.contato_email.trim(),
        contato_telefone: formData.contato_telefone.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        skills_obrigatorias: processSkillsToArray(formData.skills_obrigatorias_text),
        skills_desejaveis: processSkillsToArray(formData.skills_desejaveis_text),
        areas_relacionadas: processSkillsToArray(formData.areas_relacionadas_text)
      };

      console.log('📋 Enviando dados para API:', dadosVaga);

      // Fazer chamada para a API
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3001/api/vagas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosVaga)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('✅ Vaga criada com sucesso!');
        
        // Redirecionar para minhas vagas ou limpar formulário
        const resetForm = window.confirm('Deseja criar uma nova vaga ou ver suas vagas publicadas?\n\nOK = Nova vaga\nCancelar = Ver vagas publicadas');
        
        if (resetForm) {
          // Limpar formulário
          setFormData({
            titulo: '', area_atuacao: '', nivel_experiencia: '', tipo_contrato: '',
            modalidade_trabalho: '', localizacao_texto: '', quantidade_vagas: '1',
            salario_minimo: '', salario_maximo: '', moeda: 'BRL', beneficios_oferecidos: '',
            descricao_geral: '', principais_responsabilidades: '', requisitos_obrigatorios: '',
            requisitos_desejados: '', habilidades_tecnicas: '', habilidades_comportamentais: '',
            formacao_minima: '', experiencia_minima: '', idiomas_necessarios: '', certificacoes_desejadas: '',
            horario_trabalho: '', data_inicio_desejada: '', data_limite_inscricoes: '',
            processo_seletivo: '', palavras_chave: '',
            contato_nome: empresaData?.responsavel_nome || '',
            contato_email: empresaData?.email_corporativo || '',
            contato_telefone: '', observacoes: '',
            skills_obrigatorias_text: '', skills_desejaveis_text: '', areas_relacionadas_text: ''
          });
          setErrors({});
        } else {
          // Redirecionar para minhas vagas (você precisa criar esta rota)
          navigate('/minhas-vagas');
        }
        
      } else {
        // Erro da API
        console.error('❌ Erro da API:', result);
        
        if (result.errors && Array.isArray(result.errors)) {
          alert(`❌ Erro ao criar vaga:\n\n${result.errors.join('\n')}`);
        } else {
          alert(`❌ Erro ao criar vaga: ${result.message || 'Erro desconhecido'}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      alert('❌ Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ===== DADOS PARA SELECTS (alinhados com os ENUMs do banco) =====
  const areasAtuacao = [
    { value: 'Tecnologia', label: 'Tecnologia' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Vendas', label: 'Vendas' },
    { value: 'Financeiro', label: 'Financeiro' },
    { value: 'Recursos Humanos', label: 'Recursos Humanos' },
    { value: 'Operações', label: 'Operações' },
    { value: 'Consultoria', label: 'Consultoria' },
    { value: 'Educação', label: 'Educação' },
    { value: 'Saúde', label: 'Saúde' },
    { value: 'Jurídico', label: 'Jurídico' },
    { value: 'Construção Civil', label: 'Construção Civil' },
    { value: 'Fotografia', label: 'Fotografia' },
    { value: 'Outros', label: 'Outros' }
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

  // Se não há dados da empresa, mostrar loading
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

  // ===== RENDERIZAÇÃO DO COMPONENTE =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4">
        {/* HEADER DO FORMULÁRIO */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastrar Nova Vaga
          </h1>
          <p className="text-gray-600">
            Publique sua vaga e encontre os melhores candidatos
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Logado como: {empresaData.nome}
          </p>
        </div>

        {/* FORMULÁRIO PRINCIPAL */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ===== SEÇÃO 1: INFORMAÇÕES BÁSICAS ===== */}
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

          {/* ===== SEÇÃO 2: REMUNERAÇÃO E BENEFÍCIOS ===== */}
          <Card title="Remuneração e Benefícios" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <FormField
                label="Salário Mínimo"
                type="number"
                value={formData.salario_minimo}
                onChange={handleChange('salario_minimo')}
                placeholder="3000"
                min="0"
                step="0.01"
              />
              
              <FormField
                label="Salário Máximo"
                type="number"
                value={formData.salario_maximo}
                onChange={handleChange('salario_maximo')}
                placeholder="8000"
                min="0"
                step="0.01"
              />
              
              <FormField
                label="Moeda"
                type="select"
                value={formData.moeda}
                onChange={handleChange('moeda')}
                options={moedas}
              />
              
              <div className="hidden xl:block"></div>
            </div>
            
            <FormField
              label="Benefícios Oferecidos"
              value={formData.beneficios_oferecidos}
              onChange={handleChange('beneficios_oferecidos')}
              placeholder="Vale alimentação, plano de saúde, home office, flexibilidade de horário..."
            />
          </Card>

          {/* ===== SEÇÃO 3: DESCRIÇÃO DA VAGA ===== */}
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

          {/* ===== SEÇÃO 4: REQUISITOS ===== */}
          <Card title="Requisitos" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Requisitos Obrigatórios"
                type="textarea"
                value={formData.requisitos_obrigatorios}
                onChange={handleChange('requisitos_obrigatorios')}
                placeholder="Formação, experiências mínimas, conhecimentos essenciais..."
                rows={3}
                error={errors.requisitos_obrigatorios}
                required
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
                label="Habilidades Técnicas"
                type="textarea"
                value={formData.habilidades_tecnicas}
                onChange={handleChange('habilidades_tecnicas')}
                placeholder="JavaScript, React, Node.js, Python, SQL..."
                rows={3}
                error={errors.habilidades_tecnicas}
                required
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
              <FormField
                label="Formação Mínima"
                type="select"
                value={formData.formacao_minima}
                onChange={handleChange('formacao_minima')}
                options={formacoesMinimas}
                placeholder="Selecione"
              />
              
              <FormField
                label="Experiência Mínima"
                value={formData.experiencia_minima}
                onChange={handleChange('experiencia_minima')}
                placeholder="2 anos em desenvolvimento web"
              />
              
              <FormField
                label="Idiomas Necessários"
                value={formData.idiomas_necessarios}
                onChange={handleChange('idiomas_necessarios')}
                placeholder="Inglês intermediário, Espanhol básico..."
              />
              
              <FormField
                label="Certificações Desejadas"
                value={formData.certificacoes_desejadas}
                onChange={handleChange('certificacoes_desejadas')}
                placeholder="AWS, Google Cloud, PMP..."
              />
            </div>
          </Card>

          {/* ===== SEÇÃO 5: SKILLS ===== */}
          <Card title="Skills e Competências" className="fade-in">
            <FormField
              label="Skills Obrigatórias (separadas por vírgula)"
              value={formData.skills_obrigatorias_text}
              onChange={handleChange('skills_obrigatorias_text')}
              placeholder="JavaScript, React, Node.js, PostgreSQL, Git"
              error={errors.skills_obrigatorias_text}
              required
            />
            
            <FormField
              label="Skills Desejáveis (separadas por vírgula)"
              value={formData.skills_desejaveis_text}
              onChange={handleChange('skills_desejaveis_text')}
              placeholder="TypeScript, Docker, AWS, MongoDB"
            />
            
            <FormField
              label="Áreas Relacionadas (separadas por vírgula)"
              value={formData.areas_relacionadas_text}
              onChange={handleChange('areas_relacionadas_text')}
              placeholder="Frontend, Backend, DevOps, Mobile"
            />
          </Card>

          {/* ===== SEÇÃO 6: INFORMAÇÕES ADICIONAIS ===== */}
          <Card title="Informações Adicionais" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                label="Horário de Trabalho"
                value={formData.horario_trabalho}
                onChange={handleChange('horario_trabalho')}
                placeholder="Segunda a sexta, 8h às 18h"
              />
              
              <FormField
                label="Data de Início Desejada"
                type="date"
                value={formData.data_inicio_desejada}
                onChange={handleChange('data_inicio_desejada')}
              />
              
              <FormField
                label="Data Limite para Inscrições"
                type="date"
                value={formData.data_limite_inscricoes}
                onChange={handleChange('data_limite_inscricoes')}
              />
            </div>
            
            <div className="space-y-4">
              <FormField
                label="Processo Seletivo"
                type="textarea"
                value={formData.processo_seletivo}
                onChange={handleChange('processo_seletivo')}
                placeholder="Análise de currículo, teste técnico, entrevistas..."
                rows={2}
              />
              
              <FormField
                label="Palavras-chave para Busca (separadas por vírgula)"
                value={formData.palavras_chave}
                onChange={handleChange('palavras_chave')}
                placeholder="desenvolvedor, react, javascript, frontend, manaus"
              />
            </div>
          </Card>

          <Card title="Informações de Contato" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormField
                label="Nome do Contato"
                value={formData.contato_nome}
                onChange={handleChange('contato_nome')}
                placeholder="Nome da pessoa responsável"
                error={errors.contato_nome}
                required
              />
              
              <FormField
                label="E-mail de Contato"
                type="email"
                value={formData.contato_email}
                onChange={handleChange('contato_email')}
                placeholder="recrutador@empresa.com"
                error={errors.contato_email}
                required
              />
              
              <FormField
                label="Telefone de Contato"
                value={formData.contato_telefone}
                onChange={handleChange('contato_telefone')}
                placeholder="(92) 99999-9999"
              />
            </div>
            
            <FormField
              label="Observações Adicionais"
              type="textarea"
              value={formData.observacoes}
              onChange={handleChange('observacoes')}
              placeholder="Informações extras sobre a vaga ou processo seletivo..."
              rows={3}
            />
          </Card>

          {/* ===== BOTÕES DE AÇÃO ===== */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              className="w-full sm:w-auto px-12 py-3"
              disabled={loading}
            >
              {loading ? 'Criando Vaga...' : 'Publicar Vaga'}
            </Button>
            
            <Button
              variant="secondary"
              type="button"
              className="w-full sm:w-auto px-12 py-3"
              disabled={loading}
              onClick={() => navigate('/perfil-empresa')}
            >
              Voltar ao Perfil
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroVaga;