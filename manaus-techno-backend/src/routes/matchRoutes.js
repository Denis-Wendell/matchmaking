// src/routes/matchRoutes.js
const express = require('express');
const {
  verificarToken,
  verificarEmpresa,
  verificarFreelancer,
} = require('../middleware/auth');

const {
  listarFreelancersComMatchDaEmpresa,
  listarVagasCompativeisParaFreelancer, // <-- nome correto
} = require('../controllers/matchController');

const router = express.Router();

/**
 * Empresa -> lista freelancers com melhor match
 * GET /api/empresas/:empresaId/matches
 */
router.get(
  '/empresas/:empresaId/matches',
  verificarToken,
  verificarEmpresa,
  listarFreelancersComMatchDaEmpresa
);

/**
 * Freelancer -> lista vagas compatíveis
 * GET /api/freelancers/:freelancerId/matches
 */
router.get(
  '/freelancers/:freelancerId/matches',
  verificarToken,
  verificarFreelancer,
  listarVagasCompativeisParaFreelancer // <-- usa o mesmo nome importado
);

module.exports = router;
