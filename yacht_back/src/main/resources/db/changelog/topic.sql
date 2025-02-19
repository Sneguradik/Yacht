--liquibase formatted sql

--changeset victoria:migrate-topic-table
ALTER TABLE "article_attribute"
    RENAME TO "article_topic";

ALTER TABLE "article_topic"
    RENAME COLUMN "attribute_id" TO "topic_id";

ALTER TABLE "content_attribute"
    RENAME TO "topic";

-- ALTER TABLE "topic"
--    DROP COLUMN "parent_id",
--    DROP COLUMN "type";

ALTER SEQUENCE "content_attribute_id_seq" RENAME TO "topic_id_seq";

ALTER TABLE "attribute_subscription"
    RENAME TO "topic_subscription";

ALTER TABLE "topic_subscription"
    RENAME COLUMN "attribute_id" TO "topic_id";

--changeset victoria:update-topic-privilege
UPDATE "privilege" SET "name" = 'CAN_MANAGE_TOPICS' WHERE "name" = 'CAN_MANAGE_ATTRIBUTES';

--changeset victoria:topic-subscription-score splitStatements:false
CREATE OR REPLACE FUNCTION "public"."subscription_score"("_user_id" BIGINT, "_article_id" BIGINT) RETURNS INTEGER AS
$$
DECLARE
    "_score"    INTEGER;
    "_tmp_good" INTEGER;
    "_tmp_bad"  INTEGER;
BEGIN
    SELECT
        COUNT("article_id") FILTER ( WHERE "bad" = TRUE )  "bad",
        COUNT("article_id") FILTER ( WHERE "bad" = FALSE ) "good"
    INTO "_tmp_bad", "_tmp_good"
    FROM
        "topic_subscription"
            INNER JOIN "topic" ON "topic_subscription"."topic_id" = "topic"."id"
            INNER JOIN "article_topic" ON "article_topic"."topic_id" = "topic_subscription"."topic_id" AND
                                          "article_topic"."article_id" = "_article_id"
    WHERE
        "user_id" = "_user_id"
    GROUP BY "article_id";

    "_score" = COALESCE("_tmp_good", 0) - (COALESCE("_tmp_bad", 0) * 1000);

    "_score" := "_score" + COALESCE((SELECT
                                         CASE "bad" WHEN TRUE THEN -1000 ELSE 1 END
                                     FROM
                                         "author_subscription"
                                             INNER JOIN "article" ON "article"."id" = "_article_id"
                                     WHERE
                                           "author_subscription"."author_id" = "article"."author_id"
                                       AND "author_subscription"."user_id" = "_user_id"), 0);
    RETURN "_score";
END;
$$
    LANGUAGE PLPGSQL;

--changeset lina:add-cover-and-description
ALTER TABLE "topic"
    ADD COLUMN "profile_cover_url" VARCHAR(255),
    ADD COLUMN "description" VARCHAR(255);

--changeset victoria:add-timestamps
ALTER TABLE "topic"
    ADD COLUMN "created_at" TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN "updated_at" TIMESTAMP WITHOUT TIME ZONE;

--changeset victoria:add-timestamps-tag
ALTER TABLE "tag"
    ADD COLUMN "created_at" TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN "updated_at" TIMESTAMP WITHOUT TIME ZONE;

--changeset victoria:non-null-timestamps
UPDATE "topic"
SET "created_at" = now(),
    "updated_at" = now()
WHERE "updated_at" IS NULL
   OR "created_at" IS NULL;
UPDATE "tag"
SET "created_at" = now(),
    "updated_at" = now()
WHERE "updated_at" IS NULL
   OR "created_at" IS NULL;

ALTER TABLE "topic"
    ALTER COLUMN "created_at" SET DEFAULT now(),
    ALTER COLUMN "updated_at" SET DEFAULT now(),
    ALTER COLUMN "created_at" SET NOT NULL,
    ALTER COLUMN "updated_at" SET NOT NULL;

--changeset lina:topics-url
ALTER TABLE "topic"
    ADD COLUMN "url" VARCHAR(255) UNIQUE;

--changeset radmir:topics-version
ALTER TABLE "topic"
    ADD COLUMN "optlock" BIGINT default 0;

--changeset radmir:topics-version-delete
ALTER TABLE "topic"
    DROP COLUMN IF EXISTS "optlock";