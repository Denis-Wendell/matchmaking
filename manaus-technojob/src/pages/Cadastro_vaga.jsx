// pages/Cadastro_vaga.jsx
import { useState } from 'react';
// Importando os componentes que você criou
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card from '../components/Card';

function CadastroVaga() {
  // ===== ESTADOS DO FORMULÁRIO =====
  // Estado para armazenar todos os dados do formulário
  const [formData, setFormData] = useState({
    // --- Informações Básicas ---
    tituloVaga: '',             // Campo obrigatório
    nomeEmpresa: '',            // Campo obrigatório
    areaAtuacao: '',            // Campo obrigatório (select)
    nivelExperiencia: '',       // Campo obrigatório (select)
    tipoContrato: '',           // Campo obrigatório (select)
    modalidadeTrabalho: '',     // Campo obrigatório (select)
    localizacao: '',            // Campo obrigatório
    quantidadeVagas: '',        // Campo opcional
    
    // --- Remuneração e Benefícios ---
    salarioMinimo: '',          // Campo opcional
    salarioMaximo: '',          // Campo opcional
    moeda: 'BRL',               // Campo padrão
    beneficiosOferecidos: '',   // Campo opcional
    
    // --- Descrição da Vaga ---
    descricaoGeral: '',         // Campo obrigatório (textarea com limite)
    principaisResponsabilidades: '', // Campo obrigatório (textarea com limite)
    
    // --- Requisitos ---
    requisitosObrigatorios: '', // Campo obrigatório
    requisitosDesejados: '',    // Campo opcional
    habilidadesTecnicas: '',    // Campo obrigatório
    habilidadesComportamentais: '', // Campo opcional
    formacaoMinima: '',         // Campo opcional (select)
    experienciaMinima: '',      // Campo opcional
    idiomas: '',                // Campo opcional
    certificacoesDesejadas: '', // Campo opcional
    
    // --- Informações Adicionais ---
    horarioTrabalho: '',        // Campo opcional
    dataInicioDesejada: '',     // Campo opcional (date)
    dataLimiteInscricoes: '',   // Campo opcional (date)
    processoSeletivo: '',       // Campo opcional
    palavrasChave: '',          // Campo opcional
    
    // --- Informações de Contato ---
    nomeRecrutador: '',         // Campo obrigatório
    emailContato: '',           // Campo obrigatório
    telefoneContato: '',        // Campo opcional
    observacoes: ''             // Campo opcional (textarea com limite)
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
    if (!formData.tituloVaga.trim()) {
      newErrors.tituloVaga = 'Título da vaga é obrigatório';
    }
    
    if (!formData.nomeEmpresa.trim()) {
      newErrors.nomeEmpresa = 'Nome da empresa é obrigatório';
    }
    
    if (!formData.areaAtuacao) {
      newErrors.areaAtuacao = 'Área de atuação é obrigatória';
    }
    
    if (!formData.nivelExperiencia) {
      newErrors.nivelExperiencia = 'Nível de experiência é obrigatório';
    }
    
    if (!formData.tipoContrato) {
      newErrors.tipoContrato = 'Tipo de contrato é obrigatório';
    }
    
    if (!formData.modalidadeTrabalho) {
      newErrors.modalidadeTrabalho = 'Modalidade de trabalho é obrigatória';
    }
    
    if (!formData.localizacao.trim()) {
      newErrors.localizacao = 'Localização é obrigatória';
    }
    
    // Validação de descrição
    if (!formData.descricaoGeral.trim()) {
      newErrors.descricaoGeral = 'Descrição geral da vaga é obrigatória';
    }
    
    if (!formData.principaisResponsabilidades.trim()) {
      newErrors.principaisResponsabilidades = 'Principais responsabilidades são obrigatórias';
    }
    
    // Validação de requisitos
    if (!formData.requisitosObrigatorios.trim()) {
      newErrors.requisitosObrigatorios = 'Requisitos obrigatórios são necessários';
    }
    
    if (!formData.habilidadesTecnicas.trim()) {
      newErrors.habilidadesTecnicas = 'Habilidades técnicas são obrigatórias';
    }
    
    // Validação de contato
    if (!formData.nomeRecrutador.trim()) {
      newErrors.nomeRecrutador = 'Nome do recrutador é obrigatório';
    }
    
    if (!formData.emailContato.trim()) {
      newErrors.emailContato = 'Email de contato é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailContato)) {
      newErrors.emailContato = 'Email inválido';
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
      console.log('💼 Dados da vaga:', formData);
      
      // Simula chamada API (remover depois)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sucesso
      alert('✅ Vaga publicada com sucesso!');
      
      // Limpa formulário após sucesso
      setFormData({
        tituloVaga: '', nomeEmpresa: '', areaAtuacao: '', nivelExperiencia: '',
        tipoContrato: '', modalidadeTrabalho: '', localizacao: '', quantidadeVagas: '',
        salarioMinimo: '', salarioMaximo: '', moeda: 'BRL', beneficiosOferecidos: '',
        descricaoGeral: '', principaisResponsabilidades: '', requisitosObrigatorios: '',
        requisitosDesejados: '', habilidadesTecnicas: '', habilidadesComportamentais: '',
        formacaoMinima: '', experienciaMinima: '', idiomas: '', certificacoesDesejadas: '',
        horarioTrabalho: '', dataInicioDesejada: '', dataLimiteInscricoes: '',
        processoSeletivo: '', palavrasChave: '', nomeRecrutador: '', emailContato: '',
        telefoneContato: '', observacoes: ''
      });
      
    } catch (error) {
      console.error('❌ Erro ao publicar vaga:', error);
      alert('❌ Erro ao publicar vaga. Tente novamente.');
    } finally {
      // Para loading
      setLoading(false);
    }
  };

  // ===== DADOS PARA SELECTS =====
  // Opções para área de atuação
  const areasAtuacao = [
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'recursos-humanos', label: 'Recursos Humanos' },
    { value: 'operacoes', label: 'Operações' },
    { value: 'consultoria', label: 'Consultoria' },
    { value: 'educacao', label: 'Educação' },
    { value: 'saude', label: 'Saúde' },
    { value: 'juridico', label: 'Jurídico' },
    { value: 'outros', label: 'Outros' }
  ];

  // Opções para nível de experiência
  const niveisExperiencia = [
    { value: 'estagio', label: 'Estágio' },
    { value: 'junior', label: 'Júnior' },
    { value: 'pleno', label: 'Pleno' },
    { value: 'senior', label: 'Sênior' },
    { value: 'especialista', label: 'Especialista' },
    { value: 'coordenador', label: 'Coordenador' },
    { value: 'gerente', label: 'Gerente' },
    { value: 'diretor', label: 'Diretor' }
  ];

  // Opções para tipo de contrato
  const tiposContrato = [
    { value: 'clt', label: 'CLT' },
    { value: 'pj', label: 'PJ' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'temporario', label: 'Temporário' },
    { value: 'estagio', label: 'Estágio' },
    { value: 'terceirizado', label: 'Terceirizado' }
  ];

  // Opções para modalidade de trabalho
  const modalidadesTrabalho = [
    { value: 'remoto', label: 'Remoto' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'hibrido', label: 'Híbrido' }
  ];

  // Opções para formação mínima
  const formacoesMinimas = [
    { value: 'fundamental', label: 'Ensino Fundamental' },
    { value: 'medio', label: 'Ensino Médio' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'superior', label: 'Superior' },
    { value: 'pos-graduacao', label: 'Pós-graduação' },
    { value: 'mestrado', label: 'Mestrado' },
    { value: 'doutorado', label: 'Doutorado' }
  ];

  // Opções para moeda
  const moedas = [
    { value: 'BRL', label: 'Real (R$)' },
    { value: 'USD', label: 'Dólar (US$)' },
    { value: 'EUR', label: 'Euro (€)' }
  ];

  // ===== RENDERIZAÇÃO DO COMPONENTE =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* CONTAINER COM LARGURA RESPONSIVA PARA TELAS GRANDES */}
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4">
        {/* HEADER DO FORMULÁRIO */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastrar Nova Vaga
          </h1>
          <p className="text-gray-600">
            Publique sua vaga e encontre os melhores candidatos
          </p>
        </div>

        {/* FORMULÁRIO PRINCIPAL */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ===== SEÇÃO 1: INFORMAÇÕES BÁSICAS ===== */}
          <Card title="Informações Básicas" className="fade-in">
            {/* Título da Vaga - largura total */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <FormField
                label="Título da Vaga"
                value={formData.tituloVaga}
                onChange={handleChange('tituloVaga')}
                placeholder="Ex: Desenvolvedor React Sênior"
                error={errors.tituloVaga}
                required
              />
            </div>
            
            {/* Grid responsivo: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Nome da Empresa */}
              <FormField
                label="Nome da Empresa"
                value={formData.nomeEmpresa}
                onChange={handleChange('nomeEmpresa')}
                placeholder="Nome da sua empresa"
                error={errors.nomeEmpresa}
                required
              />
              
              {/* Área de Atuação */}
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
              
              {/* Nível de Experiência */}
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
              
              {/* Tipo de Contrato */}
              <FormField
                label="Tipo de Contrato"
                type="select"
                value={formData.tipoContrato}
                onChange={handleChange('tipoContrato')}
                options={tiposContrato}
                placeholder="Selecione"
                error={errors.tipoContrato}
                required
              />
              
              {/* Modalidade de Trabalho */}
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
              
              {/* Localização */}
              <FormField
                label="Localização"
                value={formData.localizacao}
                onChange={handleChange('localizacao')}
                placeholder="Ex: Manaus - AM, São Paulo - SP, Remoto"
                error={errors.localizacao}
                required
              />
            </div>
            
            {/* Quantidade de Vagas - separado */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <FormField
                label="Quantidade de Vagas"
                type="number"
                value={formData.quantidadeVagas}
                onChange={handleChange('quantidadeVagas')}
                placeholder="1"
                min="1"
              />
              <div className="hidden xl:block"></div>
              <div className="hidden xl:block"></div>
            </div>
          </Card>

          {/* ===== SEÇÃO 2: REMUNERAÇÃO E BENEFÍCIOS ===== */}
          <Card title="Remuneração e Benefícios" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Salário Mínimo */}
              <FormField
                label="Salário Mínimo"
                type="number"
                value={formData.salarioMinimo}
                onChange={handleChange('salarioMinimo')}
                placeholder="3000"
                min="0"
              />
              
              {/* Salário Máximo */}
              <FormField
                label="Salário Máximo"
                type="number"
                value={formData.salarioMaximo}
                onChange={handleChange('salarioMaximo')}
                placeholder="8000"
                min="0"
              />
              
              {/* Moeda */}
              <FormField
                label="Moeda"
                type="select"
                value={formData.moeda}
                onChange={handleChange('moeda')}
                options={moedas}
              />
              
              <div className="hidden xl:block"></div>
            </div>
            
            {/* Benefícios - largura total */}
            <FormField
              label="Benefícios Oferecidos"
              value={formData.beneficiosOferecidos}
              onChange={handleChange('beneficiosOferecidos')}
              placeholder="Vale alimentação, plano de saúde, home office, flexibilidade de horário..."
            />
          </Card>

          {/* ===== SEÇÃO 3: DESCRIÇÃO DA VAGA ===== */}
          <Card title="Descrição da Vaga" className="fade-in">
            {/* Descrição Geral */}
            <FormField
              label="Descrição Geral da Vaga (máx. 500 caracteres)"
              type="textarea"
              value={formData.descricaoGeral}
              onChange={handleChange('descricaoGeral')}
              placeholder="Descreva o que a pessoa fará, ambiente de trabalho, cultura da empresa..."
              rows={4}
              maxLength={500}
              error={errors.descricaoGeral}
              required
            />
            {/* Contador de caracteres */}
            <div className="text-right text-sm text-gray-500 -mt-2">
              {formData.descricaoGeral.length}/500
            </div>
            
            {/* Principais Responsabilidades */}
            <FormField
              label="Principais Responsabilidades (máx. 500 caracteres)"
              type="textarea"
              value={formData.principaisResponsabilidades}
              onChange={handleChange('principaisResponsabilidades')}
              placeholder="Liste as principais atividades que o profissional irá desenvolver..."
              rows={4}
              maxLength={500}
              error={errors.principaisResponsabilidades}
              required
            />
            {/* Contador de caracteres */}
            <div className="text-right text-sm text-gray-500 -mt-2">
              {formData.principaisResponsabilidades.length}/500
            </div>
          </Card>

          {/* ===== SEÇÃO 4: REQUISITOS ===== */}
          <Card title="Requisitos" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Requisitos Obrigatórios */}
              <FormField
                label="Requisitos Obrigatórios"
                value={formData.requisitosObrigatorios}
                onChange={handleChange('requisitosObrigatorios')}
                placeholder="Formação, experiências mínimas, conhecimentos essenciais..."
                error={errors.requisitosObrigatorios}
                required
              />
              
              {/* Requisitos Desejados */}
              <FormField
                label="Requisitos Desejados"
                value={formData.requisitosDesejados}
                onChange={handleChange('requisitosDesejados')}
                placeholder="Conhecimentos extras que seriam um diferencial..."
              />
              
              {/* Habilidades Técnicas */}
              <FormField
                label="Habilidades Técnicas"
                value={formData.habilidadesTecnicas}
                onChange={handleChange('habilidadesTecnicas')}
                placeholder="JavaScript, React, Node.js, Python, SQL..."
                error={errors.habilidadesTecnicas}
                required
              />
              
              {/* Habilidades Comportamentais */}
              <FormField
                label="Habilidades Comportamentais"
                value={formData.habilidadesComportamentais}
                onChange={handleChange('habilidadesComportamentais')}
                placeholder="Comunicação, trabalho em equipe, proatividade..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Formação Mínima */}
              <FormField
                label="Formação Mínima"
                type="select"
                value={formData.formacaoMinima}
                onChange={handleChange('formacaoMinima')}
                options={formacoesMinimas}
                placeholder="Selecione"
              />
              
              {/* Experiência Mínima */}
              <FormField
                label="Experiência Mínima"
                value={formData.experienciaMinima}
                onChange={handleChange('experienciaMinima')}
                placeholder="2 anos em desenvolvimento web"
              />
              
              {/* Idiomas */}
              <FormField
                label="Idiomas"
                value={formData.idiomas}
                onChange={handleChange('idiomas')}
                placeholder="Inglês intermediário, Espanhol básico..."
              />
              
              {/* Certificações Desejadas */}
              <FormField
                label="Certificações Desejadas"
                value={formData.certificacoesDesejadas}
                onChange={handleChange('certificacoesDesejadas')}
                placeholder="AWS, Google Cloud, PMP..."
              />
            </div>
          </Card>

          {/* ===== SEÇÃO 5: INFORMAÇÕES ADICIONAIS ===== */}
          <Card title="Informações Adicionais" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Horário de Trabalho */}
              <FormField
                label="Horário de Trabalho"
                value={formData.horarioTrabalho}
                onChange={handleChange('horarioTrabalho')}
                placeholder="Segunda a sexta, 8h às 18h"
              />
              
              {/* Data de Início Desejada */}
              <FormField
                label="Data de Início Desejada"
                type="date"
                value={formData.dataInicioDesejada}
                onChange={handleChange('dataInicioDesejada')}
              />
              
              {/* Data Limite para Inscrições */}
              <FormField
                label="Data Limite para Inscrições"
                type="date"
                value={formData.dataLimiteInscricoes}
                onChange={handleChange('dataLimiteInscricoes')}
              />
            </div>
            
            <div className="space-y-4">
              {/* Processo Seletivo */}
              <FormField
                label="Processo Seletivo"
                value={formData.processoSeletivo}
                onChange={handleChange('processoSeletivo')}
                placeholder="Análise de currículo, teste técnico, entrevistas..."
              />
              
              {/* Palavras-chave para Busca */}
              <FormField
                label="Palavras-chave para Busca"
                value={formData.palavrasChave}
                onChange={handleChange('palavrasChave')}
                placeholder="desenvolvedor, react, javascript, frontend, manaus"
              />
            </div>
          </Card>

          {/* ===== SEÇÃO 6: INFORMAÇÕES DE CONTATO ===== */}
          <Card title="Informações de Contato" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Nome do Recrutador */}
              <FormField
                label="Nome do Recrutador"
                value={formData.nomeRecrutador}
                onChange={handleChange('nomeRecrutador')}
                placeholder="Nome da pessoa responsável"
                error={errors.nomeRecrutador}
                required
              />
              
              {/* Email de Contato */}
              <FormField
                label="E-mail de Contato"
                type="email"
                value={formData.emailContato}
                onChange={handleChange('emailContato')}
                placeholder="recrutador@empresa.com"
                error={errors.emailContato}
                required
              />
              
              {/* Telefone de Contato */}
              <FormField
                label="Telefone de Contato"
                value={formData.telefoneContato}
                onChange={handleChange('telefoneContato')}
                placeholder="(92) 99999-9999"
              />
            </div>
            
            {/* Observações */}
            <FormField
              label="Observações (máx. 500 caracteres)"
              type="textarea"
              value={formData.observacoes}
              onChange={handleChange('observacoes')}
              placeholder="Informações extras sobre a vaga ou processo seletivo..."
              rows={3}
              maxLength={500}
            />
            {/* Contador de caracteres */}
            <div className="text-right text-sm text-gray-500 -mt-2">
              {formData.observacoes.length}/500
            </div>
          </Card>

          {/* ===== BOTÕES DE AÇÃO ===== */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {/* Botão Principal de Publicação */}
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              className="w-full sm:w-auto px-12 py-3"
            >
              {loading ? 'Publicando...' : 'Publicar Vaga'}
            </Button>
            
            {/* Botão Secundário */}
            <Button
              variant="secondary"
              type="button"
              className="w-full sm:w-auto px-12 py-3"
              onClick={() => {
                // Aqui redirecionaria para ver vagas publicadas
                console.log('Redirecionando para vagas publicadas...');
              }}
            >
              Ver Vagas Publicadas
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroVaga;