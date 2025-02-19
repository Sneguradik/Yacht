--liquibase formatted sql

--changeset victoria:drop-legacy-notifications
DROP TABLE "notification";
DROP TABLE "comment_mention_notification";
DROP TABLE "service_notification";

--changeset victoria:init-notifications
CREATE TABLE "notification"
(
    "id"         BIGSERIAL PRIMARY KEY,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "user_id"    BIGINT                      NOT NULL,
    "type"       VARCHAR                     NOT NULL,
    "body_json"  TEXT                        NOT NULL,
    "is_read"    BOOLEAN                     NOT NULL DEFAULT FALSE,
    CONSTRAINT "FK_notification_target" FOREIGN KEY ("user_id") REFERENCES "user" ("id")
);

--changeset we2beast:user_settings_notifications
CREATE TABLE "user_notify_settings"
(
    "id"         BIGSERIAL PRIMARY KEY,
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "user_id"    BIGINT                      NOT NULL,
    "type"       INTEGER                     NOT NULL,
    "active"     BOOLEAN                     NOT NULL DEFAULT FALSE,
    CONSTRAINT "FK_notification_target" FOREIGN KEY ("user_id") REFERENCES "user" ("id")
);

--changeset lina:user_setting_type_change
ALTER TABLE "user_notify_settings"
    ALTER COLUMN "type" TYPE VARCHAR(255);

--changeset radmir:notify-cascades
ALTER TABLE "user_notify_settings"
    DROP CONSTRAINT "FK_notification_target",
    ADD CONSTRAINT "FK_notification_target" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;
