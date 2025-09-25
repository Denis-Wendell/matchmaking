'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const sql = queryInterface.sequelize.query.bind(queryInterface.sequelize);

    // 1) Normaliza os dados existentes (linhas já salvas)
    await sql(`
      UPDATE "empresas" SET "status" = 'ativo'     WHERE "status"::text = 'ativa';
      UPDATE "empresas" SET "status" = 'inativo'   WHERE "status"::text = 'inativa';
      UPDATE "empresas" SET "status" = 'bloqueado' WHERE "status"::text = 'bloqueada';
    `);

    // 2) Cria um NOVO tipo só com os valores desejados
    await sql(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_empresas_status_new') THEN
          CREATE TYPE enum_empresas_status_new AS ENUM ('ativo','inativo','pendente','bloqueado','pausado');
        END IF;
      END$$;
    `);

    // 3) Converte a coluna para o novo tipo (todos os valores já mapeados existem no NEW)
    await sql(`
      ALTER TABLE "empresas"
      ALTER COLUMN "status" DROP DEFAULT,
      ALTER COLUMN "status" TYPE enum_empresas_status_new
      USING ("status"::text::enum_empresas_status_new);
    `);

    // 4) Troca os nomes dos tipos para manter o nome original
    await sql(`
      ALTER TYPE enum_empresas_status RENAME TO enum_empresas_status_old;
      ALTER TYPE enum_empresas_status_new RENAME TO enum_empresas_status;
    `);

    // 5) Default consistente
    await sql(`
      ALTER TABLE "empresas"
      ALTER COLUMN "status" SET DEFAULT 'ativo'::enum_empresas_status;
    `);

    // 6) Remove o tipo antigo (com rótulos duplicados)
    await sql(`DROP TYPE IF EXISTS enum_empresas_status_old;`);
  },

  async down (queryInterface, Sequelize) {
    const sql = queryInterface.sequelize.query.bind(queryInterface.sequelize);

    // Recria o tipo antigo com os labels antigos (se precisar reverter)
    await sql(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_empresas_status_old') THEN
          CREATE TYPE enum_empresas_status_old AS ENUM ('ativa','inativa','pendente','bloqueada');
        END IF;
      END$$;
    `);

    // Converte de volta (observação: 'pausado' e 'bloqueado/ativo/inativo' não existiam antes; mapeamos)
    await sql(`
      ALTER TABLE "empresas"
      ALTER COLUMN "status" DROP DEFAULT,
      ALTER COLUMN "status" TYPE enum_empresas_status_old
      USING (
        CASE
          WHEN "status"::text = 'ativo'     THEN 'ativa'::enum_empresas_status_old
          WHEN "status"::text = 'inativo'   THEN 'inativa'::enum_empresas_status_old
          WHEN "status"::text = 'pendente'  THEN 'pendente'::enum_empresas_status_old
          WHEN "status"::text = 'bloqueado' THEN 'bloqueada'::enum_empresas_status_old
          WHEN "status"::text = 'pausado'   THEN 'inativa'::enum_empresas_status_old
          ELSE 'ativa'::enum_empresas_status_old
        END
      );
    `);

    await sql(`
      ALTER TYPE enum_empresas_status RENAME TO enum_empresas_status_new;
      ALTER TYPE enum_empresas_status_old RENAME TO enum_empresas_status;
      DROP TYPE IF EXISTS enum_empresas_status_new;
    `);

    await sql(`
      ALTER TABLE "empresas"
      ALTER COLUMN "status" SET DEFAULT 'ativa'::enum_empresas_status;
    `);
  }
};
