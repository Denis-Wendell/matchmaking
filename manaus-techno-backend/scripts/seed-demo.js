// scripts/seed-demo.js
require('dotenv').config();
const { fakerPT_BR: faker } = require('@faker-js/faker');

const { sequelize, testConnection } = require('../src/config/database');
const { setupAssociations } = require('../src/models/associations');

const Freelancer = require('../src/models/Freelancer');
const Empresa    = require('../src/models/Empresa');
const Vaga       = require('../src/models/Vaga');
const Candidatura= require('../src/models/Candidatura');

// ================== PARÂMETROS ==================
const NUM_EMPRESAS           = Number(process.env.SEED_EMPRESAS)    || 10;
const NUM_FREELANCERS        = Number(process.env.SEED_FREELANCERS) || 40;
const VAGAS_MIN_POR_EMPRESA  = 3;
const VAGAS_MAX_POR_EMPRESA  = 4;
const CANDS_MIN_POR_VAGA     = 2;
const CANDS_MAX_POR_VAGA     = 6;

// ================== HELPERS ==================
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const range = (n) => Array.from({ length: n }, (_, i) => i);
const unique = (arr) => Array.from(new Set(arr));
const cepFmt = () => faker.helpers.replaceSymbols('#####-###');
const cnpjFmt = () => faker.helpers.replaceSymbols('##.###.###/####-##');
const cpfFmt = ()  => faker.helpers.replaceSymbols('###.###.###-##');

const enumTamanhoEmpresa = ['startup','pequena','media','grande','multinacional'];
const enumStatusEmpresa  = ['ativo','inativo','pendente','bloqueado','pausado'];
const enumModalidade     = ['remoto','presencial','hibrido'];
const enumContrato       = ['clt','pj','estagio','freelancer','temporario'];
const enumNivel          = ['junior','pleno','senior','especialista'];

const techs = [
  'Node.js','React','PostgreSQL','MongoDB','AWS','Docker','Kubernetes',
  'Python','Django','FastAPI','TypeScript','Next.js','Redis','RabbitMQ',
  'CI/CD','Terraform','GCP','Azure','GraphQL','Prisma','Sequelize'
];

const softSkills = [
  'Comunicação','Trabalho em equipe','Proatividade','Liderança','Pensamento crítico',
  'Gestão de tempo','Organização','Resolução de problemas','Adaptabilidade','Empatia'
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

function paragrafo(n = 3) {
  return range(n).map(() => faker.lorem.sentences({ min: 1, max: 3 })).join(' ');
}

function salarioFaixa() {
  const min = faker.number.int({ min: 3000, max: 12000 });
  const max = min + faker.number.int({ min: 2000, max: 12000 });
  return { min, max };
}

function dateOnlySoon(days) {
  // DATEONLY aceita Date, mas vamos garantir só a parte de data
  const d = faker.date.soon({ days });
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// =============== EMPRESAS ===============
async function criarEmpresas(qtd) {
  const empresas = [];
  for (const _ of range(qtd)) {
    const nomeEmp = faker.company.name();
    const dominio = faker.internet.domainName();
    const emailCorp = `contato@${dominio}`;
    const respoEmail = `rh@${dominio}`;

    const { min: salMin, max: salMax } = salarioFaixa();

    const empresa = await Empresa.create({
      // obrigatórios + opcionais TODOS preenchidos:
      id: undefined,
      nome: nomeEmp,
      cnpj: cnpjFmt(), // modelo aceita com máscara ou só dígitos
      email_corporativo: emailCorp,
      senha_hash: 'Senha123!', // hook vai hashear
      telefone: faker.phone.number('+55 ## #####-####'),
      endereco_completo: faker.location.streetAddress({ useFullAddress: true }),
      cidade: faker.location.city(),
      estado: faker.location.state({ abbreviated: true }), // UF
      cep: cepFmt(),
      localizacao: randomPointBR(),
      setor_atuacao: pick(areas),
      tamanho_empresa: pick(enumTamanhoEmpresa),
      site_empresa: `https://www.${dominio}`,
      descricao_empresa: paragrafo(4),
      principais_beneficios: pickSome([
        'Plano de saúde','Vale refeição','Home office','Auxílio educação',
        'Gympass','Bônus anual','Horário flexível','Auxílio creche','Auxílio Home Office'
      ], 3, 6).join(', '),
      cultura_empresa: paragrafo(3),
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
      status: pick(enumStatusEmpresa), // sempre preenchido
      verificada: faker.datatype.boolean(),
      ultimo_login: faker.date.recent({ days: 20 }),
      created_at: undefined,
      updated_at: undefined,
    });

    empresas.push(empresa);
  }
  return empresas;
}

// =============== VAGAS ===============
async function criarVagasParaEmpresa(empresa) {
  const qtd = faker.number.int({ min: VAGAS_MIN_POR_EMPRESA, max: VAGAS_MAX_POR_EMPRESA });

  for (const _ of range(qtd)) {
    const titulo = pick([
      'Desenvolvedor(a) Backend Node.js',
      'Desenvolvedor(a) Fullstack React/Node',
      'Analista de Dados',
      'DevOps Engineer',
      'Product Designer',
      'QA Engineer',
      'Mobile Developer (React Native)',
      'Engenheiro(a) de Dados',
    ]);

    const area = pick(['Tecnologia','Produto','Dados','Design']);
    const cidadeTexto = pick(cidadesBR);
    const { min: salMin, max: salMax } = salarioFaixa();

    await Vaga.create({
      id: undefined,
      empresa_id: empresa.id,
      titulo,
      area_atuacao: area,
      nivel_experiencia: pick(enumNivel),
      tipo_contrato: pick(enumContrato),
      modalidade_trabalho: pick(enumModalidade),
      localizacao_texto: cidadeTexto,
      localizacao: randomPointBR(),
      quantidade_vagas: faker.number.int({ min: 1, max: 7 }),
      salario_minimo: salMin,
      salario_maximo: salMax,
      moeda: 'BRL',
      beneficios_oferecidos: pickSome(['VR','VT','PLR','Assistência Médica','Gympass','Horário Flexível','Day-off'], 3, 6).join(', '),
      descricao_geral: paragrafo(5),
      principais_responsabilidades: [
        'Desenvolver e manter serviços e APIs.',
        'Participar de code reviews e pair programming.',
        'Colaborar com Produto e Design.',
        'Escrever testes e documentação.'
      ].join(' '),
      requisitos_obrigatorios: [
        'Experiência com Node.js e PostgreSQL.',
        'Conhecimento em Git e boas práticas.',
        'Vivência com testes e CI/CD.'
      ].join(' '),
      requisitos_desejados: [
        'Experiência com Docker/Kubernetes.',
        'Conhecimento em mensageria (RabbitMQ/SQS).'
      ].join(' '),
      habilidades_tecnicas: pickSome(techs, 6, 10).join(', '),
      habilidades_comportamentais: pickSome(softSkills, 4, 7).join(', '),
      formacao_minima: pick(['Graduação','Tecnólogo','Indiferente']),
      experiencia_minima: pick(['1+ ano','2+ anos','3+ anos','5+ anos']),
      idiomas_necessarios: pick(['Inglês técnico','Inglês intermediário','Português nativo','Espanhol básico']),
      certificacoes_desejadas: pick(['AWS Cloud Practitioner','Scrum Master','Azure Fundamentals','—']).toString(),
      horario_trabalho: pick(['9h–18h','10h–19h','Horário flexível']),
      data_inicio_desejada: dateOnlySoon(60),
      data_limite_inscricoes: dateOnlySoon(90),
      processo_seletivo: 'Triagem → entrevista técnica → case prático → entrevista final.',
      palavras_chave: pickSome(['node','react','postgres','docker','aws','ci/cd','microservices','graphql','redis'], 5, 9).join(','),
      contato_nome: empresa.responsavel_nome,
      contato_email: empresa.responsavel_email || empresa.email_corporativo,
      contato_telefone: empresa.responsavel_telefone || empresa.telefone,
      observacoes: faker.lorem.sentence(),
      skills_obrigatorias: pickSome(['Node.js','TypeScript','PostgreSQL','Docker','Git','Jest','REST'], 4, 6),
      skills_desejaveis: pickSome(['AWS','Kubernetes','Redis','RabbitMQ','GraphQL','gRPC'], 2, 4),
      areas_relacionadas: pickSome(['Backend','Fullstack','DevOps','Dados'], 1, 2),
      detalhes_extras: { remotoTotal: faker.datatype.boolean(), notebookEmpresa: faker.datatype.boolean() },
      metricas_vaga: { prioridade: pick(['alta','média','baixa']), SLA_dias: faker.number.int({ min: 7, max: 45 }) },
      status: 'ativo',
      visualizacoes: faker.number.int({ min: 10, max: 1500 }),
      candidaturas: 0, // vamos atualizar depois ao criar candidaturas
      created_at: undefined,
      updated_at: undefined,
    });
  }
}

// =============== FREELANCERS ===============
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
      senha_hash: 'Senha123!', // hook vai hashear
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
      resumo_profissional: paragrafo(3),
      experiencia_profissional: paragrafo(4),
      objetivos_profissionais: paragrafo(2),
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

// =============== CANDIDATURAS ===============
async function criarCandidaturas(freelancers, vagas) {
  // mapeia vagas por empresa e cria candidaturas aleatórias
  for (const vaga of vagas) {
    const qtd = faker.number.int({ min: CANDS_MIN_POR_VAGA, max: CANDS_MAX_POR_VAGA });
    const candidatos = faker.helpers.shuffle(freelancers).slice(0, qtd);

    for (const freelancer of candidatos) {
      // status coerente
      const possiveis = ['pendente','visualizada','interessado','nao_interessado','rejeitada','contratado'];
      const status = pick(possiveis);

      // datas coerentes
      const dataCand = faker.date.recent({ days: 40 });
      const dataViz  = ['visualizada','interessado','nao_interessado','rejeitada','contratado'].includes(status)
        ? faker.date.soon({ days: 10, refDate: dataCand })
        : null;
      const dataResp = ['interessado','nao_interessado','rejeitada','contratado'].includes(status)
        ? faker.date.soon({ days: 15, refDate: dataViz || dataCand })
        : null;

      const cand = await Candidatura.create({
        id: undefined,
        vaga_id: vaga.id,
        freelancer_id: freelancer.id,
        mensagem_candidato: paragrafo(2),
        status,
        data_candidatura: dataCand,
        data_visualizacao: dataViz,
        data_resposta: dataResp,
        feedback_empresa: ['nao_interessado','rejeitada'].includes(status)
          ? faker.lorem.sentences({ min: 1, max: 2 })
          : (status === 'contratado' ? 'Parabéns! Aprovado para a vaga.' : null),
        dados_extras: {
          pretensao: faker.number.int({ min: 60, max: 250 }), // R$/hora
          disponibilidade_inicio: dateOnlySoon(30),
          anexos: [],
        },
        created_at: undefined,
        updated_at: undefined,
      });

      // atualizar contador de candidaturas da vaga
      await Vaga.update(
        { candidaturas: (vaga.candidaturas || 0) + 1 },
        { where: { id: vaga.id } }
      );
      vaga.candidaturas = (vaga.candidaturas || 0) + 1;
    }
  }
}

// =============== MAIN ===============
async function main() {
  console.log('🚀 Seed demo COMPLETO iniciando...');
  await testConnection();
  setupAssociations();
  await sequelize.authenticate();

  const t = await sequelize.transaction();
  try {
    console.log(`→ Criando ${NUM_EMPRESAS} empresas (todos os campos)...`);
    const empresas = await criarEmpresas(NUM_EMPRESAS);

    console.log(`→ Criando vagas (3–4 por empresa) com todos os campos...`);
    for (const emp of empresas) {
      await criarVagasParaEmpresa(emp);
    }

    console.log(`→ Criando ${NUM_FREELANCERS} freelancers (todos os campos)...`);
    const freelancers = await criarFreelancers(NUM_FREELANCERS);

    // carregar vagas recém-criadas para candidaturas
    const vagas = await Vaga.findAll({ order: [['created_at','DESC']] });

    console.log('→ Criando candidaturas (várias por vaga) com todos os campos...');
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
