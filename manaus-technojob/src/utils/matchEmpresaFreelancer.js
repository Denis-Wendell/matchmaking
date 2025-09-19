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

/* Heurística simples para “match %” visual */
export const computeMatch = (f) => {
  const base = 78;
  const skills = buildCleanSkills(f).length;
  const skillBonus = Math.min(18, skills);
  const nivelBonus = ({ junior: 4, pleno: 8, senior: 12, especialista: 14 }[f?.nivel_experiencia] || 6);
  return Math.max(75, Math.min(98, base + skillBonus + nivelBonus));
};
