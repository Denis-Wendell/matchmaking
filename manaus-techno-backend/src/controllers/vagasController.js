const Vaga = require('../models/Vaga');
const Empresa = require('../models/Empresa');

// Criar nova vaga (apenas empresas)
const criarVaga = async (req, res) => {
  try {
    console.log('📝 Dados recebidos para nova vaga:', req.body);
    
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

    // Criar nova vaga associada à empresa logada
    const novaVaga = await Vaga.create({
      empresa_id: req.empresa.id, // ID da empresa logada
      titulo,
      area_atuacao,
      nivel_experiencia,
      tipo_contrato,
      modalidade_trabalho,
      localizacao_texto,
      quantidade_vagas: quantidade_vagas || 1,
      salario_minimo,
      salario_maximo,
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
      data_inicio_desejada,
      data_limite_inscricoes,
      processo_seletivo,
      palavras_chave,
      contato_nome,
      contato_email,
      contato_telefone,
      observacoes,
      skills_obrigatorias: Array.isArray(skills_obrigatorias) ? skills_obrigatorias : [],
      skills_desejaveis: Array.isArray(skills_desejaveis) ? skills_desejaveis : [],
      areas_relacionadas: Array.isArray(areas_relacionadas) ? areas_relacionadas : [],
      status: 'ativa',
      visualizacoes: 0,
      candidaturas: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Vaga criada com sucesso',
      data: novaVaga,
    });

  } catch (error) {
    console.error('Erro ao criar vaga:', error);

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

// Listar todas as vagas ativas
const listarVagas = async (req, res) => {
  try {
    const { area, nivel, modalidade, tipo, limite = 20, pagina = 1 } = req.query;
    
    const where = { status: 'ativa' };
    
    // Filtros opcionais
    if (area) where.area_atuacao = area;
    if (nivel) where.nivel_experiencia = nivel;
    if (modalidade) where.modalidade_trabalho = modalidade;
    if (tipo) where.tipo_contrato = tipo;

    const offset = (pagina - 1) * limite;

    const vagas = await Vaga.findAndCountAll({
      where,
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['nome', 'setor_atuacao', 'tamanho_empresa', 'cidade', 'estado']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limite),
      offset: parseInt(offset),
    });

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
    console.error('Erro ao listar vagas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar vaga por ID
const buscarVagaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const vaga = await Vaga.findByPk(id, {
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['nome', 'setor_atuacao', 'tamanho_empresa', 'cidade', 'estado', 'site_empresa', 'descricao_empresa']
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
    console.error('Erro ao buscar vaga:', error);
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
      },
    });

  } catch (error) {
    console.error('Erro ao listar vagas da empresa:', error);
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

    res.json({
      success: true,
      message: 'Vaga atualizada com sucesso',
      data: vagaAtualizada,
    });

  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);

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

    if (!['ativa', 'inativa', 'pausada', 'preenchida'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido',
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

    res.json({
      success: true,
      message: `Vaga ${status} com sucesso`,
    });

  } catch (error) {
    console.error('Erro ao alterar status da vaga:', error);
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