--liquibase formatted sql

--changeset victoria:load-uuid-extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--changeset victoria:merging-accounts
ALTER TABLE "user"
    ADD COLUMN "master_account" BIGINT,
    ADD CONSTRAINT "FK_user__master" FOREIGN KEY ("master_account") REFERENCES "user" ("id");

--changeset victoria:credentials
CREATE TABLE "credentials"
(
    "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id"    BIGINT NOT NULL,
    "origin"     TEXT   NOT NULL,
    "service_id" TEXT   NOT NULL,
    "password"   TEXT,

    CONSTRAINT "FK_credentials" FOREIGN KEY ("user_id") REFERENCES "user" ("id"),
    CONSTRAINT "UQ_credentials" UNIQUE ("origin", "service_id") DEFERRABLE
);

--changeset victoria:migrate-accounts
INSERT INTO
    "credentials" ("user_id", "origin", "service_id")
SELECT
    "id",
    (CASE
         WHEN "origin" = 1 THEN 'GOOGLE'
         WHEN "origin" = 2 THEN 'FACEBOOK'
         WHEN "origin" = 3 THEN 'VK' END),
    "service_id"
FROM
    "user"
WHERE
    "origin" IN (1, 2, 3);

INSERT INTO
    "credentials" ("user_id", "origin", "service_id", "password")
SELECT
    "id",
    'LOCAL',
    "username",
    "password"
FROM
    "user"
WHERE
      "origin" = 0
  AND "username" IS NOT NULL;

INSERT INTO
    "credentials" ("user_id", "origin", "service_id", "password")
SELECT
    "id",
    'LOCAL',
    "email",
    "password"
FROM
    "user"
WHERE
      "origin" = 0
  AND "email" IS NOT NULL;

--changeset victoria:credentials-cascade
ALTER TABLE "credentials"
    DROP CONSTRAINT "FK_credentials",
    ADD CONSTRAINT "FK_credentials" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "user"
    DROP CONSTRAINT "FK_user__master",
    ADD CONSTRAINT "FK_user__master" FOREIGN KEY ("master_account") REFERENCES "user" ("id") ON DELETE SET NULL;
