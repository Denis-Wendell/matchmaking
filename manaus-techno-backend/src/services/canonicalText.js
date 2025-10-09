// src/services/canonicalText.js

function canonicalFreelancer(f) {
  if (!f) return '';
  const arr = [];

  // Cabeçalho
  arr.push(`NOME: ${f.nome || ''}`);
  arr.push(`AREA: ${f.area_atuacao || ''}`);
  arr.push(`PROFISSAO: ${f.profissao || ''}`);
  arr.push(`NIVEL: ${f.nivel_experiencia || ''}`);
  arr.push(`MODALIDADE: ${f.modalidade_trabalho || ''}`);
  arr.push(`DISP: ${f.disponibilidade || ''}`);
  if (f.valor_hora) arr.push(`VALOR_HORA: ${f.valor_hora}`);

  // Skills
  if (Array.isArray(f.skills_array)) arr.push(`SKILLS: ${f.skills_array.join(', ')}`);
  if (f.principais_habilidades) arr.push(`PRINCIPAIS: ${f.principais_habilidades}`);

  // Idiomas
  if (Array.isArray(f.idiomas)) arr.push(`IDIOMAS: ${f.idiomas.join(', ')}`);

  // Resumos
  if (f.resumo_profissional) arr.push(`RESUMO: ${f.resumo_profissional}`);
  if (f.experiencia_profissional) arr.push(`EXPERIENCIA: ${f.experiencia_profissional}`);
  if (f.objetivos_profissionais) arr.push(`OBJETIVOS: ${f.objetivos_profissionais}`);

  // Educação
  if (f.formacao_academica) arr.push(`FORMACAO: ${f.formacao_academica}`);
  if (f.instituicao) arr.push(`INSTITUICAO: ${f.instituicao}`);
  if (f.certificacoes) arr.push(`CERTIFICACOES: ${f.certificacoes}`);

  return arr.join('\n');
}

function canonicalVaga(v) {
  if (!v) return '';
  const arr = [];

  arr.push(`TITULO: ${v.titulo || ''}`);
  arr.push(`AREA: ${v.area_atuacao || ''}`);
  arr.push(`NIVEL: ${v.nivel_experiencia || ''}`);
  arr.push(`MODALIDADE: ${v.modalidade_trabalho || ''}`);
  arr.push(`CONTRATO: ${v.tipo_contrato || ''}`);

  // Salário
  if (v.salario_minimo || v.salario_maximo) {
    arr.push(`SALARIO: ${v.salario_minimo || ''}-${v.salario_maximo || ''} ${v.moeda || ''}`);
  }

  // Skills
  if (Array.isArray(v.skills_obrigatorias)) {
    arr.push(`OBRIGATORIAS: ${v.skills_obrigatorias.join(', ')}`);
  } else if (v.skills_obrigatorias) {
    arr.push(`OBRIGATORIAS: ${v.skills_obrigatorias}`);
  }
  if (Array.isArray(v.skills_desejaveis)) {
    arr.push(`DESEJAVEIS: ${v.skills_desejaveis.join(', ')}`);
  } else if (v.skills_desejaveis) {
    arr.push(`DESEJAVEIS: ${v.skills_desejaveis}`);
  }

  // Descrição
  if (v.descricao_geral) arr.push(`DESCRICAO: ${v.descricao_geral}`);

  return arr.join('\n');
}

module.exports = { canonicalFreelancer, canonicalVaga };
