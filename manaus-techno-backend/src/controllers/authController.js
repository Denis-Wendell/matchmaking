const jwt = require('jsonwebtoken');
const Freelancer = require('../models/Freelancer');
const Empresa = require('../models/Empresa');


// Gerar token JWT
const gerarToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Registrar freelancer
const registrar = async (req, res) => {
  try {
    console.log('📝 Dados recebidos no registro:', req.body);
    
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
      skills_array: Array.isArray(skills_array) ? skills_array : [skills_array].filter(Boolean),
      modalidade_trabalho: modalidade_trabalho || 'Remoto',
      status: 'ativo',
    });

    // Gerar token
    const token = gerarToken(novoFreelancer.id);

    res.status(201).json({
      success: true,
      message: 'Freelancer cadastrado com sucesso',
      data: {
        freelancer: novoFreelancer,
        token,
      },
    });

  } catch (error) {
    console.error('Erro no registro:', error);

    // Tratar erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors,
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email já está cadastrado',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Login do freelancer
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações básicas
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    // Buscar freelancer (incluindo senha para verificação)
    const freelancer = await Freelancer.scope('withPassword').findOne({ 
      where: { email },
    });

    if (!freelancer) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verificar se freelancer está ativo
    if (freelancer.status !== 'ativo') {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada ou pendente',
      });
    }

    // Verificar senha
    const senhaValida = await freelancer.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Atualizar último login
    await freelancer.atualizarUltimoLogin();

    // Gerar token
    const token = gerarToken(freelancer.id);

    // Remover senha da resposta
    const freelancerSemSenha = freelancer.toJSON();

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        freelancer: freelancerSemSenha,
        token,
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

// Verificar token (rota protegida de teste)
const verificarAuth = async (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    data: {
      freelancer: req.freelancer,
    },
  });
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
        [require('sequelize').Op.or]: [
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
      tamanho_empresa: tamanho_empresa ? tamanho_empresa.toLowerCase() : null,
      site_empresa,
      descricao_empresa,
      principais_beneficios,
      cultura_empresa,
      responsavel_nome,
      responsavel_cargo,
      responsavel_email,
      responsavel_telefone,
      areas_atuacao: Array.isArray(areas_atuacao) ? areas_atuacao : [],
      beneficios_array: Array.isArray(beneficios_array) ? beneficios_array : [],
      tecnologias_usadas: Array.isArray(tecnologias_usadas) ? tecnologias_usadas : [],
      status: 'ativo',
      verificada: false,
    });

    // Gerar token
    const token = gerarToken(novaEmpresa.id);

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

    // Tratar erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors,
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email ou CNPJ já está cadastrado',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Login unificado (freelancer ou empresa)
const loginUnificado = async (req, res) => {
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
    let tipoUsuario = tipo;

    if (tipo === 'freelancer') {
      // Buscar freelancer
      usuario = await Freelancer.scope('withPassword').findOne({ 
        where: { email },
      });
    } else {
      // Buscar empresa
      usuario = await Empresa.scope('withPassword').findOne({ 
        where: { email_corporativo: email },
      });
    }

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verificar se está ativo
    if (tipo === 'freelancer' && usuario.status !== 'ativo') {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada ou pendente',
      });
    } else if (tipo === 'empresa' && usuario.status !== 'ativa') {
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
    const token = jwt.sign(
      { id: usuario.id, tipo: tipoUsuario }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remover senha da resposta
    const usuarioSemSenha = usuario.toJSON();

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        [tipoUsuario]: usuarioSemSenha,
        token,
        tipo: tipoUsuario,
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

module.exports = {
  registrar,
  registrarEmpresa,
  login,
  loginUnificado,
  verificarAuth,
};