const express = require('express');
const { 
  criarVaga,
  listarVagas,
  buscarVagaPorId,
  minhasVagas,
  atualizarVaga,
  alterarStatusVaga
} = require('../controllers/vagasController');
const { verificarToken, verificarEmpresa } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas
router.get('/', listarVagas); // Listar vagas ativas (com filtros)
router.get('/:id', buscarVagaPorId); // Buscar vaga por ID (público)

// Rotas protegidas - APENAS EMPRESAS
router.post('/', verificarToken, verificarEmpresa, criarVaga); // Criar vaga
router.get('/empresa/minhas', verificarToken, verificarEmpresa, minhasVagas); // Minhas vagas
router.put('/:id', verificarToken, verificarEmpresa, atualizarVaga); // Atualizar vaga
router.patch('/:id/status', verificarToken, verificarEmpresa, alterarStatusVaga); // Alterar status

module.exports = router;