//authRoutes.js

const express = require('express');
const { 
  registrarFreelancer,     // Era 'registrar'
  registrarEmpresa, 
  login,                   // Era 'loginUnificado' - agora unificado por padrão
  verificarAuth,
  logout,                  // Nova função
  refreshToken            // Nova função
} = require('../controllers/authController');
const { verificarToken, verificarFreelancer, verificarEmpresa } = require('../middleware/auth');
 
const router = express.Router();

// Rotas públicas
router.post('/registrar', registrarFreelancer);              // Registrar freelancer
router.post('/registrar-freelancer', registrarFreelancer);   // Alias mais claro
router.post('/registrar-empresa', registrarEmpresa);         // Registrar empresa

// Login unificado (substitui tanto login quanto loginUnificado)
router.post('/login', login);                                // Login unificado

// Para compatibilidade com códigos antigos (remover após migração completa)
// router.post('/login-unificado', login);                      // Remova esta linha quando atualizar o frontend

// Rotas protegidas - Gerais
router.get('/verificar', verificarToken, verificarAuth);     // Verificar token
router.post('/logout', verificarToken, logout);              // Logout
router.post('/refresh', verificarToken, refreshToken);       // Renovar token

// Rotas protegidas - Específicas para Freelancers
router.get('/perfil-freelancer', verificarToken, verificarFreelancer, (req, res) => {
  res.json({
    success: true,
    message: 'Perfil do freelancer',
    data: {
      freelancer: req.freelancer,
      tipo: 'freelancer'
    }
  });
});

// Rotas protegidas - Específicas para Empresas  
router.get('/perfil-empresa', verificarToken, verificarEmpresa, (req, res) => {
  res.json({
    success: true,
    message: 'Perfil da empresa',
    data: {
      empresa: req.empresa,
      tipo: 'empresa'
    }
  });
});

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de autenticação funcionando',
    timestamp: new Date().toISOString(),
    endpoints: {
      public: [
        'POST /auth/registrar',
        'POST /auth/registrar-freelancer', 
        'POST /auth/registrar-empresa',
        'POST /auth/login'
      ],
      protected: [
        'GET /auth/verificar',
        'POST /auth/logout',
        'POST /auth/refresh',
        'GET /auth/perfil-freelancer',
        'GET /auth/perfil-empresa'
      ]
    }
  });
});

module.exports = router;