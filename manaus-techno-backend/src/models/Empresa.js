const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const Empresa = sequelize.define('Empresa', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome da empresa é obrigatório' },
      len: { args: [2, 255], msg: 'Nome deve ter entre 2 e 255 caracteres' },
    },
  },
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: false,
    unique: {
      msg: 'Este CNPJ já está cadastrado',
    },
    validate: {
      notEmpty: { msg: 'CNPJ é obrigatório' },
      is: {
        args: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/,
        msg: 'CNPJ deve estar no formato 00.000.000/0000-00 ou apenas números',
      },
    },
  },
  email_corporativo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      msg: 'Este email já está cadastrado',
    },
    validate: {
      isEmail: { msg: 'Email deve ter um formato válido' },
      notEmpty: { msg: 'Email corporativo é obrigatório' },
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
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true,
  },
  setor_atuacao: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Setor de atuação é obrigatório' },
    },
  },
  tamanho_empresa: {
    type: DataTypes.ENUM('Startup', 'Pequena', 'Média', 'Grande', 'Multinacional'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Tamanho da empresa é obrigatório' },
    },
  },
  site_empresa: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: { msg: 'URL do site deve ser válida' },
    },
  },
  descricao_empresa: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Descrição da empresa é obrigatória' },
      len: { args: [20], msg: 'Descrição deve ter pelo menos 20 caracteres' },
    },
  },
  principais_beneficios: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cultura_empresa: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  responsavel_nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome do responsável é obrigatório' },
    },
  },
  responsavel_cargo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Cargo do responsável é obrigatório' },
    },
  },
  responsavel_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Email do responsável deve ser válido' },
    },
  },
  responsavel_telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  areas_atuacao: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
  },
  beneficios_array: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
  },
  tecnologias_usadas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
  },
  dados_empresa: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  configuracoes: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  status: {
    type: DataTypes.ENUM('ativa', 'inativa', 'pendente', 'bloqueada'),
    allowNull: true,
    defaultValue: 'ativa',
  },
  verificada: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'empresa',
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
    // Hook para criptografar senha antes de salvar
    beforeCreate: async (empresa) => {
      if (empresa.senha_hash && !empresa.senha_hash.startsWith('$2')) {
        empresa.senha_hash = await bcrypt.hash(empresa.senha_hash, 10);
      }
    },
    beforeUpdate: async (empresa) => {
      if (empresa.changed('senha_hash') && !empresa.senha_hash.startsWith('$2')) {
        empresa.senha_hash = await bcrypt.hash(empresa.senha_hash, 10);
      }
    },
  },
});

// Método para verificar senha
Empresa.prototype.verificarSenha = async function(senha) {
  return bcrypt.compare(senha, this.senha_hash);
};

// Método para atualizar último login
Empresa.prototype.atualizarUltimoLogin = async function() {
  this.ultimo_login = new Date();
  return this.save();
};

// Método para retornar dados seguros (sem senha)
Empresa.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.senha_hash;
  return values;
};

module.exports = Empresa;