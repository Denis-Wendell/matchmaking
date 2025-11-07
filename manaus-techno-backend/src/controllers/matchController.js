// src/controllers/matchController.js
const { Op } = require('sequelize');
const { Vaga, Empresa, Freelancer, Candidatura } = require('../models');

/* ===== Config IA e performance ===== */
let openai = null;

/** Toggle IA */
const AI_DEFAULT_ON = true;    // embeddings ligados por padrão
const LLM_DEFAULT_ON = false;  // LLM (re-rank) desligado por padrão p/ reduzir latência

/** Limites de rerank */
const EMBED_TOP_K = 40;        // só as Top K (por score_base) recebem embeddings
const LLM_TOP_N   = 8;         // só as Top N recebem LLM (se ligado)

/** Pesos do score final */
const WEIGHT_EMBED = 0.45;
const WEIGHT_LLM   = 0.25;     // como LLM vem desligado, esse peso só entra se LLM for ligado
// peso_base = 1 - (embed + llm)

/** Concurrency p/ OpenAI */
const EMBEDDING_CONCURRENCY = 3;

try {
  const OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (_) {
  // sem openai
}

/* ===== Utils ===== */
const deburr = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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

const normalizarTipoContrato = (v) => {
  if (!v) return null;
  const s = normalize(v);
  const map = {
    clt: 'clt',
    pj: 'pj',
    freelancer: 'freelancer',
    temporario: 'temporario', 'temporário': 'temporario', temp: 'temporario',
    estagio: 'estagio', 'estágio': 'estagio', intern: 'estagio'
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
  return Array.from(new Set(
    base
      .split(/[^a-z0-9#.]+/g)
      .map((t) => t.replace(/^#+/, ''))
      .filter((t) => t.length >= 2)
  ));
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
  const idiomas = uniqNormalized(toArr(f.idiomas));
  return uniqNormalized([
    ...skillsArray,
    ...principais,
    ...resumoTokens,
    ...expTokens,
    ...idiomas,
    f.profissao,
    f.area_atuacao,
    f.nivel_experiencia,
    f.modalidade_trabalho,
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
  const idiomas = uniqNormalized(toArr(v.idiomas_necessarios));
  return uniqNormalized([
    ...obr,
    ...des,
    ...habTec,
    ...reqObr,
    ...reqDes,
    ...descTokens,
    ...palavrasChave,
    ...idiomas,
    v.titulo,
    v.area_atuacao,
    v.nivel_experiencia,
    v.modalidade_trabalho,
    v.tipo_contrato,
  ]);
};

/* ===== Consolidação de texto (para IA) ===== */
const textoDoFreelancer = (f) => {
  const parts = [
    `Nome: ${f.nome || ''}`,
    `Profissão: ${f.profissao || ''}`,
    `Área: ${f.area_atuacao || ''}`,
    `Nível: ${normalizarNivel(f.nivel_experiencia) || f.nivel_experiencia || ''}`,
    `Modalidade: ${normalizarModalidade(f.modalidade_trabalho) || f.modalidade_trabalho || ''}`,
    `Skills: ${toArr(f.skills_array).join(', ') || f.principais_habilidades || ''}`,
    `Idiomas: ${toArr(f.idiomas).join(', ')}`,
    `Resumo: ${f.resumo_profissional || ''}`,
    `Experiência: ${f.experiencia_profissional || ''}`,
    `Certificações: ${f.certificacoes || ''}`,
    `Objetivos: ${f.objetivos_profissionais || ''}`,
  ];
  return parts.join('\n').slice(0, 1500);
};

const textoDaVaga = (v) => {
  const parts = [
    `Título: ${v.titulo || ''}`,
    `Área: ${v.area_atuacao || ''}`,
    `Nível: ${normalizarNivel(v.nivel_experiencia) || v.nivel_experiencia || ''}`,
    `Modalidade: ${normalizarModalidade(v.modalidade_trabalho) || v.modalidade_trabalho || ''}`,
    `Tipo de contrato: ${v.tipo_contrato || ''}`,
    `Skills obrigatórias: ${toArr(v.skills_obrigatorias).join(', ')}`,
    `Skills desejáveis: ${toArr(v.skills_desejaveis).join(', ')}`,
    `Requisitos: ${toArr(v.requisitos_obrigatorios).concat(toArr(v.requisitos_desejados)).join(', ')}`,
    `Idiomas: ${toArr(v.idiomas_necessarios).join(', ')}`,
    `Descrição: ${v.descricao_geral || ''}`,
    `Palavras-chave: ${toArr(v.palavras_chave).join(', ')}`,
  ];
  return parts.join('\n').slice(0, 1500);
};

/* ===== Scoring base (regras) ===== */
const scoreBaseFreelaVaga = (f, v, cacheVagaFeat = new Map(), cacheFreelaFeat = new Map()) => {
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

  // pequeno “empurrão” se tem algum alinhamento textual
  if (score === 0 && inter > 0) score = 5;

  return score;
};

/* ===== IA: Embeddings + Cosine ===== */
const cosine = (a = [], b = []) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return (na && nb) ? (dot / (Math.sqrt(na) * Math.sqrt(nb))) : 0;
};

const getEmbedding = async (text) => {
  if (!openai) return null;
  const clean = (text || '').slice(0, 2000);
  const resp = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: clean
  });
  return resp?.data?.[0]?.embedding || null;
};

/* ===== Cache simples de embeddings (memória) ===== */
const embedCache = new Map(); // chave: `${tipo}:${id}|${updatedAt}` -> vetor
const getCachedEmbedding = async (key, textProducer) => {
  if (embedCache.has(key)) return embedCache.get(key);
  const txt = await textProducer();
  const emb = await getEmbedding(txt);
  embedCache.set(key, emb);
  return emb;
};

/* ===== Execução com concorrência limitada ===== */
async function mapWithConcurrency(items, worker, concurrency = 3) {
  const results = new Array(items.length);
  let i = 0;
  async function next() {
    const idx = i++;
    if (idx >= items.length) return;
    try {
      results[idx] = await worker(items[idx], idx);
    } catch (e) {
      results[idx] = null;
    }
    return next();
  }
  const starters = Array(Math.min(concurrency, items.length)).fill(0).map(next);
  await Promise.all(starters);
  return results;
}

/* ===== IA: Rerank com LLM (opcional) ===== */
const llmRerankScores = async (freelaTxt, vagasCompacts) => {
  if (!openai || vagasCompacts.length === 0) return [];
  const itens = vagasCompacts.map((v, i) => (
    `#${i+1}\nID:${v.id}\nTítulo:${v.titulo}\nNível:${v.nivel}\nModalidade:${v.modalidade}\nSkills:${v.skills}\nReq:${v.req}\nDesc:${v.desc}`
  )).join('\n\n');

  const prompt = `
Você é um avaliador de compatibilidade entre PERFIL e VAGAS. 
Retorne uma nota de 0 a 100 para cada vaga considerando adequação semântica (sinônimos, contexto, senioridade, responsabilidades, stack).

PERFIL:
${freelaTxt}

VAGAS:
${itens}

Responda em JSON, uma lista de objetos { "id": "<ID>", "score": <0..100> } na MESMA ordem de apresentação das vagas (use o ID fornecido).
`.trim();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = completion.choices?.[0]?.message?.content?.trim() || '[]';
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* ===== Status ativos para vaga ===== */
const vagaEstaAtiva = (v, enumVals = []) => {
  const desejados = ['aberta', 'ativa', 'ativo', 'publicada', 'publica', 'em_andamento', 'em andamento'];
  const setAtivos = enumVals.length
    ? new Set(enumVals.map(normalize).filter((x) => desejados.includes(x)))
    : new Set(['aberta', 'ativa', 'ativo', 'publicada']);
  return setAtivos.has(normalize(v.status));
};

/* =======================================================================
   A) EMPRESA → lista freelancers com melhor match
   GET /api/empresas/:empresaId/matches?pagina=1&limite=12&ai=on|off&llm=on|off
   ======================================================================= */
exports.listarFreelancersComMatchDaEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.params;

    const pagina = Math.max(parseInt(req.query.pagina || '1', 10), 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite || '12', 10), 1), 100);

    const { area, modalidade, nivel } = req.query; // <-- sem 'busca'
    const useEmbed = String(req.query.ai || (AI_DEFAULT_ON ? 'on' : 'off')).toLowerCase() === 'on';
    const useLLM   = String(req.query.llm || (LLM_DEFAULT_ON ? 'on' : 'off')).toLowerCase() === 'on';

    // Vagas da empresa
    const vagasAll = await Vaga.findAll({
      where: { empresa_id: empresaId },
      attributes: [
        'id','titulo','area_atuacao','nivel_experiencia','modalidade_trabalho','tipo_contrato',
        'skills_obrigatorias','skills_desejaveis','habilidades_tecnicas',
        'requisitos_obrigatorios','requisitos_desejados','descricao_geral',
        'palavras_chave','idiomas_necessarios','status','created_at','updated_at'
      ],
      order: [['created_at', 'DESC']]
    });

    const enumVals = Vaga.rawAttributes?.status?.values || [];
    const vagas = vagasAll.filter((v) => vagaEstaAtiva(v, enumVals));
    if (vagas.length === 0) {
      return res.json({
        success: true,
        message: 'Sem vagas ativas para calcular match',
        data: { freelancers: [], total: 0, totalPaginas: 1, pagina, limite }
      });
    }

    // Filtros de freelancer (sem busca textual)
    const whereBase = { status: 'ativo' };
    const whereV = { empresa_id: empresaId }; 
    
    if (area && area !== 'todas') whereBase.area_atuacao = { [Op.iLike]: `%${area}%` };
    const mod = normalizarModalidade(modalidade); if (mod) whereBase.modalidade_trabalho = mod;
    const niv = normalizarNivel(nivel); if (niv) whereBase.nivel_experiencia = niv;

    const freelas = await Freelancer.findAll({
      where: whereBase,
      attributes: { exclude: ['senha_hash'] }
    });

    // 1) Base score (rápido)
    const cacheVagaFeat = new Map();
    const cacheFreelaFeat = new Map();

    let baseRank = freelas.map((f) => {
      let best = { base: 0, vaga: null };
      for (const v of vagas) {
        const base = scoreBaseFreelaVaga(f, v, cacheVagaFeat, cacheFreelaFeat);
        if (base > best.base) best = { base, vaga: v };
      }
      return {
        freela: f,
        _score_base: best.base,
        _melhor_vaga: best.vaga,
      };
    });

    // Ordena por base
    baseRank.sort((a, b) => (b._score_base || 0) - (a._score_base || 0));

    // 2) Embeddings no Top K (se ligado)
    if (useEmbed && openai && baseRank.length) {
      const topK = baseRank.slice(0, EMBED_TOP_K);

      const freelaEmbeds = await mapWithConcurrency(topK, async (row) => {
        const f = row.freela;
        const key = `fre:${f.id}|${f.updated_at || ''}`;
        return getCachedEmbedding(key, async () => textoDoFreelancer(f));
      }, EMBEDDING_CONCURRENCY);

      const vagaEmbeds = await mapWithConcurrency(topK, async (row) => {
        const v = row._melhor_vaga;
        if (!v) return null;
        const key = `vaga:${v.id}|${v.updated_at || ''}`;
        return getCachedEmbedding(key, async () => textoDaVaga(v));
      }, EMBEDDING_CONCURRENCY);

      topK.forEach((row, idx) => {
        const fEmb = freelaEmbeds[idx];
        const vEmb = vagaEmbeds[idx];
        let sem = 0;
        if (fEmb && vEmb) {
          const cos = cosine(fEmb, vEmb);
          sem = Math.round(((cos + 1) / 2) * 100);
        }
        row._score_embed = sem;
      });

      // preenche os demais com 0 (sem embed)
      for (let i = EMBED_TOP_K; i < baseRank.length; i++) baseRank[i]._score_embed = 0;
    } else {
      for (const r of baseRank) r._score_embed = 0;
    }

    // 3) Combinar Base + Embedding
    const wBase = Math.max(0, 1 - WEIGHT_EMBED - WEIGHT_LLM);
    for (const r of baseRank) {
      r._pre_llm = Math.round(wBase * (r._score_base || 0) + WEIGHT_EMBED * (r._score_embed || 0));
    }
    baseRank.sort((a, b) => (b._pre_llm || 0) - (a._pre_llm || 0));

    // 4) LLM (opcional) no Top N
    if (useLLM && openai && baseRank.length) {
      const topN = baseRank.slice(0, LLM_TOP_N);
      const paresTxt = topN.map((x, idx) => (
        `#${idx+1}\nID:${x.freela.id}\n\nPERFIL\n${textoDoFreelancer(x.freela)}\n\nVAGA\n${x._melhor_vaga ? textoDaVaga(x._melhor_vaga) : ''}`
      )).join('\n\n');

      const prompt = `
Você é um avaliador. Para cada par (PERFIL,VAGA) abaixo, dê uma nota de 0..100 de adequação semântica.
Responda JSON como [{"id":"<ID>","score":<0..100>}, ...] na mesma ordem.

${paresTxt}
      `.trim();

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }]
        });
        const text = completion.choices?.[0]?.message?.content?.trim() || '[]';
        const parsed = JSON.parse(text);
        const map = new Map(parsed.map(p => [String(p.id), Number(p.score) || 0]));
        for (const r of topN) r._score_llm = Math.max(0, Math.min(100, map.get(String(r.freela.id)) || 0));
      } catch {
        for (const r of topN) r._score_llm = 0;
      }
      for (let i = LLM_TOP_N; i < baseRank.length; i++) baseRank[i]._score_llm = 0;
    } else {
      for (const r of baseRank) r._score_llm = 0;
    }

    // 5) Score final + sort
    for (const r of baseRank) {
      r.match_pct = Math.round(
        wBase * (r._score_base || 0) +
        WEIGHT_EMBED * (r._score_embed || 0) +
        WEIGHT_LLM   * (r._score_llm || 0)
      );
    }
    baseRank.sort((a, b) => (b.match_pct || 0) - (a.match_pct || 0));

    // 6) Paginação
    const total = baseRank.length;
    const totalPaginas = Math.max(Math.ceil(total / limite), 1);
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;
    const pageItems = baseRank.slice(inicio, fim).map((row) => {
      const f = row.freela.toJSON();
      return {
        ...f,
        match_pct: row.match_pct,
        melhor_vaga_id: row._melhor_vaga?.id || null,
        melhor_vaga_titulo: row._melhor_vaga?.titulo || null,
      };
    });

    return res.json({
      success: true,
      message: 'Freelancers com melhor match por vaga da empresa (rápido + IA opcional)',
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

/* =============================================================================
   B) FREELANCER → vagas compatíveis
   GET /api/freelancers/:freelancerId/matches?pagina=1&limite=12&min_match=0&ai=on|off&llm=on|off
   Filtros: area, nivel, modalidade, tipo (contrato) — sem busca
   ============================================================================ */
exports.listarVagasCompativeisParaFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const pagina = Math.max(parseInt(req.query.pagina || '1', 10), 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite || '12', 10), 1), 100);
    const minMatch = Math.max(parseInt(req.query.min_match || '0', 10), 0);

    const { area, modalidade, nivel, tipo } = req.query; // <-- sem 'busca'
    const useEmbed = String(req.query.ai || (AI_DEFAULT_ON ? 'on' : 'off')).toLowerCase() === 'on';
    const useLLM   = String(req.query.llm || (LLM_DEFAULT_ON ? 'on' : 'off')).toLowerCase() === 'on';

    // Carrega freelancer
    const freelancer = await Freelancer.findByPk(freelancerId, {
      attributes: { exclude: ['senha_hash'] }
    });
    if (!freelancer || freelancer.status !== 'ativo') {
      return res.status(404).json({ success: false, message: 'Freelancer não encontrado ou inativo' });
    }

    // Vagas ativas + filtros (no banco) — sem busca textual
    const whereV = {};
    if (area && area !== 'todas') whereV.area_atuacao = { [Op.iLike]: `%${area}%` };
    const mod = normalizarModalidade(modalidade); if (mod) whereV.modalidade_trabalho = mod;
    const niv = normalizarNivel(nivel); if (niv) whereV.nivel_experiencia = niv;
    const tip = normalizarTipoContrato(tipo); if (tip) whereV.tipo_contrato = tip;

const vagasAll = await Vaga.findAll({
  where: whereV,
  attributes: [
    'id','titulo','area_atuacao','nivel_experiencia','modalidade_trabalho','tipo_contrato',
    'skills_obrigatorias','skills_desejaveis','habilidades_tecnicas',
    'requisitos_obrigatorios','requisitos_desejados','descricao_geral',
    'palavras_chave','idiomas_necessarios','status','created_at','updated_at'
  ],
  include: [{
    model: Empresa,
    as: 'empresa',
    attributes: ['id','nome','cidade','estado','site_empresa','tamanho_empresa','setor_atuacao']
  }],
  order: [['created_at', 'DESC']]
});


    const enumVals = Vaga.rawAttributes?.status?.values || [];
    const vagasAtivas = vagasAll.filter((v) => vagaEstaAtiva(v, enumVals));

    if (vagasAtivas.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhuma vaga ativa encontrado',
        data: { vagas: [], total: 0, totalPaginas: 1, pagina, limite }
      });
    }

    // 1) Base score rápido
    const cacheVagaFeat = new Map();
    const cacheFreelaFeat = new Map();

    let scored = vagasAtivas.map((v) => {
      const base = scoreBaseFreelaVaga(freelancer, v, cacheVagaFeat, cacheFreelaFeat);
      return { vaga: v, _score_base: base };
    });

    // Ordena por base e pega um "corte" para embeddings
    scored.sort((a, b) => (b._score_base || 0) - (a._score_base || 0));

    // 2) Embeddings Top K
    if (useEmbed && openai && scored.length) {
      const topK = scored.slice(0, EMBED_TOP_K);

      const fKey = `fre:${freelancer.id}|${freelancer.updated_at || ''}`;
      const fEmb = await getCachedEmbedding(fKey, async () => textoDoFreelancer(freelancer));

      const vagaEmbeds = await mapWithConcurrency(topK, async (row) => {
        const v = row.vaga;
        const key = `vaga:${v.id}|${v.updated_at || ''}`;
        return getCachedEmbedding(key, async () => textoDaVaga(v));
      }, EMBEDDING_CONCURRENCY);

      topK.forEach((row, idx) => {
        const vEmb = vagaEmbeds[idx];
        let sem = 0;
        if (fEmb && vEmb) {
          const cos = cosine(fEmb, vEmb);
          sem = Math.round(((cos + 1) / 2) * 100);
        }
        row._score_embed = sem;
      });

      for (let i = EMBED_TOP_K; i < scored.length; i++) scored[i]._score_embed = 0;
    } else {
      for (const r of scored) r._score_embed = 0;
    }

    // 3) Combinar Base + Embedding
    const wBase = Math.max(0, 1 - WEIGHT_EMBED - WEIGHT_LLM);
    for (const r of scored) {
      r._pre_llm = Math.round(wBase * (r._score_base || 0) + WEIGHT_EMBED * (r._score_embed || 0));
    }
    scored.sort((a, b) => (b._pre_llm || 0) - (a._pre_llm || 0));

    // 4) LLM Top N (opcional)
    if (useLLM && openai && scored.length) {
      const topN = scored.slice(0, LLM_TOP_N);
      const compacts = topN.map((x) => ({
        id: x.vaga.id,
        titulo: x.vaga.titulo,
        nivel: x.vaga.nivel_experiencia,
        modalidade: x.vaga.modalidade_trabalho,
        skills: toArr(x.vaga.skills_obrigatorias).join(', '),
        req: toArr(x.vaga.requisitos_obrigatorios).join(', '),
        desc: (x.vaga.descricao_geral || '').slice(0, 1000)
      }));
      const llmScores = await llmRerankScores(textoDoFreelancer(freelancer), compacts);
      const map = new Map(llmScores.map(x => [x.id, Number(x.score) || 0]));
      for (const r of topN) r._score_llm = Math.max(0, Math.min(100, map.get(r.vaga.id) || 0));
      for (const r of scored.slice(LLM_TOP_N)) r._score_llm = 0;
    } else {
      for (const r of scored) r._score_llm = 0;
    }

    // 5) Score final + sort
    for (const r of scored) {
      r.match_pct = Math.round(
        wBase * (r._score_base || 0) +
        WEIGHT_EMBED * (r._score_embed || 0) +
        WEIGHT_LLM   * (r._score_llm || 0)
      );
    }
    scored.sort((a, b) => (b.match_pct || 0) - (a.match_pct || 0));

    // 6) Filtro min_match + CANDIDATURA para TODAS as filtradas + paginação
    const filtradas = scored.filter(x => (x.match_pct || 0) >= minMatch);

    // candidaturas do freelancer para TODAS as vagas filtradas
    const idsTodasFiltradas = filtradas.map(x => x.vaga.id);
    let setJaCandidatado = new Set();

    if (idsTodasFiltradas.length) {
      const candidaturas = await Candidatura.findAll({
        attributes: ['vaga_id'],
        where: {
          freelancer_id: freelancerId,
          vaga_id: { [Op.in]: idsTodasFiltradas },
        },
      });
      setJaCandidatado = new Set(candidaturas.map(c => String(c.vaga_id)));
    }

    // anotar flag antes de paginar
    const anotadas = filtradas.map((x) => {
      const v = x.vaga.toJSON();
      return {
        ...v,
        match_pct: x.match_pct,
        ja_candidatado: setJaCandidatado.has(String(v.id)),
      };
    });

    // paginação
    const total = anotadas.length;
    const totalPaginas = Math.max(Math.ceil(total / limite), 1);
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;

    const pageItems = anotadas.slice(inicio, fim);

    return res.json({
      success: true,
      message: 'Vagas compatíveis com o perfil do freelancer (rápido + IA opcional)',
      data: {
        vagas: pageItems,
        total,
        totalPaginas,
        pagina,
        limite
      }
    });
  } catch (err) {
    console.error('Erro match vagas do freelancer:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao calcular matches para o freelancer',
    });
  }
};

/* ===== Exports explícitos (evita undefined no require) ===== */
module.exports = {
  listarFreelancersComMatchDaEmpresa: exports.listarFreelancersComMatchDaEmpresa,
  listarVagasCompativeisParaFreelancer: exports.listarVagasCompativeisParaFreelancer,
};
