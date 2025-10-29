'use strict';

/**
 * Migration: Unify enums, defaults and (optionally) isolate legacy tables.
 * DB: PostgreSQL + PostGIS
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const sql = (s) => qi.sequelize.query(s);

    // 1) Extensões necessárias (idempotentes)
    await sql(`CREATE EXTENSION IF NOT EXISTS postgis;`);
    await sql(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    await sql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2) ENUMS — garantir todos os labels usados pelos models (idempotente)

    // Candidatura.status
    await sql(`
DO $$
BEGIN
  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
   WHERE t.typname='candidatura_status_enum' AND e.enumlabel='visualizada';
  IF NOT FOUND THEN ALTER TYPE candidatura_status_enum ADD VALUE 'visualizada'; END IF;   

  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
   WHERE t.typname='candidatura_status_enum' AND e.enumlabel='interessado';
  IF NOT FOUND THEN ALTER TYPE candidatura_status_enum ADD VALUE 'interessado'; END IF;   

  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
   WHERE t.typname='candidatura_status_enum' AND e.enumlabel='nao_interessado';
  IF NOT FOUND THEN ALTER TYPE candidatura_status_enum ADD VALUE 'nao_interessado'; END IF;

  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
   WHERE t.typname='candidatura_status_enum' AND e.enumlabel='rejeitada';
  IF NOT FOUND THEN ALTER TYPE candidatura_status_enum ADD VALUE 'rejeitada'; END IF;     

  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
   WHERE t.typname='candidatura_status_enum' AND e.enumlabel='contratado';
  IF NOT FOUND THEN ALTER TYPE candidatura_status_enum ADD VALUE 'contratado'; END IF;    
END$$;
`);

    // Empresa.status — garantir 'pausado'
    await sql(`
DO $$
BEGIN
  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
   WHERE t.typname='enum_empresas_status' AND e.enumlabel='pausado';
  IF NOT FOUND THEN ALTER TYPE enum_empresas_status ADD VALUE 'pausado'; END IF;
END$$;
`);

    // status_enum (usado em freelancers e vagas) — garantir 'pendente' e 'bloqueado'
    await sql(`
DO $$
BEGIN
  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
   WHERE t.typname='status_enum' AND e.enumlabel='pendente';
  IF NOT FOUND THEN ALTER TYPE status_enum ADD VALUE 'pendente'; END IF;

  PERFORM 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
   WHERE t.typname='status_enum' AND e.enumlabel='bloqueado';
  IF NOT FOUND THEN ALTER TYPE status_enum ADD VALUE 'bloqueado'; END IF;
END$$;
`);

    // experiencia_enum: 'junior','pleno','senior','especialista'
    await sql(`
DO $$
DECLARE
  lbl text;
BEGIN
  FOREACH lbl IN ARRAY ARRAY['junior','pleno','senior','especialista']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
      WHERE t.typname='experiencia_enum' AND e.enumlabel=lbl
    ) THEN
      EXECUTE format('ALTER TYPE experiencia_enum ADD VALUE %L', lbl);
    END IF;
  END LOOP;
END$$;
`);

    // tipo_contrato_enum: 'clt','pj','estagio','freelancer','temporario'
    await sql(`
DO $$
DECLARE
  lbl text;
BEGIN
  FOREACH lbl IN ARRAY ARRAY['clt','pj','estagio','freelancer','temporario']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
      WHERE t.typname='tipo_contrato_enum' AND e.enumlabel=lbl
    ) THEN
      EXECUTE format('ALTER TYPE tipo_contrato_enum ADD VALUE %L', lbl);
    END IF;
  END LOOP;
END$$;
`);

    // modalidade_trabalho_enum: 'presencial','remoto','hibrido'
    await sql(`
DO $$
DECLARE
  lbl text;
BEGIN
  FOREACH lbl IN ARRAY ARRAY['presencial','remoto','hibrido']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
      WHERE t.typname='modalidade_trabalho_enum' AND e.enumlabel=lbl
    ) THEN
      EXECUTE format('ALTER TYPE modalidade_trabalho_enum ADD VALUE %L', lbl);
    END IF;
  END LOOP;
END$$;
`);

    // tamanho_empresa_enum: 'startup','pequena','media','grande','multinacional'
    await sql(`
DO $$
DECLARE
  lbl text;
BEGIN
  FOREACH lbl IN ARRAY ARRAY['startup','pequena','media','grande','multinacional']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
      WHERE t.typname='tamanho_empresa_enum' AND e.enumlabel=lbl
    ) THEN
      EXECUTE format('ALTER TYPE tamanho_empresa_enum ADD VALUE %L', lbl);
    END IF;
  END LOOP;
END$$;
`);

    // 3) freelancers.portfolio_projetos -> default [] e normalização de dados
    await sql(`
ALTER TABLE public.freelancers
  ALTER COLUMN portfolio_projetos SET DEFAULT '[]'::jsonb;`);

    await sql(`
UPDATE public.freelancers
   SET portfolio_projetos = '[]'::jsonb
 WHERE portfolio_projetos IS NULL
    OR jsonb_typeof(portfolio_projetos) <> 'array';
`);

    // 4) OPCIONAL — mover tabelas legadas para 'legacy' (evita colisão conceitual)
    await sql(`CREATE SCHEMA IF NOT EXISTS legacy;`);

    const legacyTables = [
      'empresa','vaga','freelancer',
      'freelancer_skill','vaga_skill','vaga_idioma','freelancer_idioma',
      'endereco','senioridade','tipo_contrato','modelo_trabalho','usuario',
      'candidatura'
    ];

    for (const tbl of legacyTables) {
      await sql(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema='public' AND table_name='${tbl}'
  ) THEN
    EXECUTE 'ALTER TABLE IF EXISTS public.${tbl} SET SCHEMA legacy';
  END IF;
END$$;`);
    }

    // ====== [Opcional futuro] Converter GEOGRAPHY -> GEOMETRY(Point,4326)
    // Seu DB já usa GEOGRAPHY. Se quiser padronizar para GEOMETRY no futuro:
    // await sql(`
    // ALTER TABLE public.empresas
    //   ALTER COLUMN localizacao TYPE geometry(Point,4326)
    //   USING CASE WHEN localizacao IS NULL THEN NULL ELSE ST_SetSRID(geometry(localizacao),4326) END;
    // ALTER TABLE public.freelancers
    //   ALTER COLUMN localizacao TYPE geometry(Point,4326)
    //   USING CASE WHEN localizacao IS NULL THEN NULL ELSE ST_SetSRID(geometry(localizacao),4326) END;
    // ALTER TABLE public.vagas
    //   ALTER COLUMN localizacao TYPE geometry(Point,4326)
    //   USING CASE WHEN localizacao IS NULL THEN NULL ELSE ST_SetSRID(geometry(localizacao),4326) END;
    // `);
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    const sql = (s) => qi.sequelize.query(s);

    // Reverter default do portfolio_projetos para {}
    await sql(`
ALTER TABLE public.freelancers
  ALTER COLUMN portfolio_projetos SET DEFAULT '{}'::jsonb;`);

    // Não há rollback limpo para ADD VALUE em enums no PostgreSQL.
    // Manter os valores adicionais é seguro.

    // Opcional: mover tabelas do schema legacy de volta para public
    const legacyTables = [
      'empresa','vaga','freelancer',
      'freelancer_skill','vaga_skill','vaga_idioma','freelancer_idioma',
      'endereco','senioridade','tipo_contrato','modelo_trabalho','usuario',
      'candidatura'
    ];

    for (const tbl of legacyTables) {
      await sql(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema='legacy' AND table_name='${tbl}'
  ) THEN
    EXECUTE 'ALTER TABLE IF EXISTS legacy.${tbl} SET SCHEMA public';
  END IF;
END$$;`);
    }
  }
};
