'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, STRING, TEXT, DATE, DECIMAL, BOOLEAN } = Sequelize;

    // Catálogos
    await queryInterface.createTable('senioridade', {
      id_senioridade: { type: INTEGER, autoIncrement: true, primaryKey: true },
      nome: { type: STRING(32), allowNull: false, unique: true }
    });
    await queryInterface.createTable('modelo_trabalho', {
      id_modelo: { type: INTEGER, autoIncrement: true, primaryKey: true },
      nome: { type: STRING(32), allowNull: false, unique: true }
    });
    await queryInterface.createTable('tipo_contrato', {
      id_contrato: { type: INTEGER, autoIncrement: true, primaryKey: true },
      nome: { type: STRING(32), allowNull: false, unique: true }
    });
    await queryInterface.createTable('skill', {
      id_skill: { type: INTEGER, autoIncrement: true, primaryKey: true },
      slug: { type: STRING(80), allowNull: false, unique: true },
      nome: { type: STRING(120), allowNull: false },
      tipo: { type: STRING(32), allowNull: false } // tecnica|comportamental
    });
    await queryInterface.createTable('idioma', {
      id_idioma: { type: INTEGER, autoIncrement: true, primaryKey: true },
      codigo: { type: STRING(16), allowNull: false, unique: true },
      nome: { type: STRING(80), allowNull: false }
    });

    // Entidades
    await queryInterface.createTable('usuario', {
      id_usuario: { type: INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: STRING(180), allowNull: false, unique: true },
      senha_hash: { type: STRING(255), allowNull: false },
      tipo: { type: STRING(32), allowNull: false },
      criado_em: { type: DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.createTable('endereco', {
      id_endereco: { type: INTEGER, autoIncrement: true, primaryKey: true },
      cidade: STRING(120),
      estado: STRING(60),
      cep: STRING(20),
      logradouro: STRING(180),
      numero: STRING(20),
      bairro: STRING(120),
      complemento: STRING(180)
    });

    await queryInterface.createTable('empresa', {
      id_empresa: { type: INTEGER, autoIncrement: true, primaryKey: true },
      id_usuario: {
        type: INTEGER, unique: true,
        references: { model: 'usuario', key: 'id_usuario' },
        onDelete: 'CASCADE'
      },
      id_endereco: {
        type: INTEGER,
        references: { model: 'endereco', key: 'id_endereco' },
        onDelete: 'SET NULL'
      },
      nome_fantasia: STRING(180),
      cnpj: STRING(32),
      telefone: STRING(40),
      site: STRING(180),
      setor_atuante: STRING(120),
      tamanho: STRING(50),
      cultura: TEXT,
      descricao: TEXT
    });

    await queryInterface.createTable('freelancer', {
      id_freelancer: { type: INTEGER, autoIncrement: true, primaryKey: true },
      id_usuario: {
        type: INTEGER, unique: true,
        references: { model: 'usuario', key: 'id_usuario' },
        onDelete: 'CASCADE'
      },
      id_endereco: {
        type: INTEGER,
        references: { model: 'endereco', key: 'id_endereco' },
        onDelete: 'SET NULL'
      },
      nome: STRING(120),
      sobrenome: STRING(120),
      cpf: STRING(32),
      telefone: STRING(40),
      linkedin: STRING(180),
      github: STRING(180),
      portifolio: STRING(180),
      data_nascimento: DATE,
      genero: STRING(30),
      id_senioridade: {
        type: INTEGER,
        references: { model: 'senioridade', key: 'id_senioridade' }
      },
      salario_expect_min: DECIMAL(12,2),
      salario_expect_max: DECIMAL(12,2),
      id_modelo_pref: {
        type: INTEGER,
        references: { model: 'modelo_trabalho', key: 'id_modelo' }
      }
    });

    // Pivôs
    await queryInterface.createTable('freelancer_skill', {
      id_freelancer: {
        type: INTEGER,
        references: { model: 'freelancer', key: 'id_freelancer' },
        onDelete: 'CASCADE'
      },
      id_skill: {
        type: INTEGER,
        references: { model: 'skill', key: 'id_skill' },
        onDelete: 'CASCADE'
      },
      nivel_0_5: { type: INTEGER, allowNull: false },
      anos_exp: { type: DECIMAL(5,2), defaultValue: 0 },
    });
    await queryInterface.addConstraint('freelancer_skill', {
      fields: ['id_freelancer', 'id_skill'],
      type: 'primary key',
      name: 'pk_freelancer_skill'
    });

    await queryInterface.createTable('freelancer_idioma', {
      id_freelancer: {
        type: INTEGER,
        references: { model: 'freelancer', key: 'id_freelancer' },
        onDelete: 'CASCADE'
      },
      id_idioma: {
        type: INTEGER,
        references: { model: 'idioma', key: 'id_idioma' },
        onDelete: 'CASCADE'
      },
      nivel: STRING(8)
    });
    await queryInterface.addConstraint('freelancer_idioma', {
      fields: ['id_freelancer', 'id_idioma'],
      type: 'primary key',
      name: 'pk_freelancer_idioma'
    });

    // Vagas
    await queryInterface.createTable('vaga', {
      id_vaga: { type: INTEGER, autoIncrement: true, primaryKey: true },
      id_empresa: {
        type: INTEGER,
        references: { model: 'empresa', key: 'id_empresa' },
        onDelete: 'CASCADE'
      },
      id_endereco: {
        type: INTEGER,
        references: { model: 'endereco', key: 'id_endereco' },
        onDelete: 'SET NULL'
      },
      titulo: { type: STRING(180), allowNull: false },
      descricao: { type: TEXT, allowNull: false },
      id_senioridade: {
        type: INTEGER,
        references: { model: 'senioridade', key: 'id_senioridade' }
      },
      id_modelo: {
        type: INTEGER,
        references: { model: 'modelo_trabalho', key: 'id_modelo' }
      },
      id_contrato: {
        type: INTEGER,
        references: { model: 'tipo_contrato', key: 'id_contrato' }
      },
      salario_min: DECIMAL(12,2),
      salario_max: DECIMAL(12,2),
      ativa: { type: BOOLEAN, defaultValue: true },
      criado_em: { type: DATE, defaultValue: Sequelize.fn('NOW') },
      atualizado_em: { type: DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.createTable('vaga_skill', {
      id_vaga: {
        type: INTEGER,
        references: { model: 'vaga', key: 'id_vaga' },
        onDelete: 'CASCADE'
      },
      id_skill: {
        type: INTEGER,
        references: { model: 'skill', key: 'id_skill' },
        onDelete: 'CASCADE'
      },
      nivel_min_0_5: INTEGER,
      peso_0_1: { type: DECIMAL(4,3), defaultValue: 0.700 }
    });
    await queryInterface.addConstraint('vaga_skill', {
      fields: ['id_vaga', 'id_skill'],
      type: 'primary key',
      name: 'pk_vaga_skill'
    });

    await queryInterface.createTable('vaga_idioma', {
      id_vaga: {
        type: INTEGER,
        references: { model: 'vaga', key: 'id_vaga' },
        onDelete: 'CASCADE'
      },
      id_idioma: {
        type: INTEGER,
        references: { model: 'idioma', key: 'id_idioma' },
        onDelete: 'CASCADE'
      },
      nivel_min: STRING(8)
    });
    await queryInterface.addConstraint('vaga_idioma', {
      fields: ['id_vaga', 'id_idioma'],
      type: 'primary key',
      name: 'pk_vaga_idioma'
    });

    // Índices
    await queryInterface.addIndex('vaga', ['ativa'], { name: 'idx_vaga_ativa' });
    await queryInterface.addIndex('vaga_skill', ['id_vaga'], { name: 'idx_vaga_skill_vaga' });
    await queryInterface.addIndex('freelancer_skill', ['id_freelancer'], { name: 'idx_freelancer_skill_f' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('freelancer_skill', 'idx_freelancer_skill_f');
    await queryInterface.removeIndex('vaga_skill', 'idx_vaga_skill_vaga');
    await queryInterface.removeIndex('vaga', 'idx_vaga_ativa');

    await queryInterface.dropTable('vaga_idioma');
    await queryInterface.dropTable('vaga_skill');
    await queryInterface.dropTable('vaga');

    await queryInterface.dropTable('freelancer_idioma');
    await queryInterface.dropTable('freelancer_skill');

    await queryInterface.dropTable('certificacao');
    await queryInterface.dropTable('formacao');
    await queryInterface.dropTable('experiencia');

    await queryInterface.dropTable('freelancer');
    await queryInterface.dropTable('empresa');
    await queryInterface.dropTable('endereco');
    await queryInterface.dropTable('usuario');

    await queryInterface.dropTable('idioma');
    await queryInterface.dropTable('skill');
    await queryInterface.dropTable('tipo_contrato');
    await queryInterface.dropTable('modelo_trabalho');
    await queryInterface.dropTable('senioridade');
  }
};
