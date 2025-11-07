// src/models/index.js
const { sequelize } = require('../config/database');

const Empresa = require('./Empresa');
const Freelancer = require('./Freelancer');
const Vaga = require('./Vaga');
const Candidatura = require('./Candidatura');

module.exports = { sequelize, Empresa, Freelancer, Vaga, Candidatura };
