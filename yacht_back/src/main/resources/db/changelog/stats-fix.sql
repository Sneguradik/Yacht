--liquibase formatted sql

--changeset victoria:article-stats-update-fix splitStatements:false
CREATE OR REPLACE PROCEDURE "public"."article_stats_update"() AS
$$
BEGIN
    CREATE TEMPORARY TABLE "views_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "article_view"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "comments_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "comment"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "bookmarks_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "bookmark"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "votes_" ON COMMIT DROP
    AS (SELECT "article_id",
               "value",
               COUNT(*) AS "count"
        FROM "article_vote"
        GROUP BY "article_id", "value");

    -- noinspection SqlWithoutWhere
    UPDATE "article_stats" "stats"
    SET "views"      = "views_count",
        "comments"   = "comments_count",
        "bookmarks"  = "bookmarks_count",
        "votes_up"   = "up_votes_count",
        "votes_down" = "down_votes_count",
        "shares"     = 0
    FROM
        (SELECT
             "s"."article_id"                  AS "id",
             coalesce("views"."count", 0)      AS "views_count",
             coalesce("comments"."count", 0)   AS "comments_count",
             coalesce("bookmarks"."count", 0)  AS "bookmarks_count",
             coalesce("up_votes"."count", 0)   AS "up_votes_count",
             coalesce("down_votes"."count", 0) AS "down_votes_count"
         FROM
             "article_stats" "s"
                 LEFT JOIN
                 "views_" "views" ON "views"."article_id" = "s"."article_id"
                 LEFT JOIN "comments_" "comments" ON "comments"."article_id" = "s"."article_id"
                 LEFT JOIN "bookmarks_" "bookmarks" ON "bookmarks"."article_id" = "s"."article_id"
                 LEFT JOIN "votes_" "up_votes" ON "up_votes"."article_id" = "s"."article_id" AND "up_votes"."value" = 1
                 LEFT JOIN "votes_" "down_votes"
                           ON "down_votes"."article_id" = "s"."article_id" AND "down_votes"."value" = -1
        ) "calc_stats"
    WHERE
            "calc_stats"."id" = "stats"."article_id";
    END
    $$ LANGUAGE "plpgsql";

--changeset radmir:article-stats-update-fix-2 splitStatements:false
CREATE OR REPLACE PROCEDURE "public".article_stats_update(
)
    LANGUAGE 'plpgsql'
AS
$BODY$
BEGIN
    CREATE TEMPORARY TABLE "views_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "article_view"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "comments_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "comment"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "bookmarks_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "bookmark"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "votes_" ON COMMIT DROP
    AS (SELECT "article_id",
               "value",
               COUNT(*) AS "count"
        FROM "article_vote"
        GROUP BY "article_id", "value");

    CREATE TEMPORARY TABLE "non_unique_views_" ON COMMIT DROP
    AS (SELECT *
        FROM "article_non_unique_view"
        GROUP BY "article_id", "value");

    UPDATE "article_stats" "stats"
    SET "views"            = "views_count",
        "comments"         = "comments_count",
        "bookmarks"        = "bookmarks_count",
        "votes_up"         = "up_votes_count",
        "votes_down"       = "down_votes_count",
        "shares"           = 0,
        "non_unique_views" = "not_unique_views_count"
    FROM (SELECT "s"."article_id"                              AS "id",
                 coalesce("views"."count", 0)                  AS "views_count",
                 coalesce("comments"."count", 0)               AS "comments_count",
                 coalesce("bookmarks"."count", 0)              AS "bookmarks_count",
                 coalesce("up_votes"."count", 0)               AS "up_votes_count",
                 coalesce("down_votes"."count", 0)             AS "down_votes_count",
                 coalesce("not_unique_views"."views_count", 0) AS "not_unique_views_count"
          FROM "article_stats" "s"
                   LEFT JOIN
               "views_" "views" ON "views"."article_id" = "s"."article_id"
                   LEFT JOIN "comments_" "comments" ON "comments"."article_id" = "s"."article_id"
                   LEFT JOIN "bookmarks_" "bookmarks" ON "bookmarks"."article_id" = "s"."article_id"
                   LEFT JOIN "votes_" "up_votes"
                             ON "up_votes"."article_id" = "s"."article_id" AND "up_votes"."value" = 1
                   LEFT JOIN "votes_" "down_votes"
                             ON "down_votes"."article_id" = "s"."article_id" AND "down_votes"."value" = -1
                   LEFT JOIN "non_unique_views_" "not_unique_views"
                             ON "not_unique_views"."article_id" = "s"."article_id"
         ) "calc_stats"
    WHERE "calc_stats"."id" = "stats"."article_id";
END
$BODY$;

--changeset radmir:article-stats-update-fix-3 splitStatements:false
CREATE OR REPLACE PROCEDURE "public".article_stats_update(
)
    LANGUAGE 'plpgsql'
AS
$BODY$
BEGIN
    CREATE TEMPORARY TABLE "views_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "article_view"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "comments_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "comment"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "bookmarks_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "bookmark"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "votes_" ON COMMIT DROP
    AS (SELECT "article_id",
               "value",
               COUNT(*) AS "count"
        FROM "article_vote"
        GROUP BY "article_id", "value");

    CREATE TEMPORARY TABLE "non_unique_views_" ON COMMIT DROP
    AS (SELECT *
        FROM "article_non_unique_view"
        GROUP BY "article_id", "views_count");

    UPDATE "article_stats" "stats"
    SET "views"            = "views_count",
        "comments"         = "comments_count",
        "bookmarks"        = "bookmarks_count",
        "votes_up"         = "up_votes_count",
        "votes_down"       = "down_votes_count",
        "shares"           = 0,
        "non_unique_views" = "not_unique_views_count"
    FROM (SELECT "s"."article_id"                              AS "id",
                 coalesce("views"."count", 0)                  AS "views_count",
                 coalesce("comments"."count", 0)               AS "comments_count",
                 coalesce("bookmarks"."count", 0)              AS "bookmarks_count",
                 coalesce("up_votes"."count", 0)               AS "up_votes_count",
                 coalesce("down_votes"."count", 0)             AS "down_votes_count",
                 coalesce("not_unique_views"."views_count", 0) AS "not_unique_views_count"
          FROM "article_stats" "s"
                   LEFT JOIN
               "views_" "views" ON "views"."article_id" = "s"."article_id"
                   LEFT JOIN "comments_" "comments" ON "comments"."article_id" = "s"."article_id"
                   LEFT JOIN "bookmarks_" "bookmarks" ON "bookmarks"."article_id" = "s"."article_id"
                   LEFT JOIN "votes_" "up_votes"
                             ON "up_votes"."article_id" = "s"."article_id" AND "up_votes"."value" = 1
                   LEFT JOIN "votes_" "down_votes"
                             ON "down_votes"."article_id" = "s"."article_id" AND "down_votes"."value" = -1
                   LEFT JOIN "non_unique_views_" "not_unique_views"
                             ON "not_unique_views"."article_id" = "s"."article_id"
         ) "calc_stats"
    WHERE "calc_stats"."id" = "stats"."article_id";
END
$BODY$;

--changeset radmir:article-stats-update-fix-4 splitStatements:false
CREATE OR REPLACE PROCEDURE "public".article_stats_update(
)
    LANGUAGE 'plpgsql'
AS
$BODY$
BEGIN
    CREATE TEMPORARY TABLE "views_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "article_view"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "comments_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "comment"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "bookmarks_" ON COMMIT DROP
    AS (SELECT "article_id",
               COUNT(*) AS "count"
        FROM "bookmark"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "votes_" ON COMMIT DROP
    AS (SELECT "article_id",
               "value",
               COUNT(*) AS "count"
        FROM "article_vote"
        GROUP BY "article_id", "value");

    CREATE TEMPORARY TABLE "non_unique_views_" ON COMMIT DROP
    AS (SELECT "article_id", "views_count"
        FROM "article_non_unique_view"
        GROUP BY "article_id", "views_count");

    UPDATE "article_stats" "stats"
    SET "views"            = "views_count",
        "comments"         = "comments_count",
        "bookmarks"        = "bookmarks_count",
        "votes_up"         = "up_votes_count",
        "votes_down"       = "down_votes_count",
        "shares"           = 0,
        "non_unique_views" = "not_unique_views_count"
    FROM (SELECT "s"."article_id"                              AS "id",
                 coalesce("views"."count", 0)                  AS "views_count",
                 coalesce("comments"."count", 0)               AS "comments_count",
                 coalesce("bookmarks"."count", 0)              AS "bookmarks_count",
                 coalesce("up_votes"."count", 0)               AS "up_votes_count",
                 coalesce("down_votes"."count", 0)             AS "down_votes_count",
                 coalesce("not_unique_views"."views_count", 0) AS "not_unique_views_count"
          FROM "article_stats" "s"
                   LEFT JOIN
               "views_" "views" ON "views"."article_id" = "s"."article_id"
                   LEFT JOIN "comments_" "comments" ON "comments"."article_id" = "s"."article_id"
                   LEFT JOIN "bookmarks_" "bookmarks" ON "bookmarks"."article_id" = "s"."article_id"
                   LEFT JOIN "votes_" "up_votes"
                             ON "up_votes"."article_id" = "s"."article_id" AND "up_votes"."value" = 1
                   LEFT JOIN "votes_" "down_votes"
                             ON "down_votes"."article_id" = "s"."article_id" AND "down_votes"."value" = -1
                   LEFT JOIN "non_unique_views_" "not_unique_views"
                             ON "not_unique_views"."article_id" = "s"."article_id"
         ) "calc_stats"
    WHERE "calc_stats"."id" = "stats"."article_id";
END
$BODY$;
