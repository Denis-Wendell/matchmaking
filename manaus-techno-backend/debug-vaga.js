// Script para debuggar problema de salvamento de vagas
// Execute com: node debug-vaga.js

const { sequelize } = require('./src/config/database');
const Vaga = require('./src/models/Vaga');
const Empresa = require('./src/models/Empresa');

async function debugVaga() {
  try {
    console.log('🔍 === INICIANDO DEBUG DE VAGAS ===\n');

    // 1. Testar conexão com banco
    console.log('1. Testando conexão com banco...');
    await sequelize.authenticate();
    console.log('✅ Conexão com banco OK\n');

    // 2. Verificar se tabela de vagas existe
    console.log('2. Verificando tabela vagas...');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'vagas'
    `);
    
    if (results.length === 0) {
      console.error('❌ PROBLEMA: Tabela "vagas" não existe!');
      console.log('Execute as migrations primeiro');
      return;
    }
    console.log('✅ Tabela vagas existe\n');

    // 3. Verificar estrutura da tabela
    console.log('3. Verificando estrutura da tabela vagas...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'vagas'
      ORDER BY column_name
    `);
    
    console.log('Colunas na tabela vagas:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    console.log('');

    // 4. Verificar ENUMs
    console.log('4. Verificando ENUMs...');
    const [enums] = await sequelize.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname LIKE '%vaga%' 
         OR t.typname LIKE '%nivel%' 
         OR t.typname LIKE '%modalidade%'
         OR t.typname LIKE '%tipo%'
         OR t.typname LIKE '%status%'
      ORDER BY t.typname, e.enumlabel
    `);
    
    console.log('ENUMs encontrados:');
    const enumsByType = {};
    enums.forEach(e => {
      if (!enumsByType[e.enum_name]) {
        enumsByType[e.enum_name] = [];
      }
      enumsByType[e.enum_name].push(e.enum_value);
    });
    
    Object.keys(enumsByType).forEach(enumName => {
      console.log(`  - ${enumName}: [${enumsByType[enumName].join(', ')}]`);
    });
    console.log('');

    // 5. Buscar uma empresa para teste
    console.log('5. Buscando empresa para teste...');
    const empresa = await Empresa.findOne();
    
    if (!empresa) {
      console.error('❌ PROBLEMA: Nenhuma empresa encontrada no banco!');
      console.log('Cadastre uma empresa primeiro');
      return;
    }
    
    console.log('✅ Empresa encontrada:', empresa.nome);
    console.log('   ID:', empresa.id);
    console.log('   Email:', empresa.email_corporativo);
    console.log('');

    // 6. Teste de criação direto no modelo
    console.log('6. Testando criação de vaga diretamente...');
    
    const dadosTestVaga = {
      empresa_id: empresa.id,
      titulo: 'Teste Debug Vaga',
      area_atuacao: 'Teste',
      nivel_experiencia: 'junior', // usando lowercase
      tipo_contrato: 'clt',
      modalidade_trabalho: 'remoto',
      localizacao_texto: 'São Paulo, SP',
      descricao_geral: 'Esta é uma vaga de teste para debug do sistema.',
      principais_responsabilidades: 'Testar o sistema de vagas.',
      requisitos_obrigatorios: 'Conhecimento em debug.',
      habilidades_tecnicas: 'Debug, Testing',
      contato_nome: 'Debug User',
      contato_email: 'debug@test.com',
      skills_obrigatorias: ['Debug', 'Test'],
      status: 'ativo' // CORRIGIDO: usar 'ativo' em vez de 'ativa'
    };

    console.log('Dados da vaga de teste:');
    console.log(JSON.stringify(dadosTestVaga, null, 2));
    console.log('');

    try {
      const novaVaga = await Vaga.create(dadosTestVaga);
      console.log('✅ Vaga criada com sucesso!');
      console.log('   ID:', novaVaga.id);
      console.log('   Título:', novaVaga.titulo);
      console.log('');

      // 7. Verificar se realmente foi salva
      console.log('7. Verificando se vaga foi salva no banco...');
      const vagaVerificacao = await Vaga.findByPk(novaVaga.id);
      
      if (vagaVerificacao) {
        console.log('✅ Vaga encontrada no banco!');
        console.log('   Status:', vagaVerificacao.status);
        console.log('   Empresa ID:', vagaVerificacao.empresa_id);
      } else {
        console.error('❌ PROBLEMA: Vaga não encontrada no banco após criação!');
      }

      // 8. Contar vagas no banco
      console.log('');
      console.log('8. Contando vagas no banco...');
      const totalVagas = await Vaga.count();
      console.log('Total de vagas:', totalVagas);

      // 9. Listar últimas 5 vagas
      console.log('');
      console.log('9. Últimas 5 vagas criadas:');
      const ultimasVagas = await Vaga.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'titulo', 'status', 'created_at']
      });
      
      ultimasVagas.forEach((vaga, index) => {
        console.log(`   ${index + 1}. ${vaga.titulo} (${vaga.status}) - ${vaga.created_at}`);
      });

    } catch (createError) {
      console.error('❌ ERRO ao criar vaga:');
      console.error('   Nome:', createError.name);
      console.error('   Mensagem:', createError.message);
      
      if (createError.errors) {
        console.error('   Erros de validação:');
        createError.errors.forEach(err => {
          console.error(`     - ${err.path}: ${err.message}`);
        });
      }
      
      if (createError.original) {
        console.error('   Erro original do banco:');
        console.error('     ', createError.original.message);
      }
    }

    console.log('\n🔍 === DEBUG CONCLUÍDO ===');

  } catch (error) {
    console.error('❌ ERRO GERAL no debug:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar se arquivo chamado diretamente
if (require.main === module) {
  debugVaga().catch(console.error);
}

module.exports = { debugVaga };