// middleware/auth.js

const jwt = require('jsonwebtoken');
const Freelancer = require('../models/Freelancer');
const Empresa = require('../models/Empresa');

/** Toggle de logs de debug via env */
const DEBUG_AUTH = String(process.env.DEBUG_AUTH || '').toLowerCase() === 'true';

const log = (...args) => { if (DEBUG_AUTH) console.log(...args); };

/** Regras de “ativo” */
const isFreelancerAtivo = (f) => !!f && f.status === 'ativo';
const isEmpresaAtiva = (e) => !!e && ['ativa', 'ativo'].includes(e.status);

/**
 * Middleware para verificar token JWT
 * - Lê id/tipo/empresaId/freelancerId do payload
 * - Carrega o registro correto do banco
 * - Injeta em:
 *   - req.tipoUsuario  -> 'freelancer' | 'empresa'
 *   - req.freelancer   -> instancia do modelo (se tipo freelancer)
 *   - req.empresa      -> instancia do modelo (se tipo empresa)
 *   - req.auth         -> metadados do token (id, tipo, empresaId, freelancerId, iat, exp)
 */
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
    // decoded pode conter: { id, tipo, empresaId, freelancerId, iat, exp }
    log('🔐 [AUTH] Token decodificado:', {
      id: decoded.id,
      tipo: decoded.tipo,
      empresaId: decoded.empresaId,
      freelancerId: decoded.freelancerId,
      iat: decoded.iat,
      exp: decoded.exp,
    });

    // Guarda metadados crus do token para uso posterior
    req.auth = {
      id: decoded.id,
      tipo: decoded.tipo || null,
      empresaId: decoded.empresaId || null,
      freelancerId: decoded.freelancerId || null,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    let usuario = null;

    if (decoded.tipo === 'freelancer') {
      const idFreela = decoded.freelancerId || decoded.id;
      usuario = await Freelancer.findByPk(idFreela);
      log('🔎 [AUTH] Fetch freelancer:', idFreela, 'encontrado?', !!usuario, 'status:', usuario?.status);

      if (!isFreelancerAtivo(usuario)) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido - freelancer inexistente ou inativo',
        });
      }

      req.freelancer = usuario;
      req.tipoUsuario = 'freelancer';
      req.auth.freelancerId = usuario.id;

    } else if (decoded.tipo === 'empresa') {
      const idEmp = decoded.empresaId || decoded.id;
      usuario = await Empresa.findByPk(idEmp);
      log('🔎 [AUTH] Fetch empresa:', idEmp, 'encontrada?', !!usuario, 'status:', usuario?.status);

      if (!isEmpresaAtiva(usuario)) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido - empresa inexistente ou inativa',
        });
      }

      req.empresa = usuario;
      req.tipoUsuario = 'empresa';
      req.auth.empresaId = usuario.id;

    } else {
      // 🔁 Compat: token antigo sem "tipo" → assume freelancer
      const idFreela = decoded.freelancerId || decoded.id;
      usuario = await Freelancer.findByPk(idFreela);
      log('🔁 [AUTH] Compat token antigo (assume freelancer):', idFreela, 'ok?', !!usuario);

      if (!isFreelancerAtivo(usuario)) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido - usuário não encontrado',
        });
      }

      req.freelancer = usuario;
      req.tipoUsuario = 'freelancer';
      req.auth.freelancerId = usuario.id;
      req.auth.tipo = 'freelancer';
    }

    log('✅ [AUTH] verificarToken OK para:', req.tipoUsuario);
    next();

  } catch (error) {
    console.error('❌ [AUTH] Erro na verificação do token:', error);

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

/** Middleware específico para freelancers */
const verificarFreelancer = (req, res, next) => {
  log('🔍 [AUTH verificarFreelancer] Tipo:', req.tipoUsuario, '| tem freelancer?', !!req.freelancer);
  if (req.tipoUsuario !== 'freelancer' || !req.freelancer) {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a freelancers',
    });
  }
  next();
};

/** Middleware específico para empresas */
const verificarEmpresa = (req, res, next) => {
  log('🔍 [AUTH verificarEmpresa] Tipo:', req.tipoUsuario, '| tem empresa?', !!req.empresa);
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
