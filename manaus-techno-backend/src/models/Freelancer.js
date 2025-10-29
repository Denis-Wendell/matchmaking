//Freelancer.js - Modelo Sequelize para a tabela 'freelancers'
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const Freelancer = sequelize.define('Freelancer', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome é obrigatório' },
      len: { args: [2, 255], msg: 'Nome deve ter entre 2 e 255 caracteres' },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      msg: 'Este email já está cadastrado',
    },
    validate: {
      isEmail: { msg: 'Email deve ter um formato válido' },
      notEmpty: { msg: 'Email é obrigatório' },
    },
  },
  senha_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Senha é obrigatória' },
    },
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
    validate: {
      is: {
        args: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
        msg: 'CPF deve estar no formato 000.000.000-00 ou apenas números',
      },
    },
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  endereco_completo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: true,
    validate: {
      len: { args: [2, 2], msg: 'Estado deve ter 2 caracteres (UF)' },
    },
  },
  cep: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      is: {
        args: /^\d{5}-?\d{3}$/,
        msg: 'CEP deve estar no formato 00000-000',
      },
    },
  },
localizacao: {
  type: DataTypes.GEOGRAPHY('POINT'),
  allowNull: true,
  },
  profissao: {
    type: DataTypes.STRING(255),
    allowNull: true,
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
  valor_hora: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Valor por hora deve ser positivo' },
    },
  },
  principais_habilidades: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Principais habilidades são obrigatórias' },
    },
  },
  idiomas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
  },
  disponibilidade: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  modalidade_trabalho: {
    type: DataTypes.ENUM('remoto', 'presencial', 'hibrido'),
    allowNull: true,
    defaultValue: 'remoto',
  },
  resumo_profissional: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  experiencia_profissional: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  objetivos_profissionais: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  formacao_academica: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  instituicao: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  ano_conclusao: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: { args: [1900], msg: 'Ano de conclusão deve ser válido' },
      max: { args: [new Date().getFullYear() + 10], msg: 'Ano de conclusão não pode ser muito futuro' },
    },
  },
  certificacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  url_portfolio: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: { msg: 'URL do portfólio deve ser válida' },
    },
  },
  linkedin: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: { msg: 'URL do LinkedIn deve ser válida' },
    },
  },
  github: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: { msg: 'URL do GitHub deve ser válida' },
    },
  },
  skills_array: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
    validate: {
      notEmpty: { msg: 'Skills são obrigatórias' },
    },
  },
  areas_interesse: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
  },
  portfolio_projetos: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [], // <- atualizado para array vazio
  },
  configuracoes_usuario: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  dados_analytics: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'pendente', 'bloqueado'),
    allowNull: true,
    defaultValue: 'ativo',
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'freelancers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  defaultScope: {
    attributes: { exclude: ['senha_hash'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['senha_hash'] }
    }
  },
  hooks: {
    beforeCreate: async (freelancer) => {
      if (freelancer.senha_hash && !freelancer.senha_hash.startsWith('$2')) {
        freelancer.senha_hash = await bcrypt.hash(freelancer.senha_hash, 10);
      }
    },
    beforeUpdate: async (freelancer) => {
      if (freelancer.changed('senha_hash') && !freelancer.senha_hash.startsWith('$2')) {
        freelancer.senha_hash = await bcrypt.hash(freelancer.senha_hash, 10);
      }
    },
  },
});

Freelancer.prototype.verificarSenha = async function(senha) {
  return bcrypt.compare(senha, this.senha_hash);
};

Freelancer.prototype.atualizarUltimoLogin = async function() {
  this.ultimo_login = new Date();
  return this.save();
};

Freelancer.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.senha_hash;
  return values;
};

module.exports = Freelancer;
