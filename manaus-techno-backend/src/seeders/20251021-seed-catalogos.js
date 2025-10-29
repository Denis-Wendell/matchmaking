'use strict';

module.exports = {
  async up (qi) {
    await qi.bulkInsert('senioridade', [
      { nome: 'estagio' }, { nome: 'junior' }, { nome: 'pleno' }, { nome: 'senior' }, { nome: 'especialista' }
    ], { ignoreDuplicates: true });

    await qi.bulkInsert('modelo_trabalho', [
      { nome: 'remoto' }, { nome: 'hibrido' }, { nome: 'presencial' }
    ], { ignoreDuplicates: true });

    await qi.bulkInsert('tipo_contrato', [
      { nome: 'clt' }, { nome: 'pj' }, { nome: 'estagio' }, { nome: 'temporario' }, { nome: 'freelancer' }
    ], { ignoreDuplicates: true });
  },

  async down (qi) {
    await qi.bulkDelete('tipo_contrato', null, {});
    await qi.bulkDelete('modelo_trabalho', null, {});
    await qi.bulkDelete('senioridade', null, {});
  }
};
