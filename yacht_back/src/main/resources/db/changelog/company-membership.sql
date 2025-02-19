--liquibase formatted sql

--changeset victoria:company-membership
CREATE TABLE "company_membership"
(
    "id"         UUID PRIMARY KEY,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    "user_id"    BIGINT                      NOT NULL,
    "company_id" BIGINT                      NOT NULL,
    CONSTRAINT "FK_company_membership_user" FOREIGN KEY ("user_id") REFERENCES "user" ("id"),
    CONSTRAINT "FK_company_membership_company" FOREIGN KEY ("company_id") REFERENCES "user" ("id"),
    CONSTRAINT "UQ_company_membership" UNIQUE ("user_id", "company_id")
);
