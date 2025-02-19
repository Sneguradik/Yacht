--liquibase formatted sql

--changeset victoria:author-hide
CREATE TABLE "author_hide"
(
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "user_id"    BIGINT                      NOT NULL,
    "author_id"  BIGINT                      NOT NULL,
    CONSTRAINT "PK_hide_author" PRIMARY KEY ("user_id", "author_id"),
    CONSTRAINT "FK_hide_author__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    CONSTRAINT "FK_hide_author__author" FOREIGN KEY ("author_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE "topic_hide"
(
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "user_id"    BIGINT                      NOT NULL,
    "topic_id"   BIGINT                      NOT NULL,
    CONSTRAINT "PK_hide_topic" PRIMARY KEY ("user_id", "topic_id"),
    CONSTRAINT "FK_hide_topic__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    CONSTRAINT "FK_hide_topic__topic" FOREIGN KEY ("topic_id") REFERENCES "topic" ("id") ON DELETE CASCADE
);

--changeset victoria:article-hide-alter
ALTER TABLE "article_hide"
    DROP CONSTRAINT "article_hide_pkey",
    DROP COLUMN "id",
    ADD CONSTRAINT "PK_article_hide" PRIMARY KEY ("user_id", "article_id");
