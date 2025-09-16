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

// ===== ROTAS PARA FREELANCERS =====

// Freelancer se candidatar a uma vaga
router.post('/', verificarToken, verificarFreelancer, candidatarSe);

// Freelancer listar suas candidaturas
router.get('/minhas', verificarToken, verificarFreelancer, minhasCandidaturas);

// Freelancer ver detalhes de sua candidatura
router.get('/:id', verificarToken, verificarFreelancer, detalhesCandidatura);

// Freelancer cancelar sua candidatura
router.delete('/:id', verificarToken, verificarFreelancer, cancelarCandidatura);

// ===== ROTAS PARA EMPRESAS =====

// Empresa ver candidatos de uma vaga específica
router.get('/vaga/:vaga_id', verificarToken, verificarEmpresa, candidatosVaga);

// Empresa atualizar status de uma candidatura
router.patch('/:id/status', verificarToken, verificarEmpresa, atualizarStatusCandidatura);

// Empresa ver detalhes de uma candidatura específica
router.get('/empresa/:id', verificarToken, verificarEmpresa, detalhesCandidatura);

// ===== ROTA MISTA (FREELANCER OU EMPRESA) =====

// Ver detalhes de candidatura (determina automaticamente pelo middleware)
router.get('/detalhes/:id', verificarToken, (req, res, next) => {
  // Middleware que aceita tanto freelancer quanto empresa
  if (req.freelancer || req.empresa) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Acesso negado'
    });
  }
}, detalhesCandidatura);

module.exports = router;