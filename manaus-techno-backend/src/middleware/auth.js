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
    console.log('🔍 [DEBUG] Token decodificado:', { id: decoded.id, tipo: decoded.tipo });
    
    let usuario = null;
    
    if (decoded.tipo) {
      if (decoded.tipo === 'freelancer') {
        usuario = await Freelancer.findByPk(decoded.id);
        console.log('🔍 [DEBUG] Freelancer encontrado:', !!usuario, 'Status:', usuario?.status);
        
        if (usuario && usuario.status === 'ativo') {
          req.freelancer = usuario;
          req.tipoUsuario = 'freelancer';
        }
      } else if (decoded.tipo === 'empresa') {
        usuario = await Empresa.findByPk(decoded.id);
        console.log('🔍 [DEBUG] Empresa encontrada:', !!usuario, 'Status:', usuario?.status);
        
        // CORREÇÃO: Usar 'ativo' em vez de 'ativa'
        if (usuario && usuario.status === 'ativo') {
          req.empresa = usuario;
          req.tipoUsuario = 'empresa';
          console.log('✅ [DEBUG] req.empresa definido:', usuario.nome);
        } else {
          console.log('❌ [DEBUG] Empresa não ativa ou não encontrada');
        }
      }
    } else {
      // Token antigo sem tipo - assume freelancer
      usuario = await Freelancer.findByPk(decoded.id);
      if (usuario && usuario.status === 'ativo') {
        req.freelancer = usuario;
        req.tipoUsuario = 'freelancer';
      }
    }
    
    if (!usuario) {
      console.log('❌ [DEBUG] Usuário não encontrado ou inativo');
      return res.status(401).json({
        success: false,
        message: 'Token inválido - usuário não encontrado',
      });
    }

    console.log('✅ [DEBUG] Middleware verificarToken OK para:', req.tipoUsuario);
    next();

  } catch (error) {
    console.error('❌ [DEBUG] Erro na verificação do token:', error);
    
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
  console.log('🔍 [DEBUG verificarFreelancer] Tipo:', req.tipoUsuario, 'Tem freelancer:', !!req.freelancer);
  
  if (req.tipoUsuario !== 'freelancer' || !req.freelancer) {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a freelancers',
    });
  }
  
  console.log('✅ [DEBUG] Acesso liberado para freelancer:', req.freelancer.nome);
  next();
};

// Middleware específico para empresas  
const verificarEmpresa = (req, res, next) => {
  console.log('🔍 [DEBUG verificarEmpresa] Tipo:', req.tipoUsuario, 'Tem empresa:', !!req.empresa);
  
  if (req.tipoUsuario !== 'empresa' || !req.empresa) {
    console.log('❌ [DEBUG] Acesso negado - não é empresa ou req.empresa undefined');
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a empresas',
    });
  }
  
  console.log('✅ [DEBUG] Acesso liberado para empresa:', req.empresa.nome);
  next();
};

module.exports = {
  verificarToken,
  verificarFreelancer,
  verificarEmpresa,
};