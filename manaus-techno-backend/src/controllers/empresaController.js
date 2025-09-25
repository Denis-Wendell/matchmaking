// empresaController.js

const Empresa = require('../models/Empresa');

/* ========= COMPAT LAYER (entrada) =========
   Mapeia valores que o front pode enviar para
   o formato que o BD atual aceita.
*/
const mapInEmpresaStatus = (v) => {
  if (!v) return undefined;
  const s = String(v).toLowerCase().trim();
  const map = {
    'ativo': 'ativa',
    'ativa': 'ativa',
    'inativo': 'inativa',
    'inativa': 'inativa',
    'pendente': 'pendente',
    'bloqueado': 'bloqueada',
    'bloqueada': 'bloqueada',
  };
  return map[s] || 'ativa';
};

const mapInTamanhoEmpresa = (v) => {
  if (!v) return undefined;
  const t = String(v).toLowerCase().trim();
  const map = {
    'startup': 'Startup',
    'pequena': 'Pequena',
    'pequeno': 'Pequena',
    'small': 'Pequena',
    'media': 'Média',
    'média': 'Média',
    'medio': 'Média',
    'médio': 'Média',
    'medium': 'Média',
    'grande': 'Grande',
    'big': 'Grande',
    'large': 'Grande',
    'multinacional': 'Multinacional',
    'multinational': 'Multinacional',
  };
  return map[t] || 'Pequena';
};

const toArray = (val) => {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    // aceita "a,b,c" ou "a; b; c"
    return val.split(/[;,]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

// Listar todas as empresas
const listarEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.findAll({
      where: { status: 'ativa' }, // BD atual usa 'ativa'
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

    // COMPAT: status e tamanho_empresa para o formato do BD atual
    if (dadosParaAtualizar.status != null) {
      dadosParaAtualizar.status = mapInEmpresaStatus(dadosParaAtualizar.status);
    }
    if (dadosParaAtualizar.tamanho_empresa != null) {
      dadosParaAtualizar.tamanho_empresa = mapInTamanhoEmpresa(dadosParaAtualizar.tamanho_empresa);
    }

    // Garantir arrays quando vierem string
    if (dadosParaAtualizar.areas_atuacao != null) {
      dadosParaAtualizar.areas_atuacao = toArray(dadosParaAtualizar.areas_atuacao);
    }
    if (dadosParaAtualizar.beneficios_array != null) {
      dadosParaAtualizar.beneficios_array = toArray(dadosParaAtualizar.beneficios_array);
    }
    if (dadosParaAtualizar.tecnologias_usadas != null) {
      dadosParaAtualizar.tecnologias_usadas = toArray(dadosParaAtualizar.tecnologias_usadas);
    }

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
        status: 'ativa' // BD atual
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
        status: 'ativa' // BD atual
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
