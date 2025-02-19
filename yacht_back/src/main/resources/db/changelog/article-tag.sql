--liquibase formatted sql

--changeset lina:fix-article-tag-constraint

ALTER TABLE "article_tag"
    DROP CONSTRAINT "fkesqp7s9jj2wumlnhssbme5ule";
ALTER TABLE "article_tag"
    ADD CONSTRAINT "FK_article_tag__tag" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE CASCADE;