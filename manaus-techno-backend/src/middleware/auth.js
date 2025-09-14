const jwt = require('jsonwebtoken');
const Freelancer = require('../models/Freelancer');
const Empresa = require('../models/Empresa');

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let usuario = null;
    
    if (decoded.tipo) {
      if (decoded.tipo === 'freelancer') {
        usuario = await Freelancer.findByPk(decoded.id);
        if (usuario && usuario.status === 'ativo') {
          req.freelancer = usuario;
          req.tipoUsuario = 'freelancer';
        }
      } else if (decoded.tipo === 'empresa') {
        usuario = await Empresa.findByPk(decoded.id);
        if (usuario && usuario.status === 'ativa') {
          req.empresa = usuario;
          req.tipoUsuario = 'empresa';
        }
      }
    } else {
      usuario = await Freelancer.findByPk(decoded.id);
      if (usuario && usuario.status === 'ativo') {
        req.freelancer = usuario;
        req.tipoUsuario = 'freelancer';
      }
    }
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido - usuário não encontrado',
      });
    }

    next();

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Middleware específico para freelancers
const verificarFreelancer = (req, res, next) => {
  if (req.tipoUsuario !== 'freelancer' || !req.freelancer) {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a freelancers',
    });
  }
  next();
};

// Middleware específico para empresas
const verificarEmpresa = (req, res, next) => {
  if (req.tipoUsuario !== 'empresa' || !req.empresa) {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a empresas',
    });
  }
  next();
};

module.exports = {
  verificarToken,
  verificarFreelancer,
  verificarEmpresa,
};