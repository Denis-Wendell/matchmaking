const Freelancer = require('./Freelancer');
const Empresa = require('./Empresa');
const Vaga = require('./Vaga');

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

  console.log('✅ Associações configuradas com sucesso');
}

module.exports = { setupAssociations };