--liquibase formatted sql

--changeset lina:add-form-password-recovery
CREATE TABLE "user_recovery"
(
    "id"      BIGSERIAL PRIMARY KEY,
    "hash"    VARCHAR(255),
    "user_id" BIGINT                      NOT NULL REFERENCES "user" ("id"),
    "used"    BOOLEAN                     NOT NULL DEFAULT FALSE,
    "time"    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

--changeset lina:add-usedat-to-recovery
ALTER TABLE "user_recovery" ADD COLUMN "used_at" TIMESTAMP WITHOUT TIME ZONE;

--changeset radmir:recovery-cascades
ALTER TABLE "user_recovery"
    DROP CONSTRAINT "user_recovery_user_id_fkey",
    ADD CONSTRAINT "FK_user_recovery__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;

--changeset radmir:article-topic-cascades
ALTER TABLE "article_topic"
    DROP CONSTRAINT "fkmdx5r8x61hllja2e1tlv8sho8",
    ADD CONSTRAINT "FK_article_topic__topic" FOREIGN KEY ("topic_id") REFERENCES "topic" ("id") ON DELETE CASCADE;
