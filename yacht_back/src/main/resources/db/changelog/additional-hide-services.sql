--liquibase formatted sql

--changeset lina:hide-services
CREATE TABLE "event_hide"
(
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "user_id"    BIGINT                      NOT NULL,
    "event_id"   BIGINT                      NOT NULL,
    CONSTRAINT "PK_hide_event" PRIMARY KEY ("user_id", "event_id"),
    CONSTRAINT "PK_hide_event__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    CONSTRAINT "PK_hide_event__event" FOREIGN KEY ("event_id") REFERENCES "event" ("id") ON DELETE CASCADE
);

CREATE TABLE "job_hide"
(
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "user_id"    BIGINT                      NOT NULL,
    "job_id"     BIGINT                      NOT NULL,
    CONSTRAINT "PK_hide_job" PRIMARY KEY ("user_id", "job_id"),
    CONSTRAINT "PK_hide_job__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    CONSTRAINT "PK_hide_job__event" FOREIGN KEY ("job_id") REFERENCES "job" ("id") ON DELETE CASCADE
);