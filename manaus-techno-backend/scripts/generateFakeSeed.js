// scripts/generateFakeSeed.js
// Gera data/seed.generated.json com empresas, vagas, freelancers e candidaturas coerentes

const fs = require('fs');
const path = require('path');

function pickWeighted(weightsObj) {
  const entries = Object.entries(weightsObj);
  const r = Math.random();
  let acc = 0;
  for (const [k, w] of entries) {
    acc += w;
    if (r <= acc) return k;
  }
  return entries[entries.length - 1][0];
}

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(a) { return a.sort(() => Math.random() - 0.5); }
function randomSubset(arr, kmin=2, kmax=5) {
  const k = randInt(kmin, Math.min(kmax, arr.length));
  return shuffle([...arr]).slice(0, k);
}
function randomDateWithin(daysBack=90) {
  const now = Date.now();
  const past = now - randInt(0, daysBack) * 24 * 60 * 60 * 1000;
  return new Date(past).toISOString();
}
function slugify(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function buildTitulo(area, nivel) {
  const base = {
    frontend: "Desenvolvedor(a) Front-end",
    backend: "Desenvolvedor(a) Back-end",
    dados: "Analista de Dados",
    design: "Designer UX/UI",
    mobile: "Desenvolvedor(a) Android"
  }[area] || "Profissional";

  const nivelMap = { junior: "Júnior", pleno: "Pleno", senior: "Sênior", especialista: "Especialista" } ;
  return `${base} ${nivelMap[nivel] || ''}`.trim();
}

function gerarValorHora(nivel, faixas) {
  const [min, max] = faixas[nivel] || [40, 80];
  const val = randInt(min, max);
  return val; // BRL/hora
}

function computeHeuristicMatch(f, v) {
  let score = 0;
  // área (approx por título/stack)
  if (f.area_atuacao && v.area_atuacao && f.area_atuacao === v.area_atuacao) score += 20;
  // nível
  if (f.nivel_experiencia && v.nivel_experiencia && f.nivel_experiencia === v.nivel_experiencia) score += 15;
  // modalidade
  if (f.modalidade_trabalho && v.modalidade_trabalho && f.modalidade_trabalho === v.modalidade_trabalho) score += 10;
  // idiomas
  const fIdi = new Set((f.idiomas||[]).map(s => String(s).toLowerCase()));
  const vIdi = (v.idiomas_necessarios||[]).map(s => String(s).toLowerCase());
  if (vIdi.length) {
    const inter = vIdi.filter(x => fIdi.has(x)).length;
    score += Math.min(5, Math.round((inter / vIdi.length) * 5));
  }
  // skills
  const fSkills = new Set((f.skills_array||[]).map(s => String(s).toLowerCase()));
  const vFeat = [
    ...(v.skills_obrigatorias||[]),
    ...(v.skills_desejaveis||[])
  ].map(s => String(s).toLowerCase());
  const inter2 = vFeat.filter(x => fSkills.has(x)).length;
  if (vFeat.length) {
    score += Math.min(50, Math.round((inter2 / vFeat.length) * 50));
  }
  return Math.max(0, Math.min(100, score));
}

(function main() {
  const cfgPath = path.resolve('data/seed.config.json');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

  const { volumes, distribuicoes, negocio, faixasValorHoraBRL, datas, regrasCandidatura } = cfg;

  const empresas = [];
  for (let i = 0; i < volumes.empresas; i++) {
    const nome = `Empresa ${i+1} LTDA`;
    empresas.push({
      // id gerado pelo banco/ORM se necessário
      nome_fantasia: nome,
      razao_social: `${nome}`,
      email: `contato+${slugify(nome)}@exemplo.com`,
      telefone: `+55 92 9${randInt(1000,9999)}-${randInt(1000,9999)}`,
      cnpj: `00.000.${randInt(100,999)}/0001-${randInt(10,99)}`,
      status: 'ativa',
      created_at: randomDateWithin(datas.janelaDias),
      updated_at: randomDateWithin(7)
    });
  }

  const areaKeys = Object.keys(negocio.skillSets);
  const vagas = [];
  empresas.forEach((_, idxEmp) => {
    const q = randInt(volumes.vagasPorEmpresaMin, volumes.vagasPorEmpresaMax);
    for (let j = 0; j < q; j++) {
      const area = sample(areaKeys);
      const nivel = pickWeighted(distribuicoes.nivelExperiencia);
      const modalidade = pickWeighted(distribuicoes.modalidade);
      const ativo = Math.random() < distribuicoes.vagasAtivas;
      const skillsBase = negocio.skillSets[area];

      const skillsObr = randomSubset(skillsBase, 3, 5);
      const skillsDes = randomSubset(skillsBase.filter(s => !skillsObr.includes(s)), 2, 4);
      const idiomasNec = Math.random() < 0.4 ? [sample(negocio.idiomas)] : [];
      const titulo = buildTitulo(area, nivel);

      vagas.push({
        empresa_index: idxEmp, // usaremos para linkar depois
        titulo,
        area_atuacao: area,
        nivel_experiencia: nivel,
        modalidade_trabalho: modalidade,
        tipo_contrato: sample(['pj','clt','freelancer','estagio','temporario']),
        localizacao_texto: sample(negocio.cidades),
        salario_minimo: null,
        salario_maximo: null,
        moeda: 'BRL',
        skills_obrigatorias: skillsObr,
        skills_desejaveis: skillsDes,
        requisitos_obrigatorios: randomSubset(skillsObr, 2, Math.min(3, skillsObr.length)),
        requisitos_desejados: randomSubset(skillsDes, 1, Math.min(2, skillsDes.length)),
        descricao_geral: `Buscamos pessoa para ${titulo} com foco em ${skillsObr.join(', ')}.`,
        palavras_chave: randomSubset(skillsBase, 2, 4),
        idiomas_necessarios: idiomasNec,
        status: ativo ? 'ativo' : 'inativo',
        created_at: randomDateWithin(datas.janelaDias),
        updated_at: randomDateWithin(7),
        visualizacoes: randInt(10, 800),
        candidaturas: 0
      });
    }
  });

  const freelancers = [];
  for (let k = 0; k < volumes.freelancers; k++) {
    const area = sample(areaKeys);
    const nivel = pickWeighted(distribuicoes.nivelExperiencia);
    const modalidade = pickWeighted(distribuicoes.modalidade);
    const nome = `Candidato ${k+1}`;
    const skillsBase = negocio.skillSets[area];
    const skills = randomSubset(skillsBase, 4, 8);
    const principais = randomSubset(skills, 2, 3);
    const idiomas = Math.random() < 0.7 ? [sample(negocio.idiomas)] : [];

    freelancers.push({
      nome,
      email: `cand${k+1}@mail.com`,
      telefone: `+55 92 9${randInt(1000,9999)}-${randInt(1000,9999)}`,
      profissao: buildTitulo(area, nivel),
      area_atuacao: area,
      nivel_experiencia: nivel,
      modalidade_trabalho: modalidade,
      valor_hora: gerarValorHora(nivel, faixasValorHoraBRL),
      cidade: sample(negocio.cidades).split('-')[0],
      estado: sample(['AM','SP','RJ','PA','PE','PR']),
      resumo_profissional: `Profissional com experiência em ${skills.slice(0,3).join(', ')} e atuação em ${area}.`,
      experiencia_profissional: `Projetos com ${skills.join(', ')}.`,
      principais_habilidades: principais.join(', '),
      skills_array: skills,
      idiomas: idiomas,
      url_portfolio: Math.random() < 0.4 ? `https://portfolio.io/${slugify(nome)}` : null,
      linkedin: Math.random() < 0.5 ? `https://www.linkedin.com/in/${slugify(nome)}` : null,
      github: Math.random() < 0.5 ? `https://github.com/${slugify(nome)}` : null,
      formacao_academica: Math.random() < 0.7 ? 'Engenharia de Computação' : 'Sistemas de Informação',
      instituicao: Math.random() < 0.7 ? 'UniNorte' : 'UFAM',
      ano_conclusao: Math.random() < 0.5 ? 2025 : 2023,
      certificacoes: Math.random() < 0.4 ? 'Scrum, AWS Cloud Practitioner' : '',
      disponibilidade: sample(['Integral', 'Parcial', 'Freelancer']),
      objetivos_profissionais: 'Evoluir tecnicamente e contribuir em times de alto desempenho.',
      status: 'ativo',
      created_at: randomDateWithin(datas.janelaDias),
      updated_at: randomDateWithin(7)
    });
  }

  // Candidaturas “coerentes”: só cria se match heurístico >= limiar
  const candidaturas = [];
  const limiar = regrasCandidatura.matchMinParaCandidatar || 60;
  const maxPorFreela = regrasCandidatura.maxPorFreelancer || 8;

  freelancers.forEach((f, idxF) => {
    const candidatas = shuffle(vagas)
      .filter(v => v.status === 'ativo')
      .slice(0, 25); // corta busca

    let feitas = 0;
    for (const v of candidatas) {
      const m = computeHeuristicMatch(f, v);
      if (m >= limiar) {
        candidaturas.push({
          vaga_index: vagas.indexOf(v),
          freelancer_index: idxF,
          status: sample(['pendente','visualizada','aceita','recusada']),
          mensagem_candidato: `Olá! Tenho forte aderência à vaga (${m}%).`,
          created_at: randomDateWithin(60),
          updated_at: randomDateWithin(7)
        });
        v.candidaturas += 1;
        feitas += 1;
        if (feitas >= maxPorFreela) break;
      }
    }
  });

  const out = { empresas, vagas, freelancers, candidaturas };
  const outPath = path.resolve('data/seed.generated.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`✅ Gerado: ${outPath}`);
})();
