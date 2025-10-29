//associations.js - Definição de associações entre modelos Sequelize
const Freelancer = require('./Freelancer');
const Empresa = require('./Empresa');
const Vaga = require('./Vaga');
const Candidatura = require('./Candidatura');

// Definir associações entre modelos
function setupAssociations() {
  // Empresa -> Vaga (Um para Muitos)
  Empresa.hasMany(Vaga, {
    foreignKey: 'empresa_id',
    as: 'vagas'
  });

  // Vaga -> Empresa (Muitos para Um)
  Vaga.belongsTo(Empresa, {
    foreignKey: 'empresa_id',
    as: 'empresa'
  });

  // Vaga -> Candidatura (Um para Muitos)
  Vaga.hasMany(Candidatura, {
    foreignKey: 'vaga_id',
    as: 'candidaturasVaga'
  });

  // Candidatura -> Vaga (Muitos para Um)
  Candidatura.belongsTo(Vaga, {
    foreignKey: 'vaga_id',
    as: 'vaga'
  });

  // Freelancer -> Candidatura (Um para Muitos)
  Freelancer.hasMany(Candidatura, {
    foreignKey: 'freelancer_id',
    as: 'candidaturas'
  });

  // Candidatura -> Freelancer (Muitos para Um)
  Candidatura.belongsTo(Freelancer, {
    foreignKey: 'freelancer_id',
    as: 'freelancer'
  });

  console.log('✅ Associações configuradas com sucesso');
  console.log('   - Empresa ↔ Vaga');
  console.log('   - Vaga ↔ Candidatura');
  console.log('   - Freelancer ↔ Candidatura');
}

module.exports = { setupAssociations };