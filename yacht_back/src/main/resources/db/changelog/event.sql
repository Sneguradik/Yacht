--liquibase formatted sql

--changeset artyom:add-event
CREATE TABLE "event"
(
    "id"                BIGSERIAL PRIMARY KEY,
    "created_at"        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at"        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "publication_stage" INTEGER                     NOT NULL DEFAULT 0,
    "published_at"      TIMESTAMP WITHOUT TIME ZONE,
    "name"              TEXT                        NOT NULL DEFAULT '',
    "type"              INTEGER,
    "date"              TIMESTAMP WITHOUT TIME ZONE,
    "price"             TEXT,
    "currency"          INTEGER                     NOT NULL DEFAULT 0,
    "city"              TEXT,
    "address"           TEXT                        NOT NULL DEFAULT '',
    "body_source"       TEXT,
    "body_html"         TEXT,
    "announcement"      TEXT                        NOT NULL DEFAULT '',
    "registration_link" TEXT,
    "company_id"        BIGINT                      NOT NULL,
    CONSTRAINT "FK_event" FOREIGN KEY ("company_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE "event_bookmark"
(
    "id"         BIGSERIAL PRIMARY KEY,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "event_id"   BIGINT                      NOT NULL,
    "user_id"    BIGINT                      NOT NULL,
    CONSTRAINT "UQ_event_bookmark" UNIQUE ("user_id", "event_id"),
    CONSTRAINT "FK_event_bookmark__event" FOREIGN KEY ("event_id") REFERENCES "event" ("id") ON DELETE CASCADE,
    CONSTRAINT "FK_event_bookmark__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE "event_view"
(
    "id"          BIGSERIAL PRIMARY KEY,
    "created_at"  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "event_id"    BIGINT                      NOT NULL,
    "user_id"     BIGINT,
    "fingerprint" TEXT,
    CONSTRAINT "UQ_event_view__anonymous" UNIQUE ("fingerprint", "event_id"),
    CONSTRAINT "UQ_event_view__user" UNIQUE ("user_id", "event_id"),
    CONSTRAINT "FK_event_view__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION,
    CONSTRAINT "FK_event_view__job" FOREIGN KEY ("event_id") REFERENCES "event" ("id") ON DELETE CASCADE,
    CONSTRAINT "CHK_event_view" CHECK (("fingerprint" IS NOT NULL AND "user_id" IS NULL) OR
                                       ("fingerprint" IS NULL AND "user_id" IS NOT NULL))
);

--changeset victoria:fix-cascade
ALTER TABLE "event_view"
    DROP CONSTRAINT "FK_event_view__user",
    ADD CONSTRAINT "FK_event_view__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;