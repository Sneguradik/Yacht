--liquibase formatted sql

--changeset radmir:open-graph-preview
CREATE TABLE "open_graph_preview"
(
    "id"         BIGINT not null PRIMARY KEY,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "title" TEXT                        NOT NULL DEFAULT '',
    "site_name" TEXT                        NOT NULL DEFAULT '',
    "url" TEXT                        NOT NULL DEFAULT '',
    "image" TEXT                        NOT NULL DEFAULT '',
    "description" TEXT                        NOT NULL DEFAULT '',
    "card" TEXT                        NOT NULL DEFAULT '',
    "type"      INT4 NOT NULL,
    CONSTRAINT "UQ_open_graph_url" UNIQUE("url")
);