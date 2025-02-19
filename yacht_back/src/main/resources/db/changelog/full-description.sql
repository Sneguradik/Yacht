--liquibase formatted sql

--changeset victoria:full-description
ALTER TABLE "user"
    ADD COLUMN "description_full" TEXT NOT NULL DEFAULT '';

ALTER TABLE "company"
    ADD COLUMN "description_full" TEXT NOT NULL DEFAULT '';

ALTER TABLE "topic"
    ADD COLUMN "description_full" TEXT NOT NULL DEFAULT '';

--changeset victoria:full-description-views
DROP VIEW "user_v";
-- cascade
DROP VIEW "company_application_v";
DROP VIEW "company_v";
DROP VIEW "topic_v";

CREATE VIEW "user_v"
AS
    SELECT
        "user"."id",
        "user"."created_at",
        "user"."updated_at",
        "user"."first_name",
        "user"."last_name",
        "user"."profile_picture_url",
        "user"."username",
        "user"."profile_cover_url",
        "user"."bio",
        "user"."geolocation",
        "user"."contact_email",
        "user"."contact_website_url",
        "user"."contact_phone",
        "user"."contact_phone_alt",
        "user"."contact_social_instagram",
        "user"."contact_social_vk",
        "user"."contact_social_facebook",
        "user"."contact_social_twitter",
        "user"."contact_social_youtube",
        "user"."contact_social_linkedin",
        "user"."contact_social_telegram",
        "user"."description_full",
        (SELECT
             count(*) AS "count"
         FROM
             "article"
         WHERE
               "article"."author_id" = "user"."id"
           AND "article"."published" IS TRUE)                 AS "post_count",
        (SELECT
             count(*) AS "count"
         FROM
             "author_subscription"
         WHERE
             "author_subscription"."author_id" = "user"."id") AS "subscriber_count"
    FROM
        "user";

CREATE VIEW "topic_v"
AS
    SELECT
        "topic"."id",
        "topic"."created_at",
        "topic"."updated_at",
        "topic"."image",
        "topic"."name",
        "topic"."profile_cover_url",
        "topic"."description",
        "topic"."description_full",
        (SELECT
             count(*) AS "count"
         FROM
             "article_topic"
                 JOIN "article" ON "article_topic"."article_id" = "article"."id"
         WHERE
               "article_topic"."topic_id" = "topic"."id"
           AND "article"."published" IS TRUE)                AS "post_count",
        (SELECT
             count(*) AS "count"
         FROM
             "topic_subscription"
         WHERE
             "topic_subscription"."topic_id" = "topic"."id") AS "subscriber_count"
    FROM
        "topic";

CREATE VIEW "company_v"
AS
    SELECT
        "company"."owner_id"                                             AS "id",
        "company"."created_at",
        "company"."updated_at",
        "company"."name",
        "company"."username",
        "company"."logo",
        "company"."description",
        "company"."verified",
        "company"."public_contact_email",
        "company"."profile_cover_url",
        "company"."description_full",
        (SELECT
             count(*) AS "count"
         FROM
             "article"
         WHERE
               "article"."author_id" = "company"."owner_id"
           AND "article"."published" IS TRUE)                            AS "post_count",
        (SELECT
             count(*) AS "count"
         FROM
             "company_subscription"
         WHERE
             "company_subscription"."company_id" = "company"."owner_id") AS "subscriber_count"
    FROM
        "company";

CREATE VIEW "company_application_v"
AS
    SELECT
        "ca"."id",
        "ca"."updated_at",
        "ca"."created_at",
        "ca"."status",
        "ca"."message",
        "ca"."rejection_reason",
        "company"."owner_id"                                             AS "company_id",
        "company"."created_at"                                           AS "company_created_at",
        "company"."updated_at"                                           AS "company_updated_at",
        "company"."name",
        "company"."username",
        "company"."logo",
        "company"."description",
        "company"."verified",
        "company"."public_contact_email",
        "company"."profile_cover_url",
        "company"."description_full",
        (SELECT
             count(*) AS "count"
         FROM
             "article"
         WHERE
               "article"."author_id" = "company"."owner_id"
           AND "article"."published" IS TRUE)                            AS "post_count",
        (SELECT
             count(*) AS "count"
         FROM
             "company_subscription"
         WHERE
             "company_subscription"."company_id" = "company"."owner_id") AS "subscriber_count"
    FROM
        "company_application" "ca"
            JOIN "company" ON "ca"."company_id" = "company"."owner_id";
