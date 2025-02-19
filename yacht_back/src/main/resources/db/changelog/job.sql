--liquibase formatted sql

--changeset artyom:add-job
CREATE TABLE "job"
(
    "id"                BIGSERIAL PRIMARY KEY,
    "created_at"        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at"        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "publication_stage" INTEGER                     NOT NULL DEFAULT 0,
    "published_at"      TIMESTAMP WITHOUT TIME ZONE,
    "name"              TEXT                        NOT NULL DEFAULT '',
    "min_salary"        TEXT,
    "max_salary"        TEXT,
    "currency"          INTEGER                     NOT NULL DEFAULT 0,
    "type"              INTEGER                     NOT NULL DEFAULT 0,
    "place"             INTEGER                     NOT NULL DEFAULT 0,
    "city"              TEXT,
    "image"             TEXT,
    "tasks"             TEXT                        NOT NULL DEFAULT '',
    "work_conditions"   TEXT                        NOT NULL DEFAULT '',
    "requirements"      TEXT                        NOT NULL DEFAULT '',
    "recruiter_name"    TEXT,
    "email"             TEXT,
    "company_id"        BIGINT                      NOT NULL,
    CONSTRAINT "FK_job__company" FOREIGN KEY ("company_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

--changeset artyom:add-job-bookmark;add-job-view
CREATE TABLE "job_bookmark"
(
    "id"         BIGSERIAL PRIMARY KEY,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "job_id"     BIGINT                      NOT NULL,
    "user_id"    BIGINT                      NOT NULL,
    CONSTRAINT "UQ_job_bookmark" UNIQUE ("user_id", "job_id"),
    CONSTRAINT "FK_job_bookmark__job" FOREIGN KEY ("job_id") REFERENCES "job" ("id") ON DELETE CASCADE,
    CONSTRAINT "FK_job_bookmark__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE "job_view"
(
    "id"          BIGSERIAL PRIMARY KEY,
    "created_at"  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "job_id"      BIGINT                      NOT NULL,
    "user_id"     BIGINT,
    "fingerprint" TEXT,
    CONSTRAINT "UQ_job_view__anonymous" UNIQUE ("fingerprint", "job_id"),
    CONSTRAINT "UQ_job_view__user" UNIQUE ("user_id", "job_id"),
    CONSTRAINT "FK_job_view__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION,
    CONSTRAINT "FK_job_view__job" FOREIGN KEY ("job_id") REFERENCES "job" ("id") ON DELETE CASCADE,
    CONSTRAINT "CHK_job_view" CHECK (("fingerprint" IS NOT NULL AND "user_id" IS NULL) OR
                                     ("fingerprint" IS NULL AND "user_id" IS NOT NULL))
);

--changeset victoria:fix-cascade
ALTER TABLE "job_view"
    DROP CONSTRAINT "FK_job_view__user",
    ADD CONSTRAINT "FK_job_view__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;

--changeset we2beast:job-and-event-places
CREATE TABLE "job_event_places"
(
    "id"          BIGSERIAL PRIMARY KEY,
    "created_at"  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at"  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "where_place" INTEGER                     NOT NULL,
    "place"       INTEGER                     NOT NULL
);

/* [jooq ignore start] */
--changeset we2beast:job-and-event-views
CREATE TABLE "job_event_views"
(
    "id"          BIGSERIAL PRIMARY KEY,
    "created_at"  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at"  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "where_place" INTEGER                     NOT NULL,
    "views_count" INTEGER[]                   NOT NULL
);
/* [jooq ignore stop] */
