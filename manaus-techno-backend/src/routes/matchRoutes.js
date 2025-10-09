// routes/matchRoutes.js
const express = require('express');
const { verificarToken, verificarEmpresa } = require('../middleware/auth');
const { listarFreelancersComMatchDaEmpresa } = require('../controllers/matchController');

const router = express.Router();
router.get('/empresas/:empresaId/matches', verificarToken, verificarEmpresa, listarFreelancersComMatchDaEmpresa);

module.exports = router;
