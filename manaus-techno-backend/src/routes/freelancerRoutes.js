// src/routes/freelancerRoutes.js
const express = require('express');
const {
  listarFreelancers,
  buscarFreelancerPorId,
  atualizarPerfil,
  meuPerfil,
  gerarCurriculoPdf,
  gerarMeuCurriculoPdf,
} = require('../controllers/freelancerController');
const { verificarToken, verificarEmpresa, verificarFreelancer } = require('../middleware/auth');

const router = express.Router();

/* ===== Rotas protegidas (freelancer logado) — coloque ANTES das rotas com :id ===== */
router.get('/me/perfil', verificarToken, meuPerfil);              // Meu perfil
router.put('/me/perfil', verificarToken, atualizarPerfil);        // Atualizar meu perfil
router.get('/me/curriculo.pdf', verificarToken, verificarFreelancer, gerarMeuCurriculoPdf); // Baixar meu currículo

/* ===== Rotas públicas ===== */
router.get('/', listarFreelancers);                               // Listar todos

router.get('/:id/curriculo.pdf', verificarToken, verificarEmpresa, gerarCurriculoPdf); // Empresa baixa currículo do candidato
router.get('/:id', buscarFreelancerPorId);                        // Buscar por ID

module.exports = router;
