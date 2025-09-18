//Candidatura.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Candidatura = sequelize.define('Candidatura', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  vaga_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'vagas',
      key: 'id',
    },
  },
  freelancer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'freelancers',
      key: 'id',
    },
  },
  mensagem_candidato: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 1000], msg: 'Mensagem deve ter no máximo 1000 caracteres' },
    },
  },
  status: {
    type: DataTypes.ENUM('pendente', 'visualizada', 'interessado', 'nao_interessado', 'rejeitada', 'contratado'),
    allowNull: false,
    defaultValue: 'pendente',
  },
  data_candidatura: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  data_visualizacao: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  data_resposta: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  feedback_empresa: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 1000], msg: 'Feedback deve ter no máximo 1000 caracteres' },
    },
  },
  dados_extras: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'candidaturas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Definir associações
Candidatura.associate = function(models) {
  // Candidatura pertence a uma Vaga
  Candidatura.belongsTo(models.Vaga, {
    foreignKey: 'vaga_id',
    as: 'vaga'
  });

  // Candidatura pertence a um Freelancer
  Candidatura.belongsTo(models.Freelancer, {
    foreignKey: 'freelancer_id',
    as: 'freelancer'
  });
};

module.exports = Candidatura;