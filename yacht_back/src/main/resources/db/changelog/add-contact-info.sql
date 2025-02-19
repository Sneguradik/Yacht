--liquibase formatted sql

--changeset victoria:user-contacts-expand
ALTER TABLE "user"
    ADD COLUMN "contact_phone_alt"       VARCHAR(32),
    ADD COLUMN "contact_social_telegram" VARCHAR(32);

--changeset victoria:user-view-add-new-contacts
DROP VIEW "user_v" CASCADE;
-- also drops "article_v"
CREATE VIEW "user_v"
AS
    SELECT
        -- meta
        "id",
        "created_at",
        "updated_at",
        -- info
        "first_name",
        "last_name",
        "profile_picture_url",
        "username",
        -- detail
        "profile_cover_url",
        "bio",
        "geolocation",
        -- contact
        "contact_email",
        "contact_website_url",
        "contact_phone",
        "contact_phone_alt",
        "contact_social_instagram",
        "contact_social_vk",
        "contact_social_facebook",
        "contact_social_twitter",
        "contact_social_youtube",
        "contact_social_linkedin",
        "contact_social_telegram",
        -- count
        (SELECT
             COUNT(*)
         FROM
             "article"
         WHERE
               "article"."author_id" = "user"."id"
           AND "article"."published" IS TRUE)                                        AS "post_count",
        (SELECT COUNT(*) FROM "author_subscription" WHERE "author_id" = "user"."id") AS "subscriber_count"
    FROM
        "user";

--changeset victoria:restore-article-view
CREATE VIEW "article_v"
AS
    SELECT
        "article"."id",
        "article"."created_at",
        "article"."updated_at",
        "title"                                                                      AS "info.title",
        "published"                                                                  AS "info.published",
        "published_at"                                                               AS "info.published_at",
        "summary"                                                                    AS "info.summary",
        "cover"                                                                      AS "info.cover",
        "rendered_html",
        (SELECT COUNT(*) FROM "bookmark" WHERE "article_id" = "article"."id")        AS "bookmark_count",
        (SELECT COUNT(*) FROM "article_view" WHERE "article_id" = "article"."id")    AS "view_count",
        (SELECT COUNT(*) FROM "comment" WHERE "article_id" = "article"."id")         AS "comment_count",
        COALESCE("votes_up", 0)                                                      AS "votes_up",
        COALESCE("votes_down", 0)                                                    AS "votes_down",
        "article_meta_v"."tags",
        "article_meta_v"."topics",
        "author_id"                                                                  AS "author.meta.id",
        "user"."created_at"                                                          AS "author.meta.created_at",
        "user"."updated_at"                                                          AS "author.meta.updated_at",
        "first_name"                                                                 AS "author.info.first_name",
        "last_name"                                                                  AS "author.info.last_name",
        "profile_picture_url"                                                        AS "author.info.profile_picture_url",
        "username"                                                                   AS "author.info.username",
        (SELECT
             COUNT(*)
         FROM
             "article"
         WHERE
               "article"."author_id" = "user"."id"
           AND "article"."published" IS TRUE)                                        AS "author.post_count",
        (SELECT COUNT(*) FROM "author_subscription" WHERE "author_id" = "user"."id") AS "author.subscriber_count"
    FROM
        "article"
            INNER JOIN "user" ON "user"."id" = "author_id"
            LEFT OUTER JOIN "article_vote_v" ON "article_vote_v"."id" = "article"."id"
            LEFT OUTER JOIN "article_meta_v" ON "article_meta_v"."id" = "article"."id";
