// scripts/seed-demo.js
require('dotenv').config();
const { fakerPT_BR: faker } = require('@faker-js/faker');

const { sequelize, testConnection } = require('../src/config/database');
const { setupAssociations } = require('../src/models/associations');

const Freelancer  = require('../src/models/Freelancer');
const Empresa     = require('../src/models/Empresa');
const Vaga        = require('../src/models/Vaga');
const Candidatura = require('../src/models/Candidatura');

/* ================== PARÂMETROS ================== */
// mínimos pedidos
const NUM_EMPRESAS          = Number(process.env.SEED_EMPRESAS)    || 30;
const NUM_FREELANCERS       = Number(process.env.SEED_FREELANCERS) || 120;
const VAGAS_MIN_POR_EMPRESA = 10;
const VAGAS_MAX_POR_EMPRESA = 16;
const CANDS_MIN_POR_VAGA    = 3;
const CANDS_MAX_POR_VAGA    = 12;

/* ================== HELPERS ================== */
const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)];
const range  = (n) => Array.from({ length: n }, (_, i) => i);
const unique = (arr) => Array.from(new Set(arr));
const cepFmt  = () => faker.helpers.replaceSymbols('#####-###');
const cnpjFmt = () => faker.helpers.replaceSymbols('##.###.###/####-##');
const cpfFmt  = ()  => faker.helpers.replaceSymbols('###.###.###-##');

const enumTamanhoEmpresa = ['startup','pequena','media','grande','multinacional'];
const enumStatusEmpresa  = ['ativo','inativo','pendente','bloqueado','pausado'];
const enumModalidade     = ['remoto','presencial','hibrido'];
const enumContrato       = ['clt','pj','estagio','freelancer','temporario'];
const enumNivel          = ['junior','pleno','senior','especialista'];

const techs = [
  'Node.js','React','React Native','TypeScript','JavaScript','Java','Spring Boot',
  'Python','Django','FastAPI','Go','Kotlin','PHP','Laravel','Ruby on Rails',
  'PostgreSQL','MongoDB','Redis','RabbitMQ',
  'AWS','Azure','GCP','Docker','Kubernetes','Terraform','CI/CD','Grafana','Prometheus',
  'GraphQL','gRPC','Next.js','NestJS'
];

const softSkills = [
  'Comunicação','Trabalho em equipe','Proatividade','Liderança','Pensamento crítico',
  'Gestão de tempo','Organização','Resolução de problemas','Adaptabilidade','Empatia',
  'Visão sistêmica','Atenção aos detalhes'
];

const areas = [
  'Tecnologia','Marketing','Vendas','RH','Financeiro','Produto','Suporte',
  'Operações','Design','Dados'
];

const cidadesBR = [
  'São Paulo/SP','Rio de Janeiro/RJ','Belo Horizonte/MG','Curitiba/PR',
  'Porto Alegre/RS','Recife/PE','Fortaleza/CE','Manaus/AM','Brasília/DF','Salvador/BA',
  'Florianópolis/SC','Natal/RN','Goiânia/GO','Belém/PA','Campinas/SP'
];

function pickSome(array, min=2, max=5) {
  const qtd = faker.number.int({ min, max });
  return unique(faker.helpers.shuffle(array)).slice(0, qtd);
}

function randomPointBR() {
  const lat = faker.location.latitude({ min: -33.7, max: 5.3 });
  const lng = faker.location.longitude({ min: -73.9, max: -34.8 });
  return { type: 'Point', coordinates: [lng, lat] };
}

function salarioFaixa() {
  const min = faker.number.int({ min: 3000, max: 12000 });
  const max = min + faker.number.int({ min: 2000, max: 12000 });
  return { min, max };
}

function dateOnlySoon(days) {
  const d = faker.date.soon({ days });
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/* ===== TÍTULOS PT-BR REALISTAS ===== */
const stacks = [
  'Node.js', 'React', 'React Native', 'TypeScript', 'Python', 'Django', 'Java',
  'Spring Boot', 'Go', 'Kotlin', 'AWS', 'Azure', 'GCP', 'Dados', 'QA', 'DevOps', 'SRE',
  'Product Design', 'UX/UI', 'Product Management'
];

const cargosBase = [
  'Desenvolvedor(a) Backend', 'Desenvolvedor(a) Frontend', 'Desenvolvedor(a) Fullstack',
  'Engenheiro(a) de Dados', 'Analista de Dados', 'Cientista de Dados',
  'DevOps Engineer', 'Site Reliability Engineer', 'QA Engineer',
  'Product Designer', 'UX/UI Designer', 'Product Manager'
];

function tituloRealista({ nivel }) {
  const cargo = pick(cargosBase);
  const stack = pick(stacks);
  const senioridade =
    nivel === 'junior' ? 'Júnior' :
    nivel === 'pleno' ? 'Pleno' :
    nivel === 'senior' ? 'Sênior' : 'Especialista';

  let titulo = `${cargo} ${stack} — ${senioridade}`.replace(/\s+/g, ' ').trim();
  if (titulo.length < 5) titulo = `Desenvolvedor(a) ${stack} — ${senioridade}`;
  if (titulo.length > 255) titulo = titulo.slice(0, 255);
  return titulo;
}

/* ===== TEXTOS PT-BR REALISTAS ===== */
function descricaoVaga(area, nivel) {
  const blocos = [
    `Estamos em busca de uma pessoa ${nivel} para atuar em ${area}, contribuindo diretamente com a evolução dos nossos produtos digitais.`,
    `Aqui você encontrará um ambiente colaborativo, com ciclos curtos de entrega, feedbacks constantes e autonomia para propor melhorias.`,
    `Trabalhamos com boas práticas de engenharia, testes automatizados e monitoramento, sempre focados em gerar valor para o negócio.`,
    `Valorizamos aprendizado contínuo, compartilhamento de conhecimento e uma cultura que prioriza transparência e confiança.`
  ];
  return blocos.join(' ');
}

function culturaEmpresaTexto() {
  const l = [
    'Cultura orientada a pessoas e resultado',
    'Transparência e autonomia',
    'Feedback contínuo e aprendizado',
    'Diversidade e inclusão como prioridade',
    'Apoio a capacitação e certificações',
  ];
  return `${l.slice(0, faker.number.int({min:3, max:5})).join(' • ')}.`;
}

function responsabilidadesTexto() {
  const l = [
    'Desenvolver e manter serviços, APIs e integrações.',
    'Participar de code reviews e pair programming.',
    'Colaborar com Produto e Design na definição de soluções.',
    'Escrever testes automatizados e documentação.',
    'Contribuir para a melhoria contínua de performance e segurança.',
    'Apoiar na observabilidade (logs, métricas e alertas).'
  ];
  return l.slice(0, faker.number.int({min:4, max:6})).join(' ');
}

function requisitosObrigatoriosTexto(stackPrincipal) {
  const l = [
    `Experiência com ${stackPrincipal} no dia a dia.`,
    'Conhecimento sólido em versionamento com Git.',
    'Boas práticas de desenvolvimento, testes e CI/CD.',
    'Capacidade de trabalhar em equipe e comunicar soluções.',
  ];
  return l.join(' ');
}

function requisitosDesejadosTexto() {
  const l = [
    'Vivência com Docker e Kubernetes.',
    'Conhecimento em mensageria (RabbitMQ/SQS/Kafka).',
    'Experiência com monitoramento e observabilidade.',
    'Noções de arquitetura de microsserviços.',
  ];
  return l.slice(0, faker.number.int({min:2, max:4})).join(' ');
}

function experienciaMinimaTexto(nivel) {
  if (nivel === 'junior') return '1+ ano de experiência relevante.';
  if (nivel === 'pleno')  return '2–3+ anos de experiência relevante.';
  if (nivel === 'senior') return '4–6+ anos de experiência relevante.';
  return '6+ anos de experiência relevante.';
}

/* =============== EMPRESAS =============== */
async function criarEmpresas(qtd) {
  const empresas = [];
  for (const _ of range(qtd)) {
    const nomeEmp   = faker.company.name();
    const dominio   = faker.internet.domainName();
    const emailCorp = `contato@${dominio}`;
    const respoEmail = `rh@${dominio}`;

    const empresa = await Empresa.create({
      id: undefined,
      nome: nomeEmp,
      cnpj: cnpjFmt(),
      email_corporativo: emailCorp,
      senha_hash: 'Senha123!', // hook hasheia
      telefone: faker.phone.number('+55 ## #####-####'),
      endereco_completo: faker.location.streetAddress({ useFullAddress: true }),
      cidade: faker.location.city(),
      estado: faker.location.state({ abbreviated: true }),
      cep: cepFmt(),
      localizacao: randomPointBR(),
      setor_atuacao: pick(areas),
      tamanho_empresa: pick(enumTamanhoEmpresa),
      site_empresa: `https://www.${dominio}`,
      descricao_empresa: `A ${nomeEmp} atua com foco em inovação e experiência do cliente. ${culturaEmpresaTexto()}`,
      principais_beneficios: pickSome([
        'Plano de saúde','Vale refeição','Home office','Auxílio educação',
        'Gympass','Bônus anual','Horário flexível','Auxílio creche','Auxílio Home Office'
      ], 3, 6).join(', '),
      cultura_empresa: culturaEmpresaTexto(),
      responsavel_nome: faker.person.fullName(),
      responsavel_cargo: pick(['CTO','CEO','Head de Pessoas','Tech Lead','COO','HRBP']),
      responsavel_email: respoEmail,
      responsavel_telefone: faker.phone.number('+55 ## #####-####'),
      areas_atuacao: pickSome(areas, 2, 4),
      beneficios_array: pickSome([
        'VR','VT','PLR','Assistência Médica','Assistência Odontológica',
        'Seguro de Vida','Auxílio Home Office','Previdência Privada','Day-off aniversário'
      ], 3, 8),
      tecnologias_usadas: pickSome(techs, 5, 10),
      dados_empresa: {
        anoFundacao: faker.number.int({ min: 1980, max: 2024 }),
        faturamentoEstimado: faker.number.int({ min: 500000, max: 20000000 }),
        investidores: pickSome(['Angel','Seed','Série A','Série B','Bootstrap'], 1, 2),
      },
      configuracoes: {
        recebeCurriculoPorEmail: faker.datatype.boolean(),
        notificacoes: { email: true, sms: faker.datatype.boolean() },
      },
      status: pick(enumStatusEmpresa),
      verificada: faker.datatype.boolean(),
      ultimo_login: faker.date.recent({ days: 20 }),
      created_at: undefined,
      updated_at: undefined,
    });

    empresas.push(empresa);
  }
  return empresas;
}

/* =============== VAGAS =============== */
async function criarVagasParaEmpresa(empresa) {
  const qtd = faker.number.int({ min: VAGAS_MIN_POR_EMPRESA, max: VAGAS_MAX_POR_EMPRESA });
  const payload = [];

  for (const _ of range(qtd)) {
    const area  = pick(['Tecnologia','Produto','Dados','Design']);
    const nivel = pick(enumNivel);
    const cidadeTexto = pick(cidadesBR);
    const { min: salMin, max: salMax } = salarioFaixa();
    const stackPrincipal = pick(['Node.js','React','React Native','Python','Django','Java','Spring Boot','Go','Kotlin','TypeScript']);

    const vaga = {
      id: undefined,
      empresa_id: empresa.id,
      titulo: tituloRealista({ nivel }),
      area_atuacao: area,
      nivel_experiencia: nivel,
      tipo_contrato: pick(enumContrato),
      modalidade_trabalho: pick(enumModalidade),
      localizacao_texto: cidadeTexto,
      localizacao: randomPointBR(),
      quantidade_vagas: faker.number.int({ min: 1, max: 7 }),
      salario_minimo: salMin,
      salario_maximo: salMax,
      moeda: 'BRL',
      beneficios_oferecidos: pickSome(
        ['VR','VT','PLR','Assistência Médica','Gympass','Horário Flexível','Day-off'], 3, 6
      ).join(', '),

      descricao_geral: descricaoVaga(area, nivel),
      principais_responsabilidades: responsabilidadesTexto(),
      requisitos_obrigatorios: requisitosObrigatoriosTexto(stackPrincipal),
      requisitos_desejados: requisitosDesejadosTexto(),

      habilidades_tecnicas: pickSome(techs, 6, 10).join(', '),
      habilidades_comportamentais: pickSome(softSkills, 4, 7).join(', '),
      formacao_minima: pick(['Graduação','Tecnólogo','Indiferente']),
      experiencia_minima: experienciaMinimaTexto(nivel),
      idiomas_necessarios: pick(['Inglês técnico','Inglês intermediário','Português nativo','Espanhol básico']),
      certificacoes_desejadas: pick(['AWS Cloud Practitioner','Scrum Master','Azure Fundamentals','—']).toString(),
      horario_trabalho: pick(['9h–18h','10h–19h','Horário flexível']),
      data_inicio_desejada: dateOnlySoon(60),
      data_limite_inscricoes: dateOnlySoon(90),
      processo_seletivo: 'Triagem → entrevista técnica → case prático → entrevista final.',
      palavras_chave: pickSome(
        ['node','react','postgres','docker','aws','ci/cd','microservices','graphql','redis'], 5, 9
      ).join(','),

      contato_nome: empresa.responsavel_nome,
      contato_email: empresa.responsavel_email || empresa.email_corporativo,
      contato_telefone: empresa.responsavel_telefone || empresa.telefone,

      observacoes: faker.lorem.sentence(),
      skills_obrigatorias: pickSome(
        ['Node.js','TypeScript','PostgreSQL','Docker','Git','Jest','REST','React','Java','Spring Boot','Python','Django'], 4, 6
      ),
      skills_desejaveis: pickSome(
        ['AWS','Kubernetes','Redis','RabbitMQ','GraphQL','gRPC','Kafka'], 2, 4
      ),
      areas_relacionadas: pickSome(['Backend','Fullstack','DevOps','Dados'], 1, 2),

      detalhes_extras: { remotoTotal: faker.datatype.boolean(), notebookEmpresa: faker.datatype.boolean() },
      metricas_vaga: { prioridade: pick(['alta','média','baixa']), SLA_dias: faker.number.int({ min: 7, max: 45 }) },
      status: 'ativo',
      visualizacoes: faker.number.int({ min: 10, max: 1500 }),
      candidaturas: 0,

      created_at: undefined,
      updated_at: undefined,
    };

    // garantias finais
    if (!vaga.titulo || vaga.titulo.length < 5) {
      vaga.titulo = `Desenvolvedor(a) ${stackPrincipal} — Pleno`;
    }
    if (vaga.titulo.length > 255) vaga.titulo = vaga.titulo.slice(0, 255);
    if (!vaga.descricao_geral || vaga.descricao_geral.length < 20) {
      vaga.descricao_geral = descricaoVaga(area, nivel);
    }
    payload.push(vaga);
  }

  await Vaga.bulkCreate(payload, { validate: true });
}

/* =============== FREELANCERS =============== */
async function criarFreelancers(qtd) {
  const freelancers = [];
  for (const _ of range(qtd)) {
    const firstName = faker.person.firstName();
    const lastName  = faker.person.lastName();
    const nome = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName });

    const f = await Freelancer.create({
      id: undefined,
      nome,
      email,
      senha_hash: 'Senha123!', // hook hasheia
      telefone: faker.phone.number('+55 ## #####-####'),
      cpf: cpfFmt(),
      data_nascimento: faker.date.birthdate({ min: 1965, max: 2004, mode: 'year' }),
      endereco_completo: faker.location.streetAddress({ useFullAddress: true }),
      cidade: faker.location.city(),
      estado: faker.location.state({ abbreviated: true }),
      cep: cepFmt(),
      localizacao: randomPointBR(),
      profissao: pick(['Desenvolvedor','Designer','Analista de Dados','DevOps','QA','PM']),
      area_atuacao: pick(['Tecnologia','Dados','Design','Produto']),
      nivel_experiencia: pick(enumNivel),
      valor_hora: faker.number.int({ min: 60, max: 300 }),
      principais_habilidades: pickSome(softSkills, 4, 7).join(', '),
      idiomas: pickSome(['Português','Inglês','Espanhol','Francês'], 1, 2),
      disponibilidade: pick(['40h/semana','20h/semana','Projeto pontual','Freelancer em meio período']),
      modalidade_trabalho: pick(enumModalidade),
      resumo_profissional: `Profissional com experiência em ${pickSome(techs, 3, 6).join(', ')}. Atuando com boas práticas e foco em resultados.`,
      experiencia_profissional: `Participação em projetos ágeis, integração contínua e colaboração com equipes multidisciplinares. ${faker.lorem.sentence()}`,
      objetivos_profissionais: 'Crescimento técnico, impacto no produto e ambiente colaborativo.',
      formacao_academica: pick(['Ciência da Computação','Sistemas de Informação','Design Gráfico','Engenharia de Software']),
      instituicao: faker.company.name(),
      ano_conclusao: faker.number.int({ min: 2008, max: 2027 }),
      certificacoes: pickSome(['AWS Cloud Practitioner','Scrum Fundamentals','Linux Essentials','Oracle Java','PMI-ACP'], 0, 3).join(', '),
      url_portfolio: faker.internet.url(),
      linkedin: `https://www.linkedin.com/in/${faker.internet.username({ firstName, lastName })}`,
      github: `https://github.com/${faker.internet.username({ firstName, lastName })}`,
      skills_array: pickSome(['Node.js','React','TypeScript','PostgreSQL','Docker','Kubernetes','Python','Django','FastAPI','RabbitMQ','Redis'], 5, 9),
      areas_interesse: pickSome(['Backend','Fullstack','DevOps','Data','Design','Produto'], 2, 4),
      portfolio_projetos: { destaque: faker.lorem.words({ min: 2, max: 4 }), links: [faker.internet.url()] },
      configuracoes_usuario: { aceitaContatoPorEmail: true, aceitaContatoPorWhats: faker.datatype.boolean() },
      dados_analytics: { visitasPerfil: faker.number.int({ min: 0, max: 500 }) },
      status: 'ativo',
      ultimo_login: faker.date.recent({ days: 15 }),
      created_at: undefined,
      updated_at: undefined,
    });

    freelancers.push(f);
  }
  return freelancers;
}

/* =============== CANDIDATURAS =============== */
async function criarCandidaturas(freelancers, vagas) {
  for (const vaga of vagas) {
    const qtd = faker.number.int({ min: CANDS_MIN_POR_VAGA, max: CANDS_MAX_POR_VAGA });
    const candidatos = faker.helpers.shuffle(freelancers).slice(0, qtd);

    for (const freelancer of candidatos) {
      const possiveis = ['pendente','visualizada','interessado','nao_interessado','rejeitada','contratado'];
      const status = pick(possiveis);

      const dataCand = faker.date.recent({ days: 40 });
      const dataViz  = ['visualizada','interessado','nao_interessado','rejeitada','contratado'].includes(status)
        ? faker.date.soon({ days: 10, refDate: dataCand })
        : null;
      const dataResp = ['interessado','nao_interessado','rejeitada','contratado'].includes(status)
        ? faker.date.soon({ days: 15, refDate: dataViz || dataCand })
        : null;

      await Candidatura.create({
        id: undefined,
        vaga_id: vaga.id,
        freelancer_id: freelancer.id,
        mensagem_candidato: `Olá! Tenho experiência alinhada aos requisitos e disponibilidade para iniciar em breve. ${faker.lorem.sentence()}`,
        status,
        data_candidatura: dataCand,
        data_visualizacao: dataViz,
        data_resposta: dataResp,
        feedback_empresa: ['nao_interessado','rejeitada'].includes(status)
          ? 'Agradecemos o interesse. No momento seguiremos com outros perfis.'
          : (status === 'contratado' ? 'Parabéns! Seguimos com a proposta.' : null),
        dados_extras: {
          pretensao: faker.number.int({ min: 60, max: 250 }), // R$/hora
          disponibilidade_inicio: dateOnlySoon(30),
          anexos: [],
        },
        created_at: undefined,
        updated_at: undefined,
      });

      // contador de candidaturas da vaga
      await Vaga.update(
        { candidaturas: (vaga.candidaturas || 0) + 1 },
        { where: { id: vaga.id } }
      );
      vaga.candidaturas = (vaga.candidaturas || 0) + 1;
    }
  }
}

/* =============== MAIN =============== */
async function main() {
  console.log('🚀 Seed REALISTA iniciando...');
  await testConnection();
  setupAssociations();
  await sequelize.authenticate();

  const t = await sequelize.transaction();
  try {
    console.log(`→ Criando ${NUM_EMPRESAS} empresas...`);
    const empresas = await criarEmpresas(NUM_EMPRESAS);

    console.log(`→ Criando vagas (${VAGAS_MIN_POR_EMPRESA}–${VAGAS_MAX_POR_EMPRESA} por empresa)...`);
    for (const emp of empresas) {
      await criarVagasParaEmpresa(emp);
    }

    console.log(`→ Criando ${NUM_FREELANCERS} freelancers...`);
    const freelancers = await criarFreelancers(NUM_FREELANCERS);

    const vagas = await Vaga.findAll({ order: [['created_at','DESC']] });

    console.log('→ Criando candidaturas realistas por vaga...');
    await criarCandidaturas(freelancers, vagas);

    await t.commit();
    console.log('✅ Seed COMPLETO concluído!');
    await sequelize.close();
  } catch (err) {
    await t.rollback();
    console.error('❌ Falha no seed:', err);
    process.exit(1);
  }
}

main();
