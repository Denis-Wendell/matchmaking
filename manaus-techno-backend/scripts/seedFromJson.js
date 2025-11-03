// scripts/seedFromJson.js
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// ====== IMPORTA MODELOS ======
const models = require('../src/models'); // precisa exportar { sequelize, Empresa, Freelancer, Vaga, Candidatura, ... }
if (!models || !models.sequelize) {
  console.error('❌ Não consegui importar ../src/models. Verifique se o index exporta { sequelize, ... }.');
  process.exit(1);
}
const { sequelize } = models;

// ====== Helpers básicos ======
function getModel(name) {
  const m = models[name];
  if (!m) {
    console.error(`❌ Model "${name}" não foi encontrado em ../src/models. Exporte-o no index.js.`);
    process.exit(1);
  }
  return m;
}
const Empresa = getModel('Empresa');
const Freelancer = models.Freelancer || models.Freelancers || null; // opcional
const Vaga = getModel('Vaga');
const Candidatura = models.Candidatura || models.Candidaturas || null; // opcional

const DATA_DIR = path.join(process.cwd(), 'data');
const JSON_PATH = path.join(DATA_DIR, 'seed.generated.json');

const toStr = (v) => (v === undefined || v === null ? '' : String(v));
const toNum = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean).map((s) => String(s).trim())));
const isUuid = (s) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ''));

function readJsonOrDie(p) {
  if (!fs.existsSync(p)) {
    console.error(`❌ Arquivo não encontrado: ${p}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(p, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('❌ JSON inválido em', p, e.message);
    process.exit(1);
  }
}

// ====== Normalizações ======
function normalizeEmpresaStatus(s) {
  const x = toStr(s).trim().toLowerCase();
  const map = {
    ativo: 'ativo',
    ativa: 'ativo',
    'em-atividade': 'ativo',
    inativo: 'inativo',
    inativa: 'inativo',
    pendente: 'pendente',
    pausado: 'pausado',
    pausada: 'pausado',
    bloqueado: 'bloqueado',
    bloqueada: 'bloqueado',
  };
  return map[x] || 'ativo';
}
function normalizeNivel(n) {
  const x = toStr(n).trim().toLowerCase();
  if (['junior', 'pleno', 'senior', 'especialista'].includes(x)) return x;
  if (x === 'júnior' || x === 'jr') return 'junior';
  if (x === 'sr') return 'senior';
  return 'junior';
}
function normalizeContrato(t) {
  const x = toStr(t).trim().toLowerCase();
  if (['clt', 'pj', 'estagio', 'freelancer', 'temporario'].includes(x)) return x;
  if (x === 'estágio') return 'estagio';
  if (x === 'temporário') return 'temporario';
  return 'clt';
}
function normalizeModalidade(m) {
  const x = toStr(m).trim().toLowerCase();
  if (['presencial', 'remoto', 'hibrido'].includes(x)) return x;
  if (x === 'híbrido') return 'hibrido';
  return 'presencial';
}
function minLenOrDefault(s, min = 20, def = 'Descrição não informada. Será detalhada posteriormente.') {
  const val = toStr(s).trim();
  return val.length >= min ? val : def;
}
function emailOk(s) {
  const val = toStr(s).trim();
  return /\S+@\S+\.\S+/.test(val) ? val : 'contato@empresa.com';
}
function nonEmptyOr(def) {
  return (s) => {
    const v = toStr(s).trim();
    return v.length ? v : def;
  };
}
const contatoNomeOr = nonEmptyOr('Responsável de RH');

// ====== Reflexão sobre Models (descobrir nomes de colunas/PK) ======
function getPkAttr(model) {
  const attrs = model?.rawAttributes || {};
  for (const [name, def] of Object.entries(attrs)) {
    if (def.primaryKey) {
      return { name, def };
    }
  }
  // fallback padrão
  return { name: 'id', def: attrs.id || {} };
}
function hasAttr(model, name) {
  return !!model?.rawAttributes?.[name];
}
function pickFirstExistingAttr(model, candidates) {
  for (const c of candidates) {
    if (hasAttr(model, c)) return c;
  }
  return null;
}

// ====== UPSERT/CREATE ======
async function upsertEmpresas(arr, t) {
  if (!arr || arr.length === 0) return [];
  console.log(`→ Inserindo empresas…`);

  const out = [];
  for (const e of arr) {
    const id = isUuid(e.id) ? e.id : randomUUID();
    const cnpj = toStr(e.cnpj) || `00.000.${Math.floor(Math.random() * 900 + 100)}/0001-00`;
    const telefone = toStr(e.telefone) || '+55 11 90000-0000';

    const areas_atuacao = uniq(toArray(e.areas_atuacao));
    const beneficios_array = uniq(toArray(e.beneficios_array));
    const tecnologias_usadas = uniq(toArray(e.tecnologias_usadas));

    const dados_empresa = e.dados_empresa || {};
    const configuracoes = e.configuracoes || {};
    const status = normalizeEmpresaStatus(e.status);
    const verificada = !!e.verificada;

    // Campos normalmente NOT NULL em alguns esquemas:
    const descricao_empresa = minLenOrDefault(
      e.descricao_empresa,
      10,
      'Empresa em expansão no segmento, com foco em qualidade e melhoria contínua.'
    );
    const principais_beneficios = toStr(e.principais_beneficios) || null;
    const cultura_empresa = toStr(e.cultura_empresa) || null;

    const payload = {
      id,
      nome: e.nome || null,
      cnpj,
      email_corporativo: e.email_corporativo || null,
      senha_hash: e.senha_hash || null,
      telefone,
      endereco_completo: e.endereco_completo || null,
      cidade: e.cidade || null,
      estado: e.estado || null,
      site_empresa: e.site_empresa || null,
      responsavel_nome: e.responsavel_nome || null,
      responsavel_cargo: e.responsavel_cargo || null,
      responsavel_email: e.responsavel_email || null,
      responsavel_telefone: e.responsavel_telefone || null,
      areas_atuacao,
      beneficios_array,
      tecnologias_usadas,
      dados_empresa,
      configuracoes,
      status,
      verificada,
      descricao_empresa,
      principais_beneficios,
      cultura_empresa,
      setor_atuacao: e.setor_atuacao || 'Tecnologia',
      tamanho_empresa: e.tamanho_empresa || 'media',
      created_at: e.created_at || new Date(),
      updated_at: e.updated_at || new Date(),
    };

    const [row] = await Empresa.upsert(payload, { transaction: t, returning: true });
    out.push(row?.dataValues || payload);
  }
  return out;
}

async function createFreelancers(arr, t) {
  if (!Freelancer || !arr || arr.length === 0) return [];
  console.log(`→ Inserindo freelancers…`);

  const out = [];
  const { name: pkName, def: pkDef } = getPkAttr(Freelancer);
  const pkIsUuid = (pkDef?.type?.key || '').toLowerCase() === 'uuid';

  for (const f of arr) {
    const base = {
      // só seta PK se for UUID; se for serial/int, deixa o banco gerar
      ...(pkIsUuid ? { [pkName]: isUuid(f.id) ? f.id : randomUUID() } : {}),
      nome: toStr(f.nome) || 'Freelancer',
      email: emailOk(f.email || 'freela@example.com'),
      senha_hash: f.senha_hash || null,
      telefone: f.telefone || null,
      profissao: f.profissao || null,
      area_atuacao: f.area_atuacao || null,
      nivel_experiencia: normalizeNivel(f.nivel_experiencia || 'junior'),
      principais_habilidades: toStr(f.principais_habilidades) || null,
      idiomas: f.idiomas || null,
      modalidade_trabalho: normalizeModalidade(f.modalidade_trabalho || 'presencial'),
      resumo_profissional: toStr(f.resumo_profissional) || null,
      skills_array: uniq(toArray(f.skills_array)),
      areas_interesse: uniq(toArray(f.areas_interesse)),
      portfolio_projetos: f.portfolio_projetos || null,
      configuracoes_usuario: f.configuracoes_usuario || {},
      dados_analytics: f.dados_analytics || {},
      status: normalizeEmpresaStatus(f.status || 'ativo') === 'ativo' ? 'ativo' : 'ativo',
      created_at: f.created_at || new Date(),
      updated_at: f.updated_at || new Date(),
    };

    const row = await Freelancer.create(base, { transaction: t });
    out.push(row.dataValues);
  }
  return out;
}

async function createVagas(arr, empresasPorCnpj, t) {
  if (!arr || arr.length === 0) return [];
  console.log(`→ Inserindo vagas…`);

  const out = [];
  const { name: pkName, def: pkDef } = getPkAttr(Vaga);
  const pkIsUuid = (pkDef?.type?.key || '').toLowerCase() === 'uuid';

  for (const v of arr) {
    // empresa_id: aceita (a) direto; (b) por cnpj do JSON; (c) usa qualquer empresa inserida
    let empresa_id = v.empresa_id;
    if (!empresa_id && v.empresa_cnpj && empresasPorCnpj[v.empresa_cnpj]) {
      empresa_id = empresasPorCnpj[v.empresa_cnpj].id;
    }
    if (!empresa_id) {
      const any = Object.values(empresasPorCnpj)[0];
      empresa_id = any?.id || randomUUID();
    }

    const skills_obrigatorias = uniq(toArray(v.skills_obrigatorias));
    const skills_desejaveis = uniq(toArray(v.skills_desejaveis));
    const areas_relacionadas = uniq(toArray(v.areas_relacionadas));

    const titulo = nonEmptyOr('Vaga sem título')(v.titulo);
    const area_atuacao = nonEmptyOr('Tecnologia')(v.area_atuacao);
    const nivel_experiencia = normalizeNivel(v.nivel_experiencia);
    const tipo_contrato = normalizeContrato(v.tipo_contrato);
    const modalidade_trabalho = normalizeModalidade(v.modalidade_trabalho);
    const localizacao_texto = nonEmptyOr('Manaus - AM')(v.localizacao_texto);

    const descricao_geral = minLenOrDefault(v.descricao_geral, 20);
    const principais_responsabilidades =
      nonEmptyOr('Executar atividades da função conforme orientação do gestor.')(v.principais_responsabilidades);
    const requisitos_obrigatorios =
      nonEmptyOr('Requisitos essenciais: responsabilidade, comunicação e trabalho em equipe.')(v.requisitos_obrigatorios);
    const habilidades_tecnicas = nonEmptyOr(
      (skills_obrigatorias.concat(skills_desejaveis).join(', ')) || 'Comunicação'
    )(v.habilidades_tecnicas);

    const contato_nome = contatoNomeOr(v.contato_nome);
    const contato_email = emailOk(v.contato_email);

    const payload = {
      ...(pkIsUuid ? { [pkName]: isUuid(v.id) ? v.id : randomUUID() } : {}), // gera UUID se necessário
      empresa_id,
      titulo,
      area_atuacao,
      nivel_experiencia,
      tipo_contrato,
      modalidade_trabalho,
      localizacao_texto,
      quantidade_vagas: toNum(v.quantidade_vagas) || 1,
      salario_minimo: toNum(v.salario_minimo),
      salario_maximo: toNum(v.salario_maximo),
      moeda: v.moeda || 'BRL',
      beneficios_oferecidos: toStr(v.beneficios_oferecidos) || null,
      descricao_geral,
      principais_responsabilidades,
      requisitos_obrigatorios,
      requisitos_desejados: toStr(v.requisitos_desejados) || null,
      habilidades_tecnicas,
      habilidades_comportamentais: toStr(v.habilidades_comportamentais) || null,
      formacao_minima: toStr(v.formacao_minima) || null,
      experiencia_minima: toStr(v.experiencia_minima) || null,
      idiomas_necessarios: toStr(v.idiomas_necessarios) || null,
      certificacoes_desejadas: toStr(v.certificacoes_desejadas) || null,
      horario_trabalho: toStr(v.horario_trabalho) || null,
      data_inicio_desejada: v.data_inicio_desejada || null,
      data_limite_inscricoes: v.data_limite_inscricoes || null,
      processo_seletivo: toStr(v.processo_seletivo) || null,
      palavras_chave:
        uniq([v.titulo, v.area_atuacao, ...(skills_obrigatorias || []), ...(skills_desejaveis || [])]).join(', ') || null,
      contato_nome,
      contato_email,
      contato_telefone: toStr(v.contato_telefone) || null,
      observacoes: toStr(v.observacoes) || null,
      skills_obrigatorias,
      skills_desejaveis,
      areas_relacionadas,
      status: normalizeEmpresaStatus(v.status) === 'ativo' ? 'ativo' : 'ativo',
      visualizacoes: toNum(v.visualizacoes) || 0,
      candidaturas: toNum(v.candidaturas) || 0,
      detalhes_extras: v.detalhes_extras || {},
      metricas_vaga: v.metricas_vaga || {},
      created_at: v.created_at || new Date(),
      updated_at: v.updated_at || new Date(),
    };

    const row = await Vaga.create(payload, { transaction: t });
    out.push(row.dataValues);
  }
  return out;
}

async function createCandidaturas(arr, vagasIndex, freelasIndex, t) {
  if (!Candidatura || !arr || arr.length === 0) return [];
  console.log(`→ Inserindo candidaturas…`);

  const out = [];

  // Descobrir nomes das FKs e PK dinamicamente
  const fkVagaName =
    pickFirstExistingAttr(Candidatura, ['vaga_id', 'id_vaga', 'vagaId']) || 'vaga_id';
  const fkFreelaName =
    pickFirstExistingAttr(Candidatura, ['freelancer_id', 'id_freelancer', 'freelancerId']) || 'freelancer_id';

  const { name: pkName, def: pkDef } = getPkAttr(Candidatura);
  const pkIsUuid = (pkDef?.type?.key || '').toLowerCase() === 'uuid';

  for (const c of arr) {
    // Resolver IDs referenciados (caso precisasse mapear por outro campo; aqui usamos direto)
    const vagaId = c.id_vaga || c.vaga_id || c.vagaId;
    const freelancerId = c.id_freelancer || c.freelancer_id || c.freelancerId;

    const payload = {
      ...(pkIsUuid ? { [pkName]: isUuid(c.id) ? c.id : randomUUID() } : {}), // seta PK só se for UUID
      [fkVagaName]: vagaId,
      [fkFreelaName]: freelancerId,
      mensagem_candidato: c.mensagem_candidato || null,
      status: c.status || 'pendente',
      data_candidatura: c.data_candidatura || new Date(),
      dados_extras: c.dados_extras || {},
      created_at: c.created_at || new Date(),
      updated_at: c.updated_at || new Date(),
    };

    // Validação simples antes de inserir
    if (!payload[fkVagaName] || !payload[fkFreelaName]) {
      throw new Error(
        `❌ Candidatura inválida: faltando FK (vaga=${payload[fkVagaName]} freela=${payload[fkFreelaName]}).`
      );
    }

    const row = await Candidatura.create(payload, { transaction: t });
    out.push(row.dataValues);
  }
  return out;
}

// ====== MAIN ======
async function main() {
  try {
    await sequelize.query('SELECT 1+1 AS result');
    console.log('✅ Conectado ao banco.');

    const json = readJsonOrDie(JSON_PATH);
    const empresas = toArray(json.empresas);
    const freelancers = toArray(json.freelancers);
    const vagas = toArray(json.vagas);
    const candidaturas = toArray(json.candidaturas);

    await sequelize.transaction(async (t) => {
      // Empresas
      const rowsEmpresas = await upsertEmpresas(empresas, t);

      // Mapa por CNPJ para linkar vagas
      const empresasPorCnpj = {};
      for (const e of rowsEmpresas) {
        if (e.cnpj) empresasPorCnpj[e.cnpj] = e;
      }

      // Freelancers (opcional)
      const rowsFreelas = await createFreelancers(freelancers, t);

      // Índices simples (se quiser resolver por email/nome, etc.)
      const freelasIndex = {};
      for (const f of rowsFreelas) {
        freelasIndex[f.id] = f;
        if (f.email) freelasIndex[f.email] = f;
      }

      // Vagas
      const rowsVagas = await createVagas(vagas, empresasPorCnpj, t);

      const vagasIndex = {};
      for (const v of rowsVagas) {
        vagasIndex[v.id] = v;
        if (v.titulo) vagasIndex[v.titulo] = v;
      }

      // Candidaturas (opcional)
      const rowsCands = await createCandidaturas(candidaturas, vagasIndex, freelasIndex, t);

      console.log('—'.repeat(60));
      console.log(`✅ Empresas:      ${rowsEmpresas.length}`);
      if (Freelancer) console.log(`✅ Freelancers:   ${rowsFreelas.length}`);
      console.log(`✅ Vagas:         ${rowsVagas.length}`);
      if (Candidatura) console.log(`✅ Candidaturas:  ${rowsCands.length}`);
      console.log('—'.repeat(60));
    });

    console.log('🎉 Seed finalizado com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err);
    // Dica rápida de diagnóstico:
    try {
      if (Candidatura) {
        console.error('ℹ️ Atributos de Candidatura:', Object.keys(Candidatura.rawAttributes || {}));
      }
    } catch (_) {}
    process.exit(1);
  }
}

main();
