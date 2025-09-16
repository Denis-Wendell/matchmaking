const Candidatura = require('../models/Candidatura');
const Vaga = require('../models/Vaga');
const Freelancer = require('../models/Freelancer');
const Empresa = require('../models/Empresa');

// Freelancer se candidatar a uma vaga
const candidatarSe = async (req, res) => {
  try {
    const { vaga_id, mensagem_candidato } = req.body;
    const freelancer_id = req.freelancer.id;

    // Verificar se a vaga existe e está ativa
    const vaga = await Vaga.findByPk(vaga_id);
    if (!vaga) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada',
      });
    }

    if (vaga.status !== 'ativo') {
      return res.status(400).json({
        success: false,
        message: 'Esta vaga não está mais ativa para candidaturas',
      });
    }

    // Verificar se freelancer já se candidatou a esta vaga
    const candidaturaExistente = await Candidatura.findOne({
      where: {
        vaga_id,
        freelancer_id
      }
    });

    if (candidaturaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Você já se candidatou a esta vaga',
      });
    }

    // Criar candidatura
    const novaCandidatura = await Candidatura.create({
      vaga_id,
      freelancer_id,
      mensagem_candidato: mensagem_candidato?.trim() || null,
      status: 'pendente',
      data_candidatura: new Date()
    });

    // Incrementar contador de candidaturas na vaga
    await vaga.increment('candidaturas');

    res.status(201).json({
      success: true,
      message: 'Candidatura enviada com sucesso',
      data: novaCandidatura,
    });

  } catch (error) {
    console.error('Erro ao se candidatar:', error);

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

// Listar candidaturas do freelancer
const minhasCandidaturas = async (req, res) => {
  try {
    const freelancer_id = req.freelancer.id;
    const { status = 'todas', limite = 10, pagina = 1 } = req.query;

    const where = { freelancer_id };
    
    if (status !== 'todas') {
      where.status = status;
    }

    const offset = (pagina - 1) * limite;

    const candidaturas = await Candidatura.findAndCountAll({
      where,
      include: [
        {
          model: Vaga,
          as: 'vaga',
          attributes: ['id', 'titulo', 'area_atuacao', 'localizacao_texto', 'status', 'salario_minimo', 'salario_maximo', 'moeda'],
          include: [{
            model: Empresa,
            as: 'empresa',
            attributes: ['nome', 'cidade', 'estado'],
            required: false
          }],
          required: true
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limite),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      message: 'Candidaturas listadas com sucesso',
      data: {
        candidaturas: candidaturas.rows,
        total: candidaturas.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(candidaturas.count / limite),
      },
    });

  } catch (error) {
    console.error('Erro ao listar candidaturas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Listar candidatos de uma vaga (para empresa)
const candidatosVaga = async (req, res) => {
  try {
    const { vaga_id } = req.params;
    const { status = 'todas', limite = 20, pagina = 1 } = req.query;
    const empresa_id = req.empresa.id;

    // Verificar se a vaga pertence à empresa
    const vaga = await Vaga.findOne({
      where: {
        id: vaga_id,
        empresa_id: empresa_id
      }
    });

    if (!vaga) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada ou não pertence a sua empresa',
      });
    }

    const where = { vaga_id };
    
    if (status !== 'todas') {
      where.status = status;
    }

    const offset = (pagina - 1) * limite;

    const candidaturas = await Candidatura.findAndCountAll({
      where,
      include: [
        {
          model: Freelancer,
          as: 'freelancer',
          attributes: [
            'id', 'nome', 'email', 'telefone', 'area_atuacao', 
            'nivel_experiencia', 'modalidade_trabalho', 'principais_habilidades',
            'skills_array', 'cidade', 'estado', 'url_portfolio', 'linkedin'
          ],
          required: true
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limite),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      message: 'Candidatos listados com sucesso',
      data: {
        vaga: {
          id: vaga.id,
          titulo: vaga.titulo,
          area_atuacao: vaga.area_atuacao
        },
        candidaturas: candidaturas.rows,
        total: candidaturas.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(candidaturas.count / limite),
      },
    });

  } catch (error) {
    console.error('Erro ao listar candidatos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Atualizar status de uma candidatura (para empresa)
const atualizarStatusCandidatura = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback_empresa } = req.body;
    const empresa_id = req.empresa.id;

    // Validar status
    const statusValidos = ['pendente', 'visualizada', 'interessado', 'nao_interessado', 'rejeitada', 'contratado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido',
      });
    }

    // Buscar candidatura e verificar se a vaga pertence à empresa
    const candidatura = await Candidatura.findOne({
      where: { id },
      include: [{
        model: Vaga,
        as: 'vaga',
        where: { empresa_id },
        required: true
      }]
    });

    if (!candidatura) {
      return res.status(404).json({
        success: false,
        message: 'Candidatura não encontrada',
      });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = { 
      status,
      data_resposta: new Date()
    };

    // Se é a primeira visualização, marcar data
    if (status === 'visualizada' && candidatura.status === 'pendente') {
      dadosAtualizacao.data_visualizacao = new Date();
    }

    // Adicionar feedback se fornecido
    if (feedback_empresa) {
      dadosAtualizacao.feedback_empresa = feedback_empresa.trim();
    }

    // Atualizar candidatura
    await candidatura.update(dadosAtualizacao);

    res.json({
      success: true,
      message: 'Status da candidatura atualizado com sucesso',
      data: candidatura,
    });

  } catch (error) {
    console.error('Erro ao atualizar status da candidatura:', error);

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

// Buscar detalhes de uma candidatura específica
const detalhesCandidatura = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se é freelancer ou empresa fazendo a requisição
    let whereCondition = { id };
    let includeCondition = [];

    if (req.freelancer) {
      // Freelancer só pode ver suas próprias candidaturas
      whereCondition.freelancer_id = req.freelancer.id;
      includeCondition = [
        {
          model: Vaga,
          as: 'vaga',
          attributes: ['id', 'titulo', 'area_atuacao', 'descricao_geral', 'requisitos_obrigatorios', 'habilidades_tecnicas'],
          include: [{
            model: Empresa,
            as: 'empresa',
            attributes: ['nome', 'setor_atuacao', 'cidade', 'estado'],
            required: false
          }],
          required: true
        }
      ];
    } else if (req.empresa) {
      // Empresa só pode ver candidaturas das suas vagas
      includeCondition = [
        {
          model: Vaga,
          as: 'vaga',
          where: { empresa_id: req.empresa.id },
          required: true
        },
        {
          model: Freelancer,
          as: 'freelancer',
          attributes: [
            'id', 'nome', 'email', 'telefone', 'area_atuacao', 'nivel_experiencia',
            'modalidade_trabalho', 'principais_habilidades', 'skills_array',
            'resumo_profissional', 'experiencia_profissional', 'formacao_academica',
            'url_portfolio', 'linkedin', 'github', 'cidade', 'estado'
          ],
          required: true
        }
      ];
    }

    const candidatura = await Candidatura.findOne({
      where: whereCondition,
      include: includeCondition
    });

    if (!candidatura) {
      return res.status(404).json({
        success: false,
        message: 'Candidatura não encontrada',
      });
    }

    // Se empresa está visualizando pela primeira vez, atualizar status
    if (req.empresa && candidatura.status === 'pendente') {
      await candidatura.update({
        status: 'visualizada',
        data_visualizacao: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Detalhes da candidatura',
      data: candidatura,
    });

  } catch (error) {
    console.error('Erro ao buscar detalhes da candidatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Cancelar candidatura (freelancer)
const cancelarCandidatura = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancer_id = req.freelancer.id;

    const candidatura = await Candidatura.findOne({
      where: {
        id,
        freelancer_id
      },
      include: [{
        model: Vaga,
        as: 'vaga',
        required: true
      }]
    });

    if (!candidatura) {
      return res.status(404).json({
        success: false,
        message: 'Candidatura não encontrada',
      });
    }

    // Não permitir cancelamento se já foi processada
    if (['contratado', 'rejeitada'].includes(candidatura.status)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar uma candidatura já processada',
      });
    }

    // Remover candidatura
    await candidatura.destroy();

    // Decrementar contador na vaga
    await candidatura.vaga.decrement('candidaturas');

    res.json({
      success: true,
      message: 'Candidatura cancelada com sucesso',
    });

  } catch (error) {
    console.error('Erro ao cancelar candidatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

module.exports = {
  candidatarSe,
  minhasCandidaturas,
  candidatosVaga,
  atualizarStatusCandidatura,
  detalhesCandidatura,
  cancelarCandidatura,
};