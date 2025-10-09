// src/routes/iaRoutes.js
const express = require('express');
const { sequelize } = require('../config/database');
const { verificarToken, verificarEmpresa } = require('../middleware/auth');
const Freelancer = require('../models/Freelancer');
const Vaga = require('../models/Vaga');

const { embedText } = require('../services/openaiEmbeddings');
const { canonicalFreelancer, canonicalVaga } = require('../services/canonicalText');
const { explainAndMessage } = require('../services/openaiChat');

const router = express.Router();

/** === Reindex: gerar embeddings em massa (usar só em DEV ou com segurança) === */

// Freelancers
router.post('/reindex/freelancers', verificarToken, async (req, res) => {
  try {
    const { limit = 2000 } = req.body || {};
    const list = await Freelancer.findAll({ limit, order: [['updated_at', 'DESC']] });

    let ok = 0, fail = 0;
    for (const f of list) {
      try {
        const text = canonicalFreelancer(f);
        const emb = await embedText(text);
        if (emb) {
          await sequelize.query(
            `UPDATE "Freelancers" SET embedding = $1 WHERE id = $2`,
            { bind: [emb, f.id] }
          );
          ok++;
        } else { fail++; }
      } catch (e) { fail++; }
    }

    res.json({ success: true, message: 'Reindex freelancers finalizado', data: { ok, fail, total: list.length } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Falha no reindex de freelancers' });
  }
});

// Vagas
router.post('/reindex/vagas', verificarToken, verificarEmpresa, async (req, res) => {
  try {
    const { limit = 2000 } = req.body || {};
    const list = await Vaga.findAll({ limit, order: [['updated_at', 'DESC']] });

    let ok = 0, fail = 0;
    for (const v of list) {
      try {
        const text = canonicalVaga(v);
        const emb = await embedText(text);
        if (emb) {
          await sequelize.query(
            `UPDATE "Vagas" SET embedding = $1 WHERE id = $2`,
            { bind: [emb, v.id] }
          );
          ok++;
        } else { fail++; }
      } catch (e) { fail++; }
    }

    res.json({ success: true, message: 'Reindex vagas finalizado', data: { ok, fail, total: list.length } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Falha no reindex de vagas' });
  }
});

/** === Match: FREELANCERS p/ UMA VAGA === */
router.get('/match/freelancers', verificarToken, verificarEmpresa, async (req, res) => {
  try {
    const vagaId = Number(req.query.vagaId);
    const pagina = Math.max(parseInt(req.query.pagina || '1', 10), 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite || '12', 10), 1), 100);
    const offset = (pagina - 1) * limite;
    const explain = req.query.explain === '1' || req.query.explain === 'true';
    const perspective = 'vaga->freelancer';

    if (!vagaId) return res.status(400).json({ success: false, message: 'Informe vagaId' });

    const vaga = await Vaga.findByPk(vagaId);
    if (!vaga || !vaga.embedding) return res.status(400).json({ success: false, message: 'Vaga sem embedding. Reindexe.' });

    const [rows] = await sequelize.query(`
      WITH alvo AS (SELECT embedding FROM "Vagas" WHERE id = $1)
      SELECT f.*,
             (1 - (f.embedding <=> (SELECT embedding FROM alvo))) AS score
      FROM "Freelancers" f
      WHERE f.embedding IS NOT NULL AND f.status = 'ativo'
      ORDER BY f.embedding <=> (SELECT embedding FROM alvo) ASC
      LIMIT $2 OFFSET $3
    `, { bind: [vagaId, limite, offset] });

    const [[{ count }]] = await sequelize.query(`
      SELECT COUNT(*)::int AS count
      FROM "Freelancers" f
      WHERE f.embedding IS NOT NULL AND f.status = 'ativo'
    `);

    const toPct = (s) => Math.round(Math.pow(Math.max(0, Math.min(1, s || 0)), 0.95) * 100);

    let enriched = rows.map(r => ({ ...r, match_percent: toPct(r.score) }));
    if (explain) {
      const tasks = enriched.map(async (freel) => {
        const { short_reason, personal_message } = await explainAndMessage({
          vaga: vaga.toJSON ? vaga.toJSON() : vaga,
          freel,
          matchPercent: freel.match_percent,
          perspective
        });
        return { ...freel, ai_reason: short_reason, ai_message: personal_message };
      });
      enriched = await Promise.all(tasks);
    }

    res.json({
      success: true,
      data: {
        freelancers: enriched,
        total: count,
        totalPaginas: Math.max(Math.ceil(count / limite), 1),
        pagina,
        limite,
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Falha no match de freelancers' });
  }
});

/** === Match: VAGAS p/ UM FREELANCER === */
router.get('/match/vagas', verificarToken, async (req, res) => {
  try {
    const freelancerId = Number(req.query.freelancerId);
    const pagina = Math.max(parseInt(req.query.pagina || '1', 10), 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite || '12', 10), 1), 100);
    const offset = (pagina - 1) * limite;
    const explain = req.query.explain === '1' || req.query.explain === 'true';
    const perspective = 'freelancer->vaga';

    if (!freelancerId) return res.status(400).json({ success: false, message: 'Informe freelancerId' });

    const freel = await Freelancer.findByPk(freelancerId);
    if (!freel || !freel.embedding) return res.status(400).json({ success: false, message: 'Freelancer sem embedding. Reindexe.' });

    const [rows] = await sequelize.query(`
      WITH alvo AS (SELECT embedding FROM "Freelancers" WHERE id = $1)
      SELECT v.*,
             (1 - (v.embedding <=> (SELECT embedding FROM alvo))) AS score
      FROM "Vagas" v
      WHERE v.embedding IS NOT NULL AND v.status = 'ativo'
      ORDER BY v.embedding <=> (SELECT embedding FROM alvo) ASC
      LIMIT $2 OFFSET $3
    `, { bind: [freelancerId, limite, offset] });

    const [[{ count }]] = await sequelize.query(`
      SELECT COUNT(*)::int AS count
      FROM "Vagas" v
      WHERE v.embedding IS NOT NULL AND v.status = 'ativo'
    `);

    const toPct = (s) => Math.round(Math.pow(Math.max(0, Math.min(1, s || 0)), 0.95) * 100);

    let enriched = rows.map(r => ({ ...r, match_percent: toPct(r.score) }));
    if (explain) {
      const tasks = enriched.map(async (vaga) => {
        const { short_reason, personal_message } = await explainAndMessage({
          vaga,
          freel: freel.toJSON ? freel.toJSON() : freel,
          matchPercent: vaga.match_percent,
          perspective
        });
        return { ...vaga, ai_reason: short_reason, ai_message: personal_message };
      });
      enriched = await Promise.all(tasks);
    }

    res.json({
      success: true,
      data: {
        vagas: enriched,
        total: count,
        totalPaginas: Math.max(Math.ceil(count / limite), 1),
        pagina,
        limite,
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Falha no match de vagas' });
  }
});

/** === Explicação unitária on-demand (opcional) === */
router.get('/explain', verificarToken, async (req, res) => {
  try {
    const vagaId = Number(req.query.vagaId);
    const freelancerId = Number(req.query.freelancerId);
    const perspective = req.query.perspective === 'freelancer->vaga' ? 'freelancer->vaga' : 'vaga->freelancer';
    if (!vagaId || !freelancerId) {
      return res.status(400).json({ success: false, message: 'vagaId e freelancerId são obrigatórios' });
    }

    const vaga = await Vaga.findByPk(vagaId);
    const freel = await Freelancer.findByPk(freelancerId);
    if (!vaga || !freel) return res.status(404).json({ success: false, message: 'Par não encontrado' });

    // calcula similarity atual (só p/ converter em %)
    const [[{ score }]] = await sequelize.query(`
      SELECT (1 - (f.embedding <=> v.embedding)) AS score
      FROM "Freelancers" f, "Vagas" v
      WHERE f.id = $1 AND v.id = $2
    `, { bind: [freelancerId, vagaId] });
    const toPct = (s) => Math.round(Math.pow(Math.max(0, Math.min(1, s || 0)), 0.95) * 100);
    const matchPercent = toPct(score || 0);

    const { short_reason, personal_message } = await explainAndMessage({
      vaga: vaga.toJSON ? vaga.toJSON() : vaga,
      freel: freel.toJSON ? freel.toJSON() : freel,
      matchPercent,
      perspective
    });

    res.json({ success: true, data: { matchPercent, short_reason, personal_message } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Falha ao gerar explicação' });
  }
});

module.exports = router;
