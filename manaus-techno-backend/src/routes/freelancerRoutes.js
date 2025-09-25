const express = require('express');
const {
  listarFreelancers,          // pode ser a versão já paginada/filtrada
  buscarFreelancerPorId,
  atualizarPerfil,
  meuPerfil,
  gerarCurriculoPdf,
  gerarMeuCurriculoPdf,
} = require('../controllers/freelancerController');
const { verificarToken, verificarEmpresa, verificarFreelancer } = require('../middleware/auth');

const router = express.Router();

// Rotas do próprio freelancer (antes das :id)
router.get('/me/perfil', verificarToken, meuPerfil);
router.put('/me/perfil', verificarToken, atualizarPerfil);
router.get('/me/curriculo.pdf', verificarToken, verificarFreelancer, gerarMeuCurriculoPdf);

// Lista paginada/filtrada (apenas UMA /)
router.get('/', listarFreelancers);

// Rotas com :id (currículo antes do :id)
router.get('/:id/curriculo.pdf', verificarToken, verificarEmpresa, gerarCurriculoPdf);
router.get('/:id', buscarFreelancerPorId);

module.exports = router;
