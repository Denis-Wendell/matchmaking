// util p/ limpar/organizar habilidades e formato telefone

const EXCLUDE_TOKENS = new Set([
  'brasil','brazil','portugal','espanha','argentina','uruguai','chile','peru',
  'méxico','mexico','estados unidos','usa','eua','frança','franca','alemanha',
  'italia','itália','inglaterra','canadá','canada','japão','japao'
]);
const UFS = new Set([
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB',
  'PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]);

export const formatarTelefone = (telefone='') => {
  const digits = (telefone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
};

const norm = (s) => (s || '').trim();
const isCountryOrUF = (s) => {
  if (!s) return false;
  const lower = s.toLowerCase();
  const upper = s.toUpperCase();
  return EXCLUDE_TOKENS.has(lower) || UFS.has(upper);
};
const splitToTokens = (s) => {
  if (!s || typeof s !== 'string') return [];
  return s
    .split(/[,;\/|·•\-]+/g)
    .map(t => norm(t))
    .filter(Boolean);
};
const isLikelyParagraph = (s) => {
  if (!s) return false;
  const wordCount = s.trim().split(/\s+/).length;
  return wordCount >= 10 || /[.!?]/.test(s);
};
const cleanSkillList = (arr) => {
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

export const buildCleanSkills = (freelancer={}) => {
  const a = Array.isArray(freelancer?.skills_array) ? freelancer.skills_array : [];
  const fromArray = cleanSkillList(a);
  let fromTexto = [];
  if (freelancer?.principais_habilidades && !isLikelyParagraph(freelancer.principais_habilidades)) {
    fromTexto = cleanSkillList(splitToTokens(freelancer.principais_habilidades));
  }
  return cleanSkillList([...fromArray, ...fromTexto]);
};

export const buildPrincipaisHabilidadesDisplay = (freelancer={}) => {
  const txt = freelancer?.principais_habilidades || '';
  if (!txt) return '';
  if (isLikelyParagraph(txt)) return txt;
  const cleaned = cleanSkillList(splitToTokens(txt));
  return cleaned.join(', ');
};
