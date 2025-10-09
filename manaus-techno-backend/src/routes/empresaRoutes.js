// src/routes/empresaRoutes.js
const express = require('express');
const { 
  listarEmpresas, 
  buscarEmpresaPorId, 
  atualizarPerfil, 
  meuPerfil,
  buscarPorSetor,
  buscarVerificadas,
  listarMatchesEmpresa, // novo
} = require('../controllers/empresaController');
const { verificarToken, verificarEmpresa } = require('../middleware/auth');

const router = express.Router();

/* ===== Rotas públicas ===== */
router.get('/', listarEmpresas);            // Listar todas as empresas
router.get('/verificadas', buscarVerificadas); // Listar empresas verificadas
router.get('/setor/:setor', buscarPorSetor);   // Buscar por setor

/* ===== Rotas protegidas (empresa logada) ===== */
router.get('/me/perfil', verificarToken, verificarEmpresa, meuPerfil);           // Meu perfil
router.put('/me/perfil', verificarToken, verificarEmpresa, atualizarPerfil);     // Atualizar meu perfil

/* ===== Matchs da empresa (PROTEGIDA) ===== */
router.get('/:empresaId/matches', verificarToken, verificarEmpresa, listarMatchesEmpresa);

/* ===== Rota com :id DEVE FICAR POR ÚLTIMO para não conflitar ===== */
router.get('/:id', buscarEmpresaPorId);     // Buscar empresa por ID

module.exports = router;
