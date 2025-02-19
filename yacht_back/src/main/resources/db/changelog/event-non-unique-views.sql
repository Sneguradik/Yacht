--liquibase formatted sql

--changeset radmir:event_non_unique_view

create TABLE "event_non_unique_view"
(
    "id"         BIGINT not null PRIMARY KEY,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "views_count"       INTEGER NOT NULL,
    "event_id"        BIGINT                      NOT NULL,
    CONSTRAINT "FK_event_id" FOREIGN KEY ("event_id") REFERENCES "event" ("id") ON DELETE CASCADE
);

--changeset radmir:event_non_unique_view-unique
ALTER TABLE event_non_unique_view
    ADD CONSTRAINT "event_unique" UNIQUE ("event_id");