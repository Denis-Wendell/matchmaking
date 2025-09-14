const express = require('express');
const { 
  listarFreelancers, 
  buscarFreelancerPorId, 
  atualizarPerfil, 
  meuPerfil 
} = require('../controllers/freelancerController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas
router.get('/', listarFreelancers); // Listar todos os freelancers
router.get('/:id', buscarFreelancerPorId); // Buscar freelancer por ID

// Rotas protegidas (freelancer logado)
router.get('/me/perfil', verificarToken, meuPerfil); // Meu perfil
router.put('/me/perfil', verificarToken, atualizarPerfil); // Atualizar meu perfil

module.exports = router;