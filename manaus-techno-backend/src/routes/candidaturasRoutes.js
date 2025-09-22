const express = require('express');
const {
  candidatarSe,
  minhasCandidaturas,
  candidatosVaga,
  atualizarStatusCandidatura,
  detalhesCandidatura,
  cancelarCandidatura,
} = require('../controllers/candidaturasController');
const { verificarToken, verificarFreelancer, verificarEmpresa } = require('../middleware/auth');

const router = express.Router();

/* ===================== FREELANCER ===================== */

// Candidatar-se
router.post('/', verificarToken, verificarFreelancer, candidatarSe);

// Minhas candidaturas
router.get('/minhas', verificarToken, verificarFreelancer, minhasCandidaturas);

// Cancelar minha candidatura
router.delete('/:id', verificarToken, verificarFreelancer, cancelarCandidatura);

// *** Detalhes (freelancer) – usar caminho mais específico para não conflitar ***
router.get('/freelancer/:id', verificarToken, verificarFreelancer, detalhesCandidatura);


/* ===================== EMPRESA ===================== */

// Candidatos de uma vaga específica
router.get('/vaga/:vaga_id', verificarToken, verificarEmpresa, candidatosVaga);

// Atualizar status de uma candidatura
router.patch('/:id/status', verificarToken, verificarEmpresa, atualizarStatusCandidatura);

// Detalhes de uma candidatura (empresa)
router.get('/empresa/:id', verificarToken, verificarEmpresa, detalhesCandidatura);


/* ============== ROTA MISTA (EMPRESA OU FREELANCER) ============== */
// Se quiser manter uma rota mista, deixe-a por último (mais genérica)
router.get('/detalhes/:id', verificarToken, (req, res, next) => {
  if (req.freelancer || req.empresa) return next();
  return res.status(403).json({ success: false, message: 'Acesso negado' });
}, detalhesCandidatura);

module.exports = router;