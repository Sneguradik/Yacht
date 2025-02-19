--liquibase formatted sql

--changeset victoria:default-ca-status
UPDATE "company_application" SET "status" = 0 WHERE "status" IS NULL;

ALTER TABLE "company_application"
    ALTER "status" SET DEFAULT 0,
    ALTER "status" SET NOT NULL;
