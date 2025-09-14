const Freelancer = require('../models/Freelancer');

// Listar todos os freelancers
const listarFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.findAll({
      where: { status: 'ativo' },
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['senha_hash'] }
    });

    res.json({
      success: true,
      message: 'Freelancers listados com sucesso',
      data: freelancers,
    });

  } catch (error) {
    console.error('Erro ao listar freelancers:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar freelancer por ID
const buscarFreelancerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const freelancer = await Freelancer.findByPk(id, {
      attributes: { exclude: ['senha_hash'] }
    });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Freelancer encontrado',
      data: freelancer,
    });

  } catch (error) {
    console.error('Erro ao buscar freelancer:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Atualizar perfil do freelancer
const atualizarPerfil = async (req, res) => {
  try {
    const freelancerId = req.freelancer.id;
    const dadosParaAtualizar = { ...req.body };

    // Remover campos que não devem ser atualizados diretamente
    delete dadosParaAtualizar.id;
    delete dadosParaAtualizar.senha_hash;
    delete dadosParaAtualizar.email; // Email só via endpoint específico
    delete dadosParaAtualizar.created_at;
    delete dadosParaAtualizar.updated_at;

    const [numLinhasAfetadas, freelancersAtualizados] = await Freelancer.update(
      dadosParaAtualizar,
      {
        where: { id: freelancerId },
        returning: true,
      }
    );

    if (numLinhasAfetadas === 0) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer não encontrado',
      });
    }

    const freelancerAtualizado = freelancersAtualizados[0];

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: freelancerAtualizado,
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);

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

// Buscar meu perfil
const meuPerfil = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Perfil do freelancer',
      data: req.freelancer,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

module.exports = {
  listarFreelancers,
  buscarFreelancerPorId,
  atualizarPerfil,
  meuPerfil,
};