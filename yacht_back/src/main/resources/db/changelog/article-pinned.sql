--liquibase formatted sql

--changeset lina:article-pin
ALTER TABLE "article"
    ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT FALSE;

--changeset we2beast:is-edited-flag
ALTER TABLE "article"
    ADD COLUMN "is_edited" BOOLEAN NOT NULL DEFAULT FALSE;
