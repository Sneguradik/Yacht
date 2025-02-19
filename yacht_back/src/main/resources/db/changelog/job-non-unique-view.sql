--liquibase formatted sql

--changeset radmir:job_non_unique_view

create TABLE "job_non_unique_view"
(
    "id"         BIGINT not null PRIMARY KEY,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "views_count"       INTEGER NOT NULL,
    "job_id"        BIGINT                      NOT NULL,
    CONSTRAINT "FK_job_id" FOREIGN KEY ("job_id") REFERENCES "job" ("id") ON DELETE CASCADE
);

--changeset radmir:job_non_unique_view-unique
ALTER TABLE job_non_unique_view
    ADD CONSTRAINT "job_unique" UNIQUE ("job_id");