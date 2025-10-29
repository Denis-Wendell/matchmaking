//Vaga.js - Modelo Sequelize para a tabela 'vagas'
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vaga = sequelize.define('Vaga', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  empresa_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'empresas', // Nome da tabela
      key: 'id',
    },
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Título da vaga é obrigatório' },
      len: { args: [5, 255], msg: 'Título deve ter entre 5 e 255 caracteres' },
    },
  },
  area_atuacao: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Área de atuação é obrigatória' },
    },
  },
  nivel_experiencia: {
    type: DataTypes.ENUM('junior', 'pleno', 'senior', 'especialista'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nível de experiência é obrigatório' },
    },
  },
  tipo_contrato: {
    type: DataTypes.ENUM('clt', 'pj', 'estagio', 'freelancer', 'temporario'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Tipo de contrato é obrigatório' },
    },
  },
  modalidade_trabalho: {
    type: DataTypes.ENUM('presencial', 'remoto', 'hibrido'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Modalidade de trabalho é obrigatória' },
    },
  },
  localizacao_texto: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Localização é obrigatória' },
    },
  },
localizacao: {
  type: DataTypes.GEOGRAPHY('POINT'),
  allowNull: true,
  },
  quantidade_vagas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    validate: {
      min: { args: [1], msg: 'Quantidade de vagas deve ser pelo menos 1' },
    },
  },
  salario_minimo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Salário mínimo deve ser positivo' },
    },
  },
  salario_maximo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Salário máximo deve ser positivo' },
    },
  },
  moeda: {
    type: DataTypes.STRING(3),
    allowNull: true,
    defaultValue: 'BRL',
    validate: {
      len: { args: [3, 3], msg: 'Moeda deve ter 3 caracteres (ex: BRL, USD)' },
    },
  },
  beneficios_oferecidos: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  descricao_geral: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Descrição geral é obrigatória' },
      len: { args: [20], msg: 'Descrição deve ter pelo menos 20 caracteres' },
    },
  },
  principais_responsabilidades: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Principais responsabilidades são obrigatórias' },
    },
  },
  requisitos_obrigatorios: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Requisitos obrigatórios são obrigatórios' },
    },
  },
  requisitos_desejados: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  habilidades_tecnicas: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Habilidades técnicas são obrigatórias' },
    },
  },
  habilidades_comportamentais: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  formacao_minima: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  experiencia_minima: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  idiomas_necessarios: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  certificacoes_desejadas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  horario_trabalho: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  data_inicio_desejada: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  data_limite_inscricoes: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  processo_seletivo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  palavras_chave: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  contato_nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome do contato é obrigatório' },
    },
  },
  contato_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: { msg: 'Email de contato deve ser válido' },
      notEmpty: { msg: 'Email de contato é obrigatório' },
    },
  },
  contato_telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  skills_obrigatorias: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
    validate: {
      notEmpty: { msg: 'Skills obrigatórias são obrigatórias' },
    },
  },
  skills_desejaveis: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
  },
  areas_relacionadas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
  },
  detalhes_extras: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  metricas_vaga: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'pausado', 'pendente'),
    allowNull: true,
    defaultValue: 'ativo',
  },
  visualizacoes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  candidaturas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  tableName: 'vagas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Definir associação com Empresa
Vaga.associate = function(models) {
  Vaga.belongsTo(models.Empresa, {
    foreignKey: 'empresa_id',
    as: 'empresa'
  });
};

module.exports = Vaga;