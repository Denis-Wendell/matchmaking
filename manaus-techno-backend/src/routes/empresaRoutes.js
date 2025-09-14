const express = require('express');
const { 
  listarEmpresas, 
  buscarEmpresaPorId, 
  atualizarPerfil, 
  meuPerfil,
  buscarPorSetor,
  buscarVerificadas
} = require('../controllers/empresaController');
const { verificarToken, verificarEmpresa } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas
router.get('/', listarEmpresas); // Listar todas as empresas
router.get('/verificadas', buscarVerificadas); // Listar empresas verificadas
router.get('/setor/:setor', buscarPorSetor); // Buscar por setor
router.get('/:id', buscarEmpresaPorId); // Buscar empresa por ID

// Rotas protegidas (empresa logada)
router.get('/me/perfil', verificarToken, verificarEmpresa, meuPerfil); // Meu perfil
router.put('/me/perfil', verificarToken, verificarEmpresa, atualizarPerfil); // Atualizar meu perfil

module.exports = router;