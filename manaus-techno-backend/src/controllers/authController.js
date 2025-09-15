const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Freelancer = require('../models/Freelancer');
const Empresa = require('../models/Empresa');

// Gerar token JWT (agora suporta tipo de usuário)
const gerarToken = (userId, tipo = null) => {
  const payload = tipo ? { id: userId, tipo } : { id: userId };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Função auxiliar para tratar erros do Sequelize
const tratarErrosSequelize = (error, res) => {
  console.error('Erro Sequelize:', error);

  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors,
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0].path;
    const message = field === 'email' || field === 'email_corporativo' 
      ? 'Email já está cadastrado'
      : field === 'cnpj' 
      ? 'CNPJ já está cadastrado'
      : 'Dados já estão cadastrados';
    
    return res.status(400).json({
      success: false,
      message,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  });
};

// Função auxiliar para sanitizar arrays
const sanitizarArray = (valor) => {
  if (Array.isArray(valor)) return valor;
  if (valor) return [valor].filter(Boolean);
  return [];
};

// Função auxiliar para normalizar modalidade de trabalho
const normalizarModalidadeTrabalho = (modalidade) => {
  if (!modalidade) return 'remoto'; // valor padrão
  
  const modalidadeLower = modalidade.toLowerCase().trim();
  
  // Mapeamento baseado nos valores mais comuns em ENUMs brasileiros
  const mapeamento = {
    'remoto': 'remoto',
    'remote': 'remoto',
    'presencial': 'presencial', 
    'onsite': 'presencial',
    'local': 'presencial',
    'hibrido': 'hibrido',
    'híbrido': 'hibrido',
    'hybrid': 'hibrido',
    'misto': 'hibrido'
  };
  
  return mapeamento[modalidadeLower] || 'remoto';
};

// Função auxiliar para normalizar status de empresa
const normalizarStatusEmpresa = (status) => {
  if (!status) return 'ativo'; // valor padrão
  
  const statusLower = status.toLowerCase().trim();
  
  // Mapeamento baseado nos valores reais do ENUM: ativo, inativo, pausado, pendente
  const mapeamento = {
    'ativo': 'ativo',
    'ativa': 'ativo',
    'active': 'ativo',
    'inativo': 'inativo',
    'inativa': 'inativo',
    'inactive': 'inativo',
    'pausado': 'pausado',
    'pausada': 'pausado',
    'paused': 'pausado',
    'pendente': 'pendente',
    'pending': 'pendente'
  };
  
  return mapeamento[statusLower] || 'ativo';
};

// Função auxiliar para normalizar tamanho de empresa
const normalizarTamanhoEmpresa = (tamanho) => {
  if (!tamanho) return 'pequena'; // valor padrão
  
  const tamanhoLower = tamanho.toLowerCase().trim();
  
  // Mapeamento baseado nos valores reais do ENUM: startup, pequena, media, grande, multinacional
  const mapeamento = {
    'startup': 'startup',
    'pequena': 'pequena',
    'pequeno': 'pequena',
    'small': 'pequena',
    'media': 'media',
    'média': 'media',
    'medio': 'media',
    'médio': 'media',
    'medium': 'media',
    'grande': 'grande',
    'big': 'grande',
    'large': 'grande',
    'multinacional': 'multinacional',
    'multinational': 'multinacional'
  };
  
  return mapeamento[tamanhoLower] || 'pequena';
};

// Registrar freelancer
const registrarFreelancer = async (req, res) => {
  try {
    console.log('📝 Dados recebidos no registro do freelancer:', req.body);
    
    const {
      nome,
      email,
      senha,
      telefone,
      area_atuacao,
      nivel_experiencia,
      principais_habilidades,
      skills_array,
      modalidade_trabalho,
    } = req.body;

    // Verificar se freelancer já existe
    const freelancerExistente = await Freelancer.findOne({ where: { email } });
    if (freelancerExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já está cadastrado',
      });
    }

    // Criar freelancer
    const novoFreelancer = await Freelancer.create({
      nome,
      email,
      senha_hash: senha, // Será criptografada pelo hook
      telefone,
      area_atuacao,
      nivel_experiencia,
      principais_habilidades,
      skills_array: sanitizarArray(skills_array),
      modalidade_trabalho: normalizarModalidadeTrabalho(modalidade_trabalho),
      status: 'ativo',
    });

    // Gerar token
    const token = gerarToken(novoFreelancer.id, 'freelancer');

    res.status(201).json({
      success: true,
      message: 'Freelancer cadastrado com sucesso',
      data: {
        freelancer: novoFreelancer,
        token,
        tipo: 'freelancer',
      },
    });

  } catch (error) {
    console.error('Erro no registro do freelancer:', error);
    return tratarErrosSequelize(error, res);
  }
};

// Registrar empresa
const registrarEmpresa = async (req, res) => {
  try {
    console.log('📝 Dados recebidos no registro da empresa:', req.body);
    
    const {
      nome,
      cnpj,
      email_corporativo,
      senha,
      telefone,
      endereco_completo,
      cidade,
      estado,
      cep,
      setor_atuacao,
      tamanho_empresa,
      site_empresa,
      descricao_empresa,
      principais_beneficios,
      cultura_empresa,
      responsavel_nome,
      responsavel_cargo,
      responsavel_email,
      responsavel_telefone,
      areas_atuacao,
      beneficios_array,
      tecnologias_usadas,
    } = req.body;

    // Verificar se empresa já existe (por email ou CNPJ)
    const empresaExistente = await Empresa.findOne({ 
      where: {
        [Op.or]: [
          { email_corporativo },
          { cnpj }
        ]
      }
    });
    
    if (empresaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email ou CNPJ já está cadastrado',
      });
    }

    // Criar empresa
    const novaEmpresa = await Empresa.create({
      nome,
      cnpj,
      email_corporativo,
      senha_hash: senha, // Será criptografada pelo hook
      telefone,
      endereco_completo,
      cidade,
      estado,
      cep,
      setor_atuacao,
      tamanho_empresa: normalizarTamanhoEmpresa(tamanho_empresa),
      site_empresa,
      descricao_empresa,
      principais_beneficios,
      cultura_empresa,
      responsavel_nome,
      responsavel_cargo,
      responsavel_email,
      responsavel_telefone,
      areas_atuacao: sanitizarArray(areas_atuacao),
      beneficios_array: sanitizarArray(beneficios_array),
      tecnologias_usadas: sanitizarArray(tecnologias_usadas),
      status: normalizarStatusEmpresa('ativo'), // Usar função de normalização
      verificada: false,
    });

    // Gerar token
    const token = gerarToken(novaEmpresa.id, 'empresa');

    res.status(201).json({
      success: true,
      message: 'Empresa cadastrada com sucesso',
      data: {
        empresa: novaEmpresa,
        token,
        tipo: 'empresa'
      },
    });

  } catch (error) {
    console.error('Erro no registro da empresa:', error);
    return tratarErrosSequelize(error, res);
  }
};

// Login unificado (freelancer ou empresa)
const login = async (req, res) => {
  try {
    const { email, senha, tipo } = req.body;

    // Validações básicas
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    if (!tipo || !['freelancer', 'empresa'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo deve ser "freelancer" ou "empresa"',
      });
    }

    let usuario = null;
    let emailField = tipo === 'freelancer' ? 'email' : 'email_corporativo';

    // Buscar usuário baseado no tipo
    if (tipo === 'freelancer') {
      usuario = await Freelancer.scope('withPassword').findOne({ 
        where: { [emailField]: email },
      });
    } else {
      usuario = await Empresa.scope('withPassword').findOne({ 
        where: { [emailField]: email },
      });
    }

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verificar se está ativo (status normalizado)
    const statusEsperado = tipo === 'freelancer' ? 'ativo' : normalizarStatusEmpresa('ativo');
    if (usuario.status !== statusEsperado) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada ou pendente',
      });
    }

    // Verificar senha
    const senhaValida = await usuario.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Atualizar último login
    await usuario.atualizarUltimoLogin();

    // Gerar token com tipo do usuário
    const token = gerarToken(usuario.id, tipo);

    // Remover senha da resposta
    const usuarioSemSenha = usuario.toJSON();

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        [tipo]: usuarioSemSenha,
        token,
        tipo,
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Verificar token (compatível com seu middleware existente)
const verificarAuth = async (req, res) => {
  try {
    // Seu middleware define req.freelancer, req.empresa e req.tipoUsuario
    const tipoUsuario = req.tipoUsuario;
    const usuario = req.freelancer || req.empresa;
    
    if (!usuario || !tipoUsuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
    
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        [tipoUsuario]: usuario,
        tipo: tipoUsuario,
      },
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Logout (compatível com seu middleware)
const logout = async (req, res) => {
  try {
    // Se você mantiver uma blacklist de tokens, adicione aqui
    // Por enquanto, apenas confirma o logout
    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
      data: {
        tipo: req.tipoUsuario
      }
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Refresh token (compatível com seu middleware)
const refreshToken = async (req, res) => {
  try {
    const tipoUsuario = req.tipoUsuario;
    const usuario = req.freelancer || req.empresa;
    
    if (!usuario || !tipoUsuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }

    // Gerar novo token
    const novoToken = gerarToken(usuario.id, tipoUsuario);

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token: novoToken,
        tipo: tipoUsuario,
      },
    });

  } catch (error) {
    console.error('Erro no refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

module.exports = {
  registrarFreelancer,
  registrarEmpresa,
  login,
  verificarAuth,
  logout,
  refreshToken,
};