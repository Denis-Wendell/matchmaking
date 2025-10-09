// src/controllers/matchController.js
const { Op, fn, col, where } = require('sequelize');
const Vaga = require('../models/Vaga');
const Freelancer = require('../models/Freelancer');

/* ===== Normalizadores ===== */
const deburr = (s) =>
  (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const normalize = (s) => deburr(String(s || '').toLowerCase().trim());

const normalizarModalidade = (v) => {
  if (!v) return null;
  const s = normalize(v);
  const map = {
    remoto: 'remoto', remote: 'remoto',
    presencial: 'presencial', onsite: 'presencial', local: 'presencial',
    hibrido: 'hibrido', 'híbrido': 'hibrido', hybrid: 'hibrido', misto: 'hibrido'
  };
  return map[s] || null;
};

const normalizarNivel = (v) => {
  if (!v) return null;
  const s = normalize(v);
  const map = {
    junior: 'junior', 'júnior': 'junior',
    pleno: 'pleno',
    senior: 'senior', 'sênior': 'senior',
    especialista: 'especialista'
  };
  return map[s] || null;
};

const toArr = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === 'string') {
    return v.split(/[\n,;•|/]+/g).map((x) => x.trim()).filter(Boolean);
  }
  return [];
};

const uniqNormalized = (list) =>
  Array.from(new Set(list.map((x) => normalize(x)).filter(Boolean)));

const tokenizarTexto = (txt) => {
  const base = normalize(txt);
  if (!base) return [];
  return Array.from(
    new Set(
      base
        .split(/[^a-z0-9#.]+/g)
        .map((t) => t.replace(/^#+/, ''))
        .filter((t) => t.length >= 2)
    )
  );
};

const intersectSize = (A = [], B = []) => {
  const S = new Set(A);
  let c = 0;
  for (const x of B) if (S.has(x)) c += 1;
  return c;
};

/* ===== Features (sem IA) ===== */
const buildFreelaFeatures = (f) => {
  const skillsArray = toArr(f.skills_array);
  const principais = toArr(f.principais_habilidades);
  const resumoTokens = tokenizarTexto(f.resumo_profissional);
  const expTokens = tokenizarTexto(f.experiencia_profissional);
  return uniqNormalized([
    ...skillsArray,
    ...principais,
    ...resumoTokens,
    ...expTokens,
  ]);
};

const buildVagaFeatures = (v) => {
  const obr = toArr(v.skills_obrigatorias);
  const des = toArr(v.skills_desejaveis);
  const habTec = toArr(v.habilidades_tecnicas);
  const reqObr = toArr(v.requisitos_obrigatorios);
  const reqDes = toArr(v.requisitos_desejados);
  const descTokens = tokenizarTexto(v.descricao_geral);
  const palavrasChave = toArr(v.palavras_chave);
  return uniqNormalized([
    ...obr,
    ...des,
    ...habTec,
    ...reqObr,
    ...reqDes,
    ...descTokens,
    ...palavrasChave,
  ]);
};

/* ===== Scoring ===== */
const scoreFreelaVaga = (f, v, cacheVagaFeat = new Map(), cacheFreelaFeat = new Map()) => {
  let score = 0;

  // área — 20
  if (f.area_atuacao && v.area_atuacao && normalize(f.area_atuacao) === normalize(v.area_atuacao)) {
    score += 20;
  }

  // nível — 15
  if (f.nivel_experiencia && v.nivel_experiencia && normalizarNivel(f.nivel_experiencia) === normalizarNivel(v.nivel_experiencia)) {
    score += 15;
  }

  // modalidade — 10
  if (f.modalidade_trabalho && v.modalidade_trabalho && normalizarModalidade(f.modalidade_trabalho) === normalizarModalidade(v.modalidade_trabalho)) {
    score += 10;
  }

  // idiomas — 5
  const fIdiomas = uniqNormalized(toArr(f.idiomas));
  const vIdiomas = uniqNormalized(toArr(v.idiomas_necessarios));
  if (fIdiomas.length && vIdiomas.length) {
    const interI = intersectSize(new Set(fIdiomas), vIdiomas);
    score += Math.min(5, Math.round((interI / vIdiomas.length) * 5));
  }

  // features (skills + texto) — 50
  let fFeat = cacheFreelaFeat.get(f.id);
  if (!fFeat) {
    fFeat = buildFreelaFeatures(f);
    cacheFreelaFeat.set(f.id, fFeat);
  }

  let vFeat = cacheVagaFeat.get(v.id);
  if (!vFeat) {
    vFeat = buildVagaFeatures(v);
    cacheVagaFeat.set(v.id, vFeat);
  }

  const inter = intersectSize(new Set(fFeat), vFeat);
  if (vFeat.length > 0) {
    score += Math.min(50, Math.round((inter / vFeat.length) * 50));
  }

  // clamp
  score = Math.max(0, Math.min(100, score));

  // pequeno “empurrão” se tem algum alinhamento textual mas vFeat é muito grande
  if (score === 0 && inter > 0) score = 5;

  return score;
};

/* ===== Controller =====
   GET /api/empresas/:empresaId/matches?pagina=1&limite=12&area=...&modalidade=...&nivel=...&busca=...
*/
exports.listarFreelancersComMatchDaEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.params;

    // paginação (será aplicada DEPOIS do sort)
    const pagina = Math.max(parseInt(req.query.pagina || '1', 10), 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite || '12', 10), 1), 100);

    const { area, modalidade, nivel, busca } = req.query;

    // 1) Vagas da empresa (filtra status “ativo/aberta/publicada” em JS para não bater no ENUM)
    const vagasAll = await Vaga.findAll({
      where: { empresa_id: empresaId },
      attributes: [
        'id', 'titulo', 'area_atuacao', 'nivel_experiencia', 'modalidade_trabalho',
        'skills_obrigatorias', 'skills_desejaveis', 'habilidades_tecnicas',
        'requisitos_obrigatorios', 'requisitos_desejados', 'descricao_geral',
        'palavras_chave', 'idiomas_necessarios', 'status'
      ],
      order: [['created_at', 'DESC']],
    });

    const enumVals = Vaga.rawAttributes?.status?.values || [];
    const desejados = ['aberta', 'ativa', 'ativo', 'publicada', 'publica', 'em_andamento', 'em andamento'];
    const setAtivos = enumVals.length
      ? new Set(enumVals.map(normalize).filter((v) => desejados.includes(v)))
      : new Set(['aberta', 'ativa', 'ativo', 'publicada']);

    const vagas = vagasAll.filter((v) => setAtivos.has(normalize(v.status)));

    if (vagas.length === 0) {
      return res.json({
        success: true,
        message: 'Sem vagas ativas para calcular match',
        data: {
          freelancers: [],
          total: 0,
          totalPaginas: 1,
          pagina,
          limite,
        },
      });
    }

    // 2) Monta WHERE de freelancers com filtros do front (sem paginação aqui!)
    const whereBase = { status: 'ativo' };

    if (area && area !== 'todas') {
      whereBase.area_atuacao = { [Op.iLike]: `%${area}%` };
    }

    const mod = normalizarModalidade(modalidade);
    if (mod) whereBase.modalidade_trabalho = mod;

    const niv = normalizarNivel(nivel);
    if (niv) whereBase.nivel_experiencia = niv;

    const andBusca = [];
    if (busca && String(busca).trim()) {
      const q = String(busca).trim();
      const term = `%${q}%`;
      andBusca.push({
        [Op.or]: [
          { nome: { [Op.iLike]: term } },
          { email: { [Op.iLike]: term } },
          { profissao: { [Op.iLike]: term } },
          { area_atuacao: { [Op.iLike]: term } },
          { cidade: { [Op.iLike]: term } },
          { estado: { [Op.iLike]: term } },
          { resumo_profissional: { [Op.iLike]: term } },
          { experiencia_profissional: { [Op.iLike]: term } },
          { certificacoes: { [Op.iLike]: term } },
          { principais_habilidades: { [Op.iLike]: term } },
          // arrays → concatena para busca textual
          where(fn('array_to_string', col('skills_array'), ','), { [Op.iLike]: term }),
          where(fn('array_to_string', col('idiomas'), ','), { [Op.iLike]: term }),
        ],
      });
    }

    const whereFinal = andBusca.length ? { [Op.and]: [whereBase, ...andBusca] } : whereBase;

    // 3) Busca TODOS os freelancers (sem limit/offset) para calcular e ordenar pelo match
    const freelas = await Freelancer.findAll({
      where: whereFinal,
      attributes: { exclude: ['senha_hash'] },
      // sem order, sem limit/offset — a ordenação será por match
    });

    // 4) Calcula melhor match por vaga para cada freelancer
    const cacheVagaFeat = new Map();
    const cacheFreelaFeat = new Map();

    const resultados = freelas.map((f) => {
      let best = { pct: 0, vagaId: null, vagaTitulo: null };
      for (const v of vagas) {
        const pct = scoreFreelaVaga(f, v, cacheVagaFeat, cacheFreelaFeat);
        if (pct > best.pct) best = { pct, vagaId: v.id, vagaTitulo: v.titulo };
      }
      const json = f.toJSON();
      return {
        ...json,
        match_pct: best.pct,
        melhor_vaga_id: best.vagaId,
        melhor_vaga_titulo: best.vagaTitulo,
      };
    });

    // 5) Ordena por match desc
    resultados.sort((a, b) => (b.match_pct || 0) - (a.match_pct || 0));

    // 6) Pagina agora
    const total = resultados.length;
    const totalPaginas = Math.max(Math.ceil(total / limite), 1);
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;
    const pageItems = resultados.slice(inicio, fim);

    return res.json({
      success: true,
      message: 'Freelancers com melhor match por vaga da empresa',
      data: {
        freelancers: pageItems,
        total,
        totalPaginas,
        pagina,
        limite,
      },
    });
  } catch (err) {
    console.error('Erro match empresa:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao calcular matches',
    });
  }
};
