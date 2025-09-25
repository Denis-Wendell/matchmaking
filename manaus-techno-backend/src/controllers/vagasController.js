//vagasController.js

const Vaga = require('../models/Vaga');
const Empresa = require('../models/Empresa');

// Funções auxiliares para normalizar valores dos ENUMs
const normalizarNivelExperiencia = (nivel) => {
  if (!nivel) return null;
  const nivelLower = nivel.toLowerCase().trim();
  
  const mapeamento = {
    'junior': 'junior',
    'júnior': 'junior',
    'jr': 'junior',
    'pleno': 'pleno',
    'senior': 'senior',
    'sênior': 'senior',
    'sr': 'senior',
    'especialista': 'especialista',
    'expert': 'especialista'
  };
  
  return mapeamento[nivelLower] || 'junior';
};

const normalizarTipoContrato = (tipo) => {
  if (!tipo) return null;
  const tipoLower = tipo.toLowerCase().trim();
  
  const mapeamento = {
    'clt': 'clt',
    'pj': 'pj',
    'pessoa juridica': 'pj',
    'estagio': 'estagio',
    'estágio': 'estagio',
    'freelancer': 'freelancer',
    'free': 'freelancer',
    'temporario': 'temporario',
    'temporário': 'temporario',
    'temp': 'temporario'
  };
  
  return mapeamento[tipoLower] || 'pj';
};

const normalizarModalidadeTrabalho = (modalidade) => {
  if (!modalidade) return null;
  const modalidadeLower = modalidade.toLowerCase().trim();
  
  const mapeamento = {
    'presencial': 'presencial',
    'local': 'presencial',
    'remoto': 'remoto',
    'remote': 'remoto',
    'hibrido': 'hibrido',
    'híbrido': 'hibrido',
    'hybrid': 'hibrido',
    'misto': 'hibrido'
  };
  
  return mapeamento[modalidadeLower] || 'remoto';
};

const sanitizarArray = (valor) => {
  if (Array.isArray(valor)) return valor.filter(Boolean);
  if (valor && typeof valor === 'string') return valor.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

// Criar nova vaga (apenas empresas)
const criarVaga = async (req, res) => {
  try {
    console.log('📝 Dados recebidos para nova vaga:', req.body);
    console.log('🏢 Empresa logada:', req.empresa?.nome);
    console.log('🆔 ID da empresa:', req.empresa?.id);
    
    // Verificar se req.empresa existe
    if (!req.empresa || !req.empresa.id) {
      return res.status(401).json({
        success: false,
        message: 'Empresa não identificada. Faça login novamente.',
      });
    }
    
    const {
      titulo,
      area_atuacao,
      nivel_experiencia,
      tipo_contrato,
      modalidade_trabalho,
      localizacao_texto,
      quantidade_vagas,
      salario_minimo,
      salario_maximo,
      moeda,
      beneficios_oferecidos,
      descricao_geral,
      principais_responsabilidades,
      requisitos_obrigatorios,
      requisitos_desejados,
      habilidades_tecnicas,
      habilidades_comportamentais,
      formacao_minima,
      experiencia_minima,
      idiomas_necessarios,
      certificacoes_desejadas,
      horario_trabalho,
      data_inicio_desejada,
      data_limite_inscricoes,
      processo_seletivo,
      palavras_chave,
      contato_nome,
      contato_email,
      contato_telefone,
      observacoes,
      skills_obrigatorias,
      skills_desejaveis,
      areas_relacionadas,
    } = req.body;

    // Preparar dados normalizados ANTES de salvar
    const dadosVaga = {
      empresa_id: req.empresa.id, // ID da empresa logada
      titulo,
      area_atuacao,
      nivel_experiencia: normalizarNivelExperiencia(nivel_experiencia),
      tipo_contrato: normalizarTipoContrato(tipo_contrato),
      modalidade_trabalho: normalizarModalidadeTrabalho(modalidade_trabalho),
      localizacao_texto,
      quantidade_vagas: quantidade_vagas || 1,
      salario_minimo: salario_minimo ? parseFloat(salario_minimo) : null,
      salario_maximo: salario_maximo ? parseFloat(salario_maximo) : null,
      moeda: moeda || 'BRL',
      beneficios_oferecidos,
      descricao_geral,
      principais_responsabilidades,
      requisitos_obrigatorios,
      requisitos_desejados,
      habilidades_tecnicas,
      habilidades_comportamentais,
      formacao_minima,
      experiencia_minima,
      idiomas_necessarios,
      certificacoes_desejadas,
      horario_trabalho,
      data_inicio_desejada: data_inicio_desejada || null,
      data_limite_inscricoes: data_limite_inscricoes || null,
      processo_seletivo,
      palavras_chave,
      contato_nome,
      contato_email,
      contato_telefone,
      observacoes,
      skills_obrigatorias: sanitizarArray(skills_obrigatorias),
      skills_desejaveis: sanitizarArray(skills_desejaveis),
      areas_relacionadas: sanitizarArray(areas_relacionadas),
      status: 'ativo', // CORREÇÃO: usar 'ativo' em vez de 'ativa'
      visualizacoes: 0,
      candidaturas: 0,
    };

    console.log('📋 Dados normalizados para salvar:', dadosVaga);

    // Criar nova vaga associada à empresa logada
    const novaVaga = await Vaga.create(dadosVaga);

    console.log('✅ Vaga criada com sucesso:', {
      id: novaVaga.id,
      titulo: novaVaga.titulo,
      empresa_id: novaVaga.empresa_id,
      status: novaVaga.status
    });

    // VERIFICAÇÃO ADICIONAL: Buscar a vaga recém-criada no banco
    const vagaVerificacao = await Vaga.findByPk(novaVaga.id);
    console.log('🔍 Verificação no banco - vaga existe?', !!vagaVerificacao);
    
    if (!vagaVerificacao) {
      console.error('❌ PROBLEMA: Vaga não foi encontrada no banco após criação!');
      return res.status(500).json({
        success: false,
        message: 'Erro: Vaga não foi salva no banco de dados',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vaga criada com sucesso',
      data: novaVaga,
    });

  } catch (error) {
    console.error('❌ Erro ao criar vaga:', error);
    console.error('❌ Stack trace:', error.stack);

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors,
      });
    }

    if (error.name === 'SequelizeDatabaseError') {
      console.error('❌ Erro do banco:', error.original);
      return res.status(400).json({
        success: false,
        message: 'Erro nos dados enviados. Verifique os campos e tente novamente.',
        error: error.original?.message || error.message,
      });
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Erro: Empresa não encontrada ou inválida',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Listar todas as vagas ativas (público)
const listarVagas = async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Iniciando listarVagas...');
    console.log('🔍 [DEBUG] Query params:', req.query);
    
    const { area, nivel, modalidade, tipo, limite = 20, pagina = 1 } = req.query;
    
    // CORREÇÃO: Usar 'ativo' em vez de 'ativa'
    const where = { status: 'ativo' };
    console.log('🔍 [DEBUG] Where inicial:', where);
    
    // Filtros opcionais
    if (area) where.area_atuacao = area;
    if (nivel) where.nivel_experiencia = normalizarNivelExperiencia(nivel);
    if (modalidade) where.modalidade_trabalho = normalizarModalidadeTrabalho(modalidade);
    if (tipo) where.tipo_contrato = normalizarTipoContrato(tipo);

    console.log('🔍 [DEBUG] Where final:', where);

    const offset = (pagina - 1) * limite;
    console.log('🔍 [DEBUG] Offset:', offset, 'Limite:', limite);

    console.log('🔍 [DEBUG] Tentando buscar vagas...');
    
    const vagas = await Vaga.findAndCountAll({
      where,
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['nome', 'setor_atuacao', 'tamanho_empresa', 'cidade', 'estado'],
        required: false
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limite),
      offset: parseInt(offset),
    });

    console.log('✅ [DEBUG] Vagas encontradas:', vagas.count);
    console.log('✅ [DEBUG] Primeira vaga (se existir):', vagas.rows[0]?.titulo);

    res.json({
      success: true,
      message: 'Vagas listadas com sucesso',
      data: {
        vagas: vagas.rows,
        total: vagas.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(vagas.count / limite),
      },
    });

  } catch (error) {
    console.error('❌ [ERRO DETALHADO] Nome:', error.name);
    console.error('❌ [ERRO DETALHADO] Mensagem:', error.message);
    console.error('❌ [ERRO DETALHADO] Stack:', error.stack);
    
    // Se for erro do Sequelize, mostrar mais detalhes
    if (error.original) {
      console.error('❌ [ERRO SQL]:', error.original);
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar vaga por ID (público)
const buscarVagaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const vaga = await Vaga.findByPk(id, {
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['nome', 'setor_atuacao', 'tamanho_empresa', 'cidade', 'estado', 'site_empresa', 'descricao_empresa'],
        required: false
      }]
    });

    if (!vaga) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada',
      });
    }

    // Incrementar visualizações
    await vaga.increment('visualizacoes');

    res.json({
      success: true,
      message: 'Vaga encontrada',
      data: vaga,
    });

  } catch (error) {
    console.error('❌ Erro ao buscar vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Listar vagas da empresa logada
const minhasVagas = async (req, res) => {
  try {
    const { status = 'todas', limite = 20, pagina = 1 } = req.query;
    
    // Verificar se req.empresa existe
    if (!req.empresa || !req.empresa.id) {
      return res.status(401).json({
        success: false,
        message: 'Empresa não identificada. Faça login novamente.',
      });
    }
    
    const where = { empresa_id: req.empresa.id };
    
    if (status !== 'todas') {
      where.status = status;
    }

    const offset = (pagina - 1) * limite;

    const vagas = await Vaga.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limite),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      message: 'Suas vagas listadas com sucesso',
      data: {
        vagas: vagas.rows,
        total: vagas.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(vagas.count / limite),
        empresa: req.empresa.nome,
      },
    });

  } catch (error) {
    console.error('❌ Erro ao listar vagas da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Atualizar vaga
const atualizarVaga = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosParaAtualizar = { ...req.body };

    // Verificar se req.empresa existe
    if (!req.empresa || !req.empresa.id) {
      return res.status(401).json({
        success: false,
        message: 'Empresa não identificada. Faça login novamente.',
      });
    }

    // Normalizar ENUMs se presentes
    if (dadosParaAtualizar.nivel_experiencia) {
      dadosParaAtualizar.nivel_experiencia = normalizarNivelExperiencia(dadosParaAtualizar.nivel_experiencia);
    }
    if (dadosParaAtualizar.tipo_contrato) {
      dadosParaAtualizar.tipo_contrato = normalizarTipoContrato(dadosParaAtualizar.tipo_contrato);
    }
    if (dadosParaAtualizar.modalidade_trabalho) {
      dadosParaAtualizar.modalidade_trabalho = normalizarModalidadeTrabalho(dadosParaAtualizar.modalidade_trabalho);
    }

    // Sanitizar arrays se presentes
    if (dadosParaAtualizar.skills_obrigatorias) {
      dadosParaAtualizar.skills_obrigatorias = sanitizarArray(dadosParaAtualizar.skills_obrigatorias);
    }
    if (dadosParaAtualizar.skills_desejaveis) {
      dadosParaAtualizar.skills_desejaveis = sanitizarArray(dadosParaAtualizar.skills_desejaveis);
    }
    if (dadosParaAtualizar.areas_relacionadas) {
      dadosParaAtualizar.areas_relacionadas = sanitizarArray(dadosParaAtualizar.areas_relacionadas);
    }

    // Remover campos que não devem ser atualizados diretamente
    delete dadosParaAtualizar.id;
    delete dadosParaAtualizar.empresa_id;
    delete dadosParaAtualizar.created_at;
    delete dadosParaAtualizar.updated_at;
    delete dadosParaAtualizar.visualizacoes;
    delete dadosParaAtualizar.candidaturas;

    const [numLinhasAfetadas, vagasAtualizadas] = await Vaga.update(
      dadosParaAtualizar,
      {
        where: { 
          id: id,
          empresa_id: req.empresa.id // Só pode atualizar vagas da própria empresa
        },
        returning: true,
      }
    );

    if (numLinhasAfetadas === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada ou você não tem permissão para editá-la',
      });
    }

    const vagaAtualizada = vagasAtualizadas[0];

    console.log('✅ Vaga atualizada:', vagaAtualizada.titulo);

    res.json({
      success: true,
      message: 'Vaga atualizada com sucesso',
      data: vagaAtualizada,
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar vaga:', error);

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Pausar/Ativar vaga
const alterarStatusVaga = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verificar se req.empresa existe
    if (!req.empresa || !req.empresa.id) {
      return res.status(401).json({
        success: false,
        message: 'Empresa não identificada. Faça login novamente.',
      });
    }

    if (!['ativo', 'inativo', 'pausado', 'pendente'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido. Use: ativo, inativo, pausado ou pendente',
      });
    }

    const [numLinhasAfetadas] = await Vaga.update(
      { status },
      {
        where: { 
          id: id,
          empresa_id: req.empresa.id
        }
      }
    );

    if (numLinhasAfetadas === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada ou você não tem permissão para editá-la',
      });
    }

    console.log(`✅ Status da vaga alterado para: ${status}`);

    res.json({
      success: true,
      message: `Vaga ${status} com sucesso`,
    });

  } catch (error) {
    console.error('❌ Erro ao alterar status da vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

module.exports = {
  criarVaga,
  listarVagas,
  buscarVagaPorId,
  minhasVagas,
  atualizarVaga,
  alterarStatusVaga,
};