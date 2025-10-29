// src/utils/matchEmpresaFreelancer.js

/* ===================== Skills helpers (limpeza e dedupe) ===================== */
const EXCLUDE_TOKENS = new Set([
  'brasil','brazil','portugal','espanha','argentina','uruguai','chile','peru',
  'méxico','mexico','estados unidos','usa','eua','frança','franca','alemanha',
  'italia','itália','inglaterra','canadá','canada','japão','japao'
]);
const UFS = new Set([
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB',
  'PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]);

export const norm = (s) => (s || '').trim();

export const isCountryOrUF = (s) => {
  if (!s) return false;
  const lower = s.toLowerCase();
  const upper = s.toUpperCase();
  return EXCLUDE_TOKENS.has(lower) || UFS.has(upper);
};

// "React, Node / SQL; Brasil" -> ["React","Node","SQL","Brasil"]
export const splitToTokens = (s) => {
  if (!s || typeof s !== 'string') return [];
  return s.split(/[,;\/|·•\-]+/g).map(t => norm(t)).filter(Boolean);
};

// Heurística: se parecer parágrafo, não tratar como lista
export const isLikelyParagraph = (s) => {
  if (!s) return false;
  const wordCount = s.trim().split(/\s+/).length;
  return wordCount >= 10 || /[.!?]/.test(s);
};

export const cleanSkillList = (arr) => {
  const out = [];
  const seen = new Set();
  (Array.isArray(arr) ? arr : []).forEach(raw => {
    const v = norm(String(raw));
    if (!v) return;
    if (v.length > 40) return;
    if (isCountryOrUF(v)) return;
    const key = v.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(v);
  });
  return out;
};

export const buildCleanSkills = (freelancer) => {
  const a = Array.isArray(freelancer?.skills_array) ? freelancer.skills_array : [];
  const fromArray = cleanSkillList(a);

  let fromTexto = [];
  if (freelancer?.principais_habilidades && !isLikelyParagraph(freelancer.principais_habilidades)) {
    fromTexto = cleanSkillList(splitToTokens(freelancer.principais_habilidades));
  }

  return cleanSkillList([...fromArray, ...fromTexto]);
};

export const buildPrincipaisHabilidadesDisplay = (freelancer) => {
  const txt = freelancer?.principais_habilidades || '';
  if (!txt) return '';
  if (isLikelyParagraph(txt)) return txt;
  const cleaned = cleanSkillList(splitToTokens(txt));
  return cleaned.join(', ');
};
/* ============================================================================ */

/* ===================== Labels & formatadores ===================== */
export const nivelLabel = (n) => {
  const map = { junior: 'Júnior', pleno: 'Pleno', senior: 'Sênior', especialista: 'Especialista' };
  return map[n] || n || '—';
};

export const modalidadeLabel = (m) => {
  const map = { remoto: 'Remoto', presencial: 'Presencial', hibrido: 'Híbrido' };
  return map[m] || m || '—';
};

export const formatValorHora = (v) => {
  if (v === null || v === undefined) return '—';
  const num = Number(v);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num) + '/hora';
};

export const localizacaoTxt = (f) => {
  if (f?.cidade && f?.estado) return `${f.cidade} - ${f.estado}`;
  return 'Localização não informada';
};

/* ===================== Compat (antigo placar visual simples) ===================== */
/** Mantido por compatibilidade com telas antigas */
export const computeMatch = (f) => {
  const base = 78;
  const skills = buildCleanSkills(f).length;
  const skillBonus = Math.min(18, skills);
  const nivelBonus = ({ junior: 4, pleno: 8, senior: 12, especialista: 14 }[f?.nivel_experiencia] || 6);
  return Math.max(75, Math.min(98, base + skillBonus + nivelBonus));
};

/* ===================== Novo cálculo detalhado (sem distância) ===================== */
/**
 * Mapeia nível para um rank ordinal (menor = mais júnior)
 */
const nivelRank = (n) => {
  const map = { junior: 0, pleno: 1, senior: 2, especialista: 3 };
  return map[String(n || '').toLowerCase()] ?? null;
};

/**
 * Normaliza texto para comparação case-insensitive e sem acentos simples.
 */
const normKey = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/**
 * Converte “string com vírgulas/;/\n” OU array em array normalizado e deduplicado.
 */
const toList = (v) => {
  if (Array.isArray(v)) {
    return Array.from(new Set(v.map(normKey).filter(Boolean)));
  }
  if (typeof v === 'string') {
    return Array.from(
      new Set(
        v
          .split(/[,;\n]/g)
          .map(normKey)
          .filter(Boolean)
      )
    );
  }
  return [];
};

/**
 * Cálculo de match detalhado entre vaga e freelancer (sem distância).
 * Retorna { score: number(0-100), breakdown: { skills, nivel, modalidade, area, idiomas, salario? } }
 */
export function computeMatchDetailed(vaga, freelancer, options = {}) {
  // pesos padrão (somam 1.0)
  const pesos = {
    skills: options.pesos?.skills ?? 0.60,
    nivel: options.pesos?.nivel ?? 0.20,
    modalidade: options.pesos?.modalidade ?? 0.10,
    area: options.pesos?.area ?? 0.07,
    idiomas: options.pesos?.idiomas ?? 0.03,
  };

  // ---------- Skills ----------
  const freelaSkills = toList(buildCleanSkills(freelancer));
  const reqObrig = toList(vaga?.skills_obrigatorias);
  const reqDesej = toList(vaga?.skills_desejaveis);

  const setFreela = new Set(freelaSkills);
  const hitObrig = reqObrig.filter(k => setFreela.has(k)).length;
  const hitDesej = reqDesej.filter(k => setFreela.has(k)).length;

  // obrigatórias precisam pesar mais (tudo ou proporcional)
  const obrigRatio = reqObrig.length ? hitObrig / reqObrig.length : 1;
  const desejRatio = reqDesej.length ? hitDesej / reqDesej.length : 1;

  // subscore de skills: 70% obrigatórias + 30% desejáveis
  let skillsPts = 0;
  if (reqObrig.length === 0 && reqDesej.length === 0) {
    // sem requisitos -> 100% skills
    skillsPts = 1;
  } else {
    skillsPts = 0.7 * obrigRatio + 0.3 * desejRatio;
  }

  // ---------- Nível ----------
  const nvVaga = nivelRank(vaga?.nivel_experiencia);
  const nvCand = nivelRank(freelancer?.nivel_experiencia);
  let nivelPts = 1;
  let nivelLabelTxt = 'Compatível';

  if (nvVaga != null && nvCand != null) {
    const diff = nvCand - nvVaga; // >0 sobrequalificado, <0 subqualificado
    if (diff < 0) {
      // subqualificado: penaliza mais
      // cada nível abaixo tira 35% do subscore de nível
      const penalty = Math.min(1, Math.abs(diff) * 0.35);
      nivelPts = Math.max(0, 1 - penalty);
      nivelLabelTxt = 'Abaixo do nível requisitado';
    } else if (diff > 0) {
      // sobrequalificado: penalidade leve (cada nível acima tira 10%)
      const penalty = Math.min(0.3, diff * 0.10);
      nivelPts = Math.max(0.7, 1 - penalty);
      nivelLabelTxt = 'Acima do nível requisitado';
    } else {
      nivelPts = 1;
      nivelLabelTxt = 'Exato';
    }
  }

  // ---------- Modalidade ----------
  const modVaga = normKey(vaga?.modalidade_trabalho);
  const modCand = normKey(freelancer?.modalidade_trabalho);
  let modalidadePts = 1;
  let modalidadeLabelTxt = 'Compatível';
  if (modVaga && modCand) {
    if (modVaga === modCand) {
      modalidadePts = 1;
      modalidadeLabelTxt = 'Exata';
    } else {
      // se vaga remoto e cand hibrido/presencial -> leve queda; se vaga presencial e cand remoto -> queda maior
      if (modVaga === 'remoto') {
        modalidadePts = 0.85;
        modalidadeLabelTxt = 'Parcial';
      } else if (modVaga === 'hibrido' && (modCand === 'remoto' || modCand === 'presencial')) {
        modalidadePts = 0.9;
        modalidadeLabelTxt = 'Parcial';
      } else if (modVaga === 'presencial' && modCand === 'remoto') {
        modalidadePts = 0.6;
        modalidadeLabelTxt = 'Baixa';
      } else {
        modalidadePts = 0.8;
        modalidadeLabelTxt = 'Parcial';
      }
    }
  }

  // ---------- Área ----------
  const areaVaga = normKey(vaga?.area_atuacao);
  const areaCand = normKey(freelancer?.area_atuacao);
  let areaPts = 1;
  let areaLabelTxt = 'Compatível';
  if (areaVaga && areaCand) {
    areaPts = areaVaga === areaCand ? 1 : 0.75; // simples: mesma área = 100%, senão 75%
    areaLabelTxt = areaVaga === areaCand ? 'Mesma área' : 'Área relacionada';
  }

  // ---------- Idiomas ----------
  const idiVaga = toList(vaga?.idiomas_necessarios);
  const idiCand = toList(freelancer?.idiomas);
  let idiomasPts = 1;
  let idiomasLabelTxt = 'Ok';
  if (idiVaga.length) {
    const setIdi = new Set(idiCand);
    const hitIdi = idiVaga.filter(k => setIdi.has(k)).length;
    idiomasPts = hitIdi / idiVaga.length;
    idiomasLabelTxt = `Atende ${hitIdi}/${idiVaga.length}`;
  }

  // ---------- Score agregado ----------
  const scoreFloat =
    pesos.skills * skillsPts +
    pesos.nivel * nivelPts +
    pesos.modalidade * modalidadePts +
    pesos.area * areaPts +
    pesos.idiomas * idiomasPts;

  const score = Math.max(0, Math.min(100, Math.round(scoreFloat * 100)));

  return {
    score,
    breakdown: {
      skills: {
        pts: skillsPts,
        peso: pesos.skills,
        label: `Obrigatórias ${reqObrig.length ? `${hitObrig}/${reqObrig.length}` : '—'} • Desejáveis ${reqDesej.length ? `${hitDesej}/${reqDesej.length}` : '—'}`,
        detalhe: {
          hitObrig,
          totalObrig: reqObrig.length,
          hitDesej,
          totalDesej: reqDesej.length,
        },
      },
      nivel: {
        pts: nivelPts,
        peso: pesos.nivel,
        label: nivelLabelTxt,
      },
      modalidade: {
        pts: modalidadePts,
        peso: pesos.modalidade,
        label: modalidadeLabelTxt,
      },
      area: {
        pts: areaPts,
        peso: pesos.area,
        label: areaLabelTxt,
      },
      idiomas: {
        pts: idiomasPts,
        peso: pesos.idiomas,
        label: idiomasLabelTxt,
      },
    },
  };
}
