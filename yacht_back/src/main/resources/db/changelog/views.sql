--liquibase formatted sql

--changeset victoria:user-view
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
        "contact_social_instagram",
        "contact_social_vk",
        "contact_social_facebook",
        "contact_social_twitter",
        "contact_social_youtube",
        "contact_social_linkedin",
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

--changeset victoria:topic-view
CREATE VIEW "topic_v"
AS
    SELECT
        -- meta
        "id",
        "created_at",
        "updated_at",
        -- info
        "image",
        "name",
        "profile_cover_url",
        "description",
        (SELECT
             COUNT(*)
         FROM
             "article_topic"
                 INNER JOIN "article" ON "article_id" = "article"."id"
         WHERE
               "topic_id" = "topic"."id"
           AND "article"."published" IS TRUE)                                       AS "post_count",
        (SELECT COUNT(*) FROM "topic_subscription" WHERE "topic_id" = "topic"."id") AS "subscriber_count"
    FROM
        "topic";

--changeset victoria:tag-view
CREATE VIEW "tag_v"
AS
    SELECT
        -- meta
        "id",
        "created_at",
        "updated_at",
        -- info
        "content",
        (SELECT
             COUNT(*)
         FROM
             "article_tag"
                 INNER JOIN "article" ON "article_id" = "article"."id"
         WHERE
               "tag_id" = "tag"."id"
           AND "article"."published" IS TRUE) AS "post_count"
    FROM
        "tag";

--changeset victoria:article-vote-view
CREATE VIEW "article_vote_v"
AS
    SELECT
        "article_id"                         AS "id",
        COUNT(*) FILTER (WHERE "value" = 1)  AS "votes_up",
        COUNT(*) FILTER (WHERE "value" = -1) AS "votes_down"
    FROM
        "article_vote"
    GROUP BY "article_id";

--changeset victoria:article-meta-view
CREATE VIEW "article_meta_v"
AS
    SELECT
        "article"."id" AS "id",
        "tags"."tags",
        "topics"."topics"
    FROM
        "article"
            LEFT OUTER JOIN (
            SELECT
                "article_id",
                array_to_string(array_agg("topic_id" ORDER BY "rank"), ',', 'null') AS "topics"
            FROM
                "article_topic"
            GROUP BY "article_id"
        ) "topics" ON "topics"."article_id" = "article"."id"
            LEFT OUTER JOIN (
            SELECT
                "article_id",
                array_to_string(array_agg("tag_id"), ',', 'null') AS "tags"
            FROM
                "article_tag"
            GROUP BY "article_id"
        ) "tags" ON "tags"."article_id" = "article"."id";

--changeset victoria:article-view
CREATE OR REPLACE VIEW "article_v"
AS
    SELECT
        "article"."id",
        "article"."created_at",
        "article"."updated_at",
        "title"                                                                   AS "info.title",
        "published"                                                               AS "info.published",
        "published_at"                                                            AS "info.published_at",
        "summary"                                                                 AS "info.summary",
        "cover"                                                                   AS "info.cover",
        "rendered_html",
        (SELECT COUNT(*) FROM "bookmark" WHERE "article_id" = "article"."id")     AS "bookmark_count",
        (SELECT COUNT(*) FROM "article_view" WHERE "article_id" = "article"."id") AS "view_count",
        (SELECT COUNT(*) FROM "comment" WHERE "article_id" = "article"."id")      AS "comment_count",
        COALESCE("votes_up", 0)                                                   AS "votes_up",
        COALESCE("votes_down", 0)                                                 AS "votes_down",
        "article_meta_v"."tags",
        "article_meta_v"."topics",
        "author_id"                                                               AS "author.meta.id",
        "user_v"."created_at"                                                     AS "author.meta.created_at",
        "user_v"."updated_at"                                                     AS "author.meta.updated_at",
        "first_name"                                                              AS "author.info.first_name",
        "last_name"                                                               AS "author.info.last_name",
        "profile_picture_url"                                                     AS "author.info.profile_picture_url",
        "username"                                                                AS "author.info.username",
        "post_count"                                                              AS "author.post_count",
        "subscriber_count"                                                        AS "author.subscriber_count"
    FROM
        "article"
            INNER JOIN "user_v" ON "user_v"."id" = "author_id"
            LEFT OUTER JOIN "article_vote_v" ON "article_vote_v"."id" = "article"."id"
            LEFT OUTER JOIN "article_meta_v" ON "article_meta_v"."id" = "article"."id";

--changeset victoria:comment-vote-view
CREATE VIEW "comment_vote_v"
AS
    SELECT
        "comment_id"                         AS "id",
        COUNT(*) FILTER (WHERE "value" = 1)  AS "votes_up",
        COUNT(*) FILTER (WHERE "value" = -1) AS "votes_down"
    FROM
        "comment_vote"
    GROUP BY "comment_id";

--changeset victoria:comment-article-view
CREATE VIEW "comment_article_v"
AS
    SELECT
        -- meta
        "comment"."id",
        "comment"."created_at",
        "comment"."updated_at",
        -- body
        "article_id",
        "rendered_html",
        "parent_comment_id",
        -- voteable
        COALESCE("votes_up", 0)    AS "votes_up",
        COALESCE("votes_down", 0)  AS "votes_down",
        -- user.meta
        "author_id",
        "au"."created_at"          AS "author_created_at",
        "au"."updated_at"          AS "author_updated_at",
        -- user.info
        "au"."first_name"          AS "author_first_name",
        "au"."last_name"           AS "author_last_name",
        "au"."profile_picture_url" AS "author_profile_picture_url",
        "au"."username"            AS "author_username"
    FROM
        "comment"
            INNER JOIN "user" "au" ON "comment"."author_id" = "au"."id"
            LEFT OUTER JOIN "comment_vote_v" ON "comment_vote_v"."id" = "comment"."id";

--changeset victoria:comment-feed-view
CREATE VIEW "comment_feed_v"
AS
    SELECT
        -- meta
        "c"."id",
        "c"."created_at",
        "c"."updated_at",
        -- info
        "c"."article_id",
        "c"."rendered_html",
        "c"."parent_comment_id",
        -- voteable
        "c"."votes_up",
        "c"."votes_down",
        -- user.meta
        "c"."author_id",
        "c"."author_created_at",
        "c"."author_updated_at",
        -- user.info
        "c"."author_first_name",
        "c"."author_last_name",
        "c"."author_profile_picture_url",
        "c"."author_username",
        -- parent.meta
        "reply_to"."id"                  AS "reply_to_id",
        "reply_to"."created_at"          AS "reply_to_created_at",
        "reply_to"."updated_at"          AS "reply_to_updated_at",
        -- parent.info
        "reply_to"."first_name"          AS "reply_to_first_name",
        "reply_to"."last_name"           AS "reply_to_last_name",
        "reply_to"."profile_picture_url" AS "reply_to_profile_picture_url",
        "reply_to"."username"            AS "reply_to_username",
        -- context
        "a"."title"                      AS "post_title"
    FROM
        "comment_article_v" "c"
            LEFT OUTER JOIN "comment" "parent" ON "parent"."id" = "c"."parent_comment_id"
            LEFT OUTER JOIN "user" "reply_to" ON "parent"."author_id" = "reply_to"."id"
            LEFT OUTER JOIN "comment_vote_v" ON "comment_vote_v"."id" = "c"."id"
            INNER JOIN "article" "a" ON "c"."article_id" = "a"."id";

--changeset victoria:company-view
CREATE VIEW "company_v"
AS
    SELECT
        -- meta
        "owner_id"                                                       AS "id",
        "created_at",
        "updated_at",
        -- info
        "name",
        "username",
        "logo",
        "description",
        "verified",
        "public_contact_email",
        "profile_cover_url",
        -- counts
        (SELECT
             COUNT(*)
         FROM
             "article"
         WHERE
               "article"."author_id" = "company"."owner_id"
           AND "article"."published" IS TRUE)                            AS "post_count",
        (SELECT
             COUNT(*)
         FROM
             "company_subscription"
         WHERE
             "company_subscription"."company_id" = "company"."owner_id") AS "subscriber_count"
    FROM
        "company";

--changeset victoria:company-application-view
CREATE VIEW "company_application_v"
AS
    SELECT
        -- meta
        "ca"."id",
        "ca"."updated_at",
        "ca"."created_at",
        -- info
        "status",
        "message",
        "rejection_reason",
        -- company.meta
        "cv"."id"         AS "company_owner_id",
        "cv"."created_at" AS "company_created_at",
        "cv"."updated_at" AS "company_updated_at",
        -- company.info
        "cv"."name",
        "cv"."username",
        "cv"."logo",
        "cv"."description",
        "cv"."verified",
        "cv"."profile_cover_url",
        "cv"."public_contact_email",
        "cv"."post_count",
        "cv"."subscriber_count"
    FROM
        "company_application" "ca"
            INNER JOIN "company_v" "cv" ON "ca"."company_id" = "cv"."id"
