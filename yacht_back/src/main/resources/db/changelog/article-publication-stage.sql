--liquibase formatted sql

--changeset victoria:drop-deprecated-views
DROP VIEW "tag_v";
DROP VIEW "topic_v";

--changeset victoria:article-pub-stage
ALTER TABLE "article"
    ADD COLUMN "publication_stage" INTEGER NOT NULL DEFAULT 0;

UPDATE "article" SET "publication_stage" = CASE WHEN "published" THEN 2 ELSE 0 END WHERE TRUE;

ALTER TABLE "article"
    DROP COLUMN "published";
