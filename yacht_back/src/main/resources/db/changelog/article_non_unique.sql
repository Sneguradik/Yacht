--liquibase formatted sql

--changeset radmir:article_non_unique_view&global_id_sequence

create TABLE "article_non_unique_view"
(
    "id"         BIGINT not null PRIMARY KEY,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "views_count"       INTEGER NOT NULL,
    "article_id"        BIGINT                      NOT NULL,
    CONSTRAINT "FK_article_id" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE
);

create sequence public.global_id_sequence

--changeset radmir:article_non_unique_view&global_id_sequence-unique
ALTER TABLE article_non_unique_view
    ADD CONSTRAINT "article_unique" UNIQUE ("article_id");
