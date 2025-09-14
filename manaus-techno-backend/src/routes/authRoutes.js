const express = require('express');
const { 
  registrar, 
  registrarEmpresa, 
  login, 
  loginUnificado, 
  verificarAuth 
} = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');
 
const router = express.Router();

// Rotas públicas
router.post('/registrar', registrar); // Registrar freelancer
router.post('/registrar-empresa', registrarEmpresa); // Registrar empresa
router.post('/login', login); // Login freelancer (compatibilidade)
router.post('/login-unificado', loginUnificado); // Login unificado (freelancer ou empresa)

// Rotas protegidas
router.get('/verificar', verificarToken, verificarAuth);

module.exports = router;