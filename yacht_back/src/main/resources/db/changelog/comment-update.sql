--liquibase formatted sql

--changeset victoria:soft-delete-comments
ALTER TABLE "comment"
    ADD COLUMN "deleted_at" TIMESTAMP WITHOUT TIME ZONE;

--changeset victoria:comment-watch
CREATE TABLE "comment_watch"
(
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "user_id"    BIGINT                      NOT NULL,
    "comment_id" BIGINT                      NOT NULL,
    CONSTRAINT "PK_comment_watch" PRIMARY KEY ("user_id", "comment_id"),
    CONSTRAINT "FK_comment_watch__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    CONSTRAINT "FK_comment_watch__comment" FOREIGN KEY ("comment_id") REFERENCES "comment" ("id") ON DELETE CASCADE
);
