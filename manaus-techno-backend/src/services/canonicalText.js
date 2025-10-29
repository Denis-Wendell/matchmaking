// src/services/canonicalText.js
function normalize(str = '') {
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim();
}

function toList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  // divide por vírgula / ponto e vírgula / barra
  return String(val).split(/[,;/\n]/g).map(s => s.trim()).filter(Boolean);
}

function uniq(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = normalize(x);
    if (!seen.has(k)) { seen.add(k); out.push(k); }
  }
  return out;
}

function clampText(s = '', max = 700) {
  s = String(s);
  return s.length <= max ? s : s.slice(0, max);
}

function canonicalFreelancer(f) {
  if (!f) return '';

  const nome        = normalize(f.nome || '');
  const area        = normalize(f.area_atuacao || '');
  const profissao   = normalize(f.profissao || '');
  const nivel       = normalize(f.nivel_experiencia || '');
  const modalidade  = normalize(f.modalidade_trabalho || '');
  const disp        = normalize(f.disponibilidade || '');
  const valorHora   = f.valor_hora ? String(f.valor_hora) : '';

  const skillsArr   = toList(f.skills_array).map(normalize);
  const principais  = toList(f.principais_habilidades).map(normalize);
  const idiomas     = toList(f.idiomas).map(normalize);

  // Bloco de skills unificado e deduplicado
  const skillsAll = uniq([...skillsArr, ...principais]).slice(0, 64);

  const resumo     = clampText(normalize(f.resumo_profissional || ''), 600);
  const exp        = clampText(normalize(f.experiencia_profissional || ''), 600);
  const objetivos  = clampText(normalize(f.objetivos_profissionais || ''), 350);

  const linhas = [
    `nome: ${nome}`,
    `area: ${area}`,
    `profissao: ${profissao}`,
    `nivel: ${nivel}`,
    `modalidade: ${modalidade}`,
    `disp: ${disp}`,
    valorHora ? `valor_hora: ${valorHora}` : '',
    idiomas.length ? `idiomas: ${idiomas.join(' | ')}` : '',
    skillsAll.length ? `skills_all: ${skillsAll.join(' | ')}` : '',
    resumo ? `resumo: ${resumo}` : '',
    exp ? `experiencia: ${exp}` : '',
    objetivos ? `objetivos: ${objetivos}` : ''
  ].filter(Boolean);

  return linhas.join('\n');
}

function canonicalVaga(v) {
  if (!v) return '';

  const titulo      = normalize(v.titulo || '');
  const area        = normalize(v.area_atuacao || '');
  const nivel       = normalize(v.nivel_experiencia || '');
  const modalidade  = normalize(v.modalidade_trabalho || '');
  const contrato    = normalize(v.tipo_contrato || '');
  const moeda       = normalize(v.moeda || '');

  const salMin = v.salario_minimo ? String(v.salario_minimo) : '';
  const salMax = v.salario_maximo ? String(v.salario_maximo) : '';

  // fontes de skills
  const obrig = toList(v.skills_obrigatorias).map(normalize);
  const desej = toList(v.skills_desejaveis).map(normalize);
  const tecn  = toList(v.habilidades_tecnicas).map(normalize);
  const kw    = toList(v.palavras_chave).map(normalize);

  // skills unificadas e deduplicadas
  let skillsAll = uniq([...obrig, ...desej, ...tecn, ...kw]).slice(0, 80);

  // "boost" leve para obrigatórias: repete 1x (ajuda o vetor)
  const obligBoost = obrig.slice(0, 30);
  skillsAll = uniq([...skillsAll, ...obligBoost]);

  const desc = clampText(normalize(v.descricao_geral || ''), 700);

  const linhas = [
    `titulo: ${titulo}`,
    `area: ${area}`,
    `nivel: ${nivel}`,
    `modalidade: ${modalidade}`,
    `contrato: ${contrato}`,
    (salMin || salMax) ? `salario: ${salMin}-${salMax} ${moeda}` : '',
    skillsAll.length ? `skills_all: ${skillsAll.join(' | ')}` : '',
    desc ? `descricao: ${desc}` : ''
  ].filter(Boolean);

  return linhas.join('\n');
}

module.exports = { canonicalFreelancer, canonicalVaga };
