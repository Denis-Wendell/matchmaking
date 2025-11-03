// src/models/index.js
const { sequelize } = require('../config/database');

const Empresa = require('./Empresa');
const Freelancer = require('./Freelancer');
const Vaga = require('./Vaga');
const Candidatura = require('./Candidatura');


const models = { Empresa, Freelancer, Vaga, Candidatura};

// associações
Object.values(models).forEach((m) => {
  if (m && typeof m.associate === 'function') m.associate(models);
});

module.exports = { sequelize, ...models };
