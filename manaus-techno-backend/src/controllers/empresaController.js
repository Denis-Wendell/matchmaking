const Empresa = require('../models/Empresa');

// Listar todas as empresas
const listarEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.findAll({
      where: { status: 'ativa' },
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['senha_hash'] }
    });

    res.json({
      success: true,
      message: 'Empresas listadas com sucesso',
      data: empresas,
    });

  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar empresa por ID
const buscarEmpresaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const empresa = await Empresa.findByPk(id, {
      attributes: { exclude: ['senha_hash'] }
    });

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Empresa encontrada',
      data: empresa,
    });

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Atualizar perfil da empresa
const atualizarPerfil = async (req, res) => {
  try {
    const empresaId = req.empresa.id;
    const dadosParaAtualizar = { ...req.body };

    // Remover campos que não devem ser atualizados diretamente
    delete dadosParaAtualizar.id;
    delete dadosParaAtualizar.senha_hash;
    delete dadosParaAtualizar.email_corporativo;
    delete dadosParaAtualizar.cnpj;
    delete dadosParaAtualizar.created_at;
    delete dadosParaAtualizar.updated_at;

    const [numLinhasAfetadas, empresasAtualizadas] = await Empresa.update(
      dadosParaAtualizar,
      {
        where: { id: empresaId },
        returning: true,
      }
    );

    if (numLinhasAfetadas === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
    }

    const empresaAtualizada = empresasAtualizadas[0];

    res.json({
      success: true,
      message: 'Perfil da empresa atualizado com sucesso',
      data: empresaAtualizada,
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil da empresa:', error);

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

// Buscar meu perfil de empresa
const meuPerfil = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Perfil da empresa',
      data: req.empresa,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar empresas por setor
const buscarPorSetor = async (req, res) => {
  try {
    const { setor } = req.params;

    const empresas = await Empresa.findAll({
      where: { 
        setor_atuacao: setor,
        status: 'ativa'
      },
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['senha_hash'] }
    });

    res.json({
      success: true,
      message: `Empresas do setor ${setor} listadas com sucesso`,
      data: empresas,
    });

  } catch (error) {
    console.error('Erro ao buscar empresas por setor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar empresas verificadas
const buscarVerificadas = async (req, res) => {
  try {
    const empresas = await Empresa.findAll({
      where: { 
        verificada: true,
        status: 'ativa'
      },
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['senha_hash'] }
    });

    res.json({
      success: true,
      message: 'Empresas verificadas listadas com sucesso',
      data: empresas,
    });

  } catch (error) {
    console.error('Erro ao buscar empresas verificadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

module.exports = {
  listarEmpresas,
  buscarEmpresaPorId,
  atualizarPerfil,
  meuPerfil,
  buscarPorSetor,
  buscarVerificadas,
};