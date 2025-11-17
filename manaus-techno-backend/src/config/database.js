const fs = require('fs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Ordem de prioridade:
 * 1) Arquivo (DB_PASS_FILE / DB_PASSWORD_FILE) -> usado em produção/Docker
 * 2) DB_PASSWORD ou DB_PASS -> usado no desenvolvimento local
 */
function getDbPassword() {
  const filePath = process.env.DB_PASS_FILE || process.env.DB_PASSWORD_FILE;
  if (filePath) {
    try {
      const pwd = fs.readFileSync(filePath, 'utf8').trim();
      return pwd;
    } catch (err) {
      console.error('Erro ao ler arquivo de senha do banco:', err.message);
    }
  }

  if (process.env.DB_PASSWORD) return process.env.DB_PASSWORD;
  if (process.env.DB_PASS) return process.env.DB_PASS;

  return '';
}

// Configuração da conexão com PostgreSQL
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: getDbPassword(),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
