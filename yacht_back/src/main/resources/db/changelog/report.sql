--liquibase formatted sql

--changeset artyom:add-report
CREATE TABLE "report"
(
    "id"                BIGSERIAL PRIMARY KEY,
    "created_at"        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at"        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "report_object_url" TEXT                        NOT NULL,
    "message"           TEXT,
    "seen"              BOOLEAN                     NOT NULL DEFAULT FALSE,
    "status"            INTEGER                     NOT NULL DEFAULT 1,
    "user_id"           BIGINT                      NOT NULL,
    CONSTRAINT "FK_report__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

--changeset radmir:refactor-report
DROP TABLE IF EXISTS "report";

CREATE TABLE "report"
(
    "id"                BIGSERIAL PRIMARY KEY,
    "created_at"        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at"        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "report_object_type" TEXT                        NOT NULL,
    "report_object_id"  BIGINT                      NOT NULL,
    "message"           TEXT,
    "seen"              BOOLEAN                     NOT NULL DEFAULT FALSE,
    "status"            INTEGER                     NOT NULL DEFAULT 1,
    "user_id"           BIGINT                      NOT NULL,
    CONSTRAINT "FK_report__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);
