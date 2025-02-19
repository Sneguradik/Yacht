--liquibase formatted sql

--changeset victoria:user-company-info
ALTER TABLE "user"
    ADD COLUMN "is_company"        BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN "company_name"      VARCHAR(64),
    ADD COLUMN "company_confirmed" BOOLEAN;

--changeset victoria:company-application
ALTER TABLE "company_application"
    DROP CONSTRAINT "fkjp2w3o45g2iij6qbcyp5fdc79";

ALTER TABLE "company_application"
    ADD CONSTRAINT "FK_company_application_company" FOREIGN KEY ("company_id") REFERENCES "user" ("id");

ALTER TABLE "company_subscription"
    DROP CONSTRAINT "fkb6ftcva71bffj1ao5h2x8a4j9";

ALTER TABLE "company_subscription"
    ADD CONSTRAINT "FK_company_subscription_company" FOREIGN KEY ("company_id") REFERENCES "user" ("id");

--changeset victoria:drop-views
DROP VIEW "article_v"; -- cascade from user
DROP VIEW "user_v";
DROP VIEW "company_application_v"; -- cascade from company
DROP VIEW "company_v";
