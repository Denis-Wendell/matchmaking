// src/controllers/empresaController.js
const { Op } = require('sequelize');
const Empresa = require('../models/Empresa');
const Vaga = require('../models/Vaga');
const Freelancer = require('../models/Freelancer');

/* ========= COMPAT LAYER (entrada) =========
   Mapeia valores que o front pode enviar para
   o formato que o BD atual aceita.
*/
const mapInEmpresaStatus = (v) => {
  if (!v) return undefined;
  const s = String(v).toLowerCase().trim();
  const map = {
    'ativo': 'ativa',
    'ativa': 'ativa',
    'inativo': 'inativa',
    'inativa': 'inativa',
    'pendente': 'pendente',
    'bloqueado': 'bloqueada',
    'bloqueada': 'bloqueada',
  };
  return map[s] || 'ativa';
};

const mapInTamanhoEmpresa = (v) => {
  if (!v) return undefined;
  const t = String(v).toLowerCase().trim();
  const map = {
    'startup': 'Startup',
    'pequena': 'Pequena',
    'pequeno': 'Pequena',
    'small': 'Pequena',
    'media': 'Média',
    'média': 'Média',
    'medio': 'Média',
    'médio': 'Média',
    'medium': 'Média',
    'grande': 'Grande',
    'big': 'Grande',
    'large': 'Grande',
    'multinacional': 'Multinacional',
    'multinational': 'Multinacional',
  };
  return map[t] || 'Pequena';
};

const toArray = (val) => {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    // aceita "a,b,c" ou "a; b; c"
    return val.split(/[;,]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

/* ========= Helpers de Match ========= */
const toArr = (v) => Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);
const norm = (s) => (s || '').toString().trim().toLowerCase();
const uniq = (arr) => Array.from(new Set(arr.map((x) => norm(x)))).filter(Boolean);

/** Constrói um vetor “skills” limpo do freelancer */
function getFreelaSkills(f) {
  const base = [
    ...(toArr(f.skills_array)),
    ...(norm(f.principais_habilidades || '').split(/[,\|;\/]/g)),
  ];
  return uniq(base);
}

/** Constrói um vetor “requisitos/tecnologias” da vaga */
function getVagaReqs(v) {
  const base = [
    ...(toArr(v.requisitos_tecnicos)),
    ...(toArr(v.tecnologias_usadas)),
    ...(norm(v.requisitos || '').split(/[,\|;\/]/g)),
  ];
  return uniq(base);
}

/** Score simples: interseção de skills x requisitos, + match de área e nível */
function scoreFreelaParaVaga(f, v) {
  const skillsF = getFreelaSkills(f);
  const reqsV  = getVagaReqs(v);

  // Interseção
  let inter = 0;
  if (skillsF.length && reqsV.length) {
    const setV = new Set(reqsV);
    for (const s of skillsF) if (setV.has(norm(s))) inter++;
  }
  const denom = Math.max(reqsV.length, 1);
  const skillScore = inter / denom; // 0..1

  // Área e nível (quando existirem em ambos)
  const areaMatch = norm(f.area_atuacao) && norm(v.area)
    ? (norm(f.area_atuacao) === norm(v.area) ? 1 : 0)
    : 0;

  const nivelMatch = norm(f.nivel_experiencia) && norm(v.nivel)
    ? (norm(f.nivel_experiencia) === norm(v.nivel) ? 1 : 0)
    : 0;

  // Pesos (ajuste livre)
  const wSkills = 0.6;
  const wArea   = 0.2;
  const wNivel  = 0.2;

  const score = (skillScore * wSkills) + (areaMatch * wArea) + (nivelMatch * wNivel);
  return Math.round(score * 100); // 0..100
}

// Listar todas as empresas
const listarEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.findAll({
      where: { status: 'ativa' }, // BD atual usa 'ativa'
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['senha_hash'] }
    });

    res.json({
      success: true,
      message: 'Empresas listadas com sucesso',
      data: empresas,
    });

  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar empresa por ID
const buscarEmpresaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const empresa = await Empresa.findByPk(id, {
      attributes: { exclude: ['senha_hash'] }
    });

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Empresa encontrada',
      data: empresa,
    });

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Atualizar perfil da empresa
const atualizarPerfil = async (req, res) => {
  try {
    const empresaId = req.empresa.id;
    const dadosParaAtualizar = { ...req.body };

    // Remover campos que não devem ser atualizados diretamente
    delete dadosParaAtualizar.id;
    delete dadosParaAtualizar.senha_hash;
    delete dadosParaAtualizar.email_corporativo;
    delete dadosParaAtualizar.cnpj;
    delete dadosParaAtualizar.created_at;
    delete dadosParaAtualizar.updated_at;

    // COMPAT: status e tamanho_empresa para o formato do BD atual
    if (dadosParaAtualizar.status != null) {
      dadosParaAtualizar.status = mapInEmpresaStatus(dadosParaAtualizar.status);
    }
    if (dadosParaAtualizar.tamanho_empresa != null) {
      dadosParaAtualizar.tamanho_empresa = mapInTamanhoEmpresa(dadosParaAtualizar.tamanho_empresa);
    }

    // Garantir arrays quando vierem string
    if (dadosParaAtualizar.areas_atuacao != null) {
      dadosParaAtualizar.areas_atuacao = toArray(dadosParaAtualizar.areas_atuacao);
    }
    if (dadosParaAtualizar.beneficios_array != null) {
      dadosParaAtualizar.beneficios_array = toArray(dadosParaAtualizar.beneficios_array);
    }
    if (dadosParaAtualizar.tecnologias_usadas != null) {
      dadosParaAtualizar.tecnologias_usadas = toArray(dadosParaAtualizar.tecnologias_usadas);
    }

    const [numLinhasAfetadas, empresasAtualizadas] = await Empresa.update(
      dadosParaAtualizar,
      {
        where: { id: empresaId },
        returning: true,
      }
    );

    if (numLinhasAfetadas === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
    }

    const empresaAtualizada = empresasAtualizadas[0];

    res.json({
      success: true,
      message: 'Perfil da empresa atualizado com sucesso',
      data: empresaAtualizada,
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil da empresa:', error);

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar meu perfil de empresa
const meuPerfil = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Perfil da empresa',
      data: req.empresa,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar empresas por setor
const buscarPorSetor = async (req, res) => {
  try {
    const { setor } = req.params;

    const empresas = await Empresa.findAll({
      where: { 
        setor_atuacao: setor,
        status: 'ativa' // BD atual
      },
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['senha_hash'] }
    });

    res.json({
      success: true,
      message: `Empresas do setor ${setor} listadas com sucesso`,
      data: empresas,
    });

  } catch (error) {
    console.error('Erro ao buscar empresas por setor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar empresas verificadas
const buscarVerificadas = async (req, res) => {
  try {
    const empresas = await Empresa.findAll({
      where: { 
        verificada: true,
        status: 'ativa' // BD atual
      },
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['senha_hash'] }
    });

    res.json({
      success: true,
      message: 'Empresas verificadas listadas com sucesso',
      data: empresas,
    });

  } catch (error) {
    console.error('Erro ao buscar empresas verificadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

/**
 * GET /api/empresas/:empresaId/matches
 * Requer: verificarToken + verificarEmpresa
 * Somente a própria empresa pode consultar
 * Query:
 *   - pagina, limite (paginaçao de freelancers)
 *   - status (status de freelancer, default 'ativo')
 */
const listarMatchesEmpresa = async (req, res) => {
  try {
    const empresaIdParam = req.params.empresaId;
    const empresaAuthId  = req.empresa?.id;

    if (!empresaAuthId || empresaAuthId !== empresaIdParam) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: empresa inválida',
      });
    }

    const pagina = Math.max(parseInt(req.query.pagina || '1', 10), 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite || '12', 10), 1), 100);
    const offset = (pagina - 1) * limite;

    const statusFreela = (req.query.status || 'ativo').toLowerCase().trim();

    // Vagas ativas da empresa
    const vagas = await Vaga.findAll({
      where: {
        [Op.and]: [
          { empresa_id: empresaIdParam },
          // aceita 'ativa' ou 'ativo' ou 'publicada'
          { status: { [Op.in]: ['ativa', 'ativo', 'publicada'] } },
        ],
      },
      order: [['created_at', 'DESC']],
    });

    if (!vagas || vagas.length === 0) {
      return res.json({
        success: true,
        message: 'Sem vagas ativas para calcular matches',
        data: {
          freelancers: [],
          total: 0,
          totalPaginas: 1,
          pagina,
          limite,
        },
      });
    }

    const { rows, count } = await Freelancer.findAndCountAll({
      where: { status: statusFreela },
      limit: limite,
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['senha_hash'] },
    });

    const enriched = rows.map((f) => {
      let best = { vagaId: null, titulo: null, score: 0 };
      for (const v of vagas) {
        const s = scoreFreelaParaVaga(f, v);
        if (s > best.score) {
          best = { vagaId: v.id, titulo: v.titulo || v.nome || 'Vaga', score: s };
        }
      }
      return {
        ...f.toJSON(),
        match_percent: best.score,
        match_vaga: { id: best.vagaId, titulo: best.titulo },
      };
    });

    enriched.sort((a, b) => (b.match_percent || 0) - (a.match_percent || 0));

    return res.json({
      success: true,
      message: 'Matches calculados com sucesso',
      data: {
        freelancers: enriched,
        total: count,
        totalPaginas: Math.max(Math.ceil(count / limite), 1),
        pagina,
        limite,
      },
    });
  } catch (err) {
    console.error('Erro ao calcular matches da empresa:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao calcular matches',
    });
  }
};

module.exports = {
  listarEmpresas,
  buscarEmpresaPorId,
  atualizarPerfil,
  meuPerfil,
  buscarPorSetor,
  buscarVerificadas,
  listarMatchesEmpresa, // << novo export
};
