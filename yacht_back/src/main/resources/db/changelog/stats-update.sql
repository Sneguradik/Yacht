--liquibase formatted sql

--changeset victoria:shrink-stat-size
ALTER TABLE "article_stats"
    ALTER "views" TYPE INTEGER,
    ALTER "feed_views" TYPE INTEGER,
    ALTER "comments" TYPE INTEGER,
    ALTER "unique_users_commenting" TYPE INTEGER,
    ALTER "score" TYPE INTEGER,
    ALTER "bookmarks" TYPE INTEGER,
    ALTER "reactions" TYPE INTEGER;

--changeset victoria:add-stats
ALTER TABLE "article_stats"
    ADD COLUMN "votes_up"   INTEGER DEFAULT 0,
    ADD COLUMN "votes_down" INTEGER DEFAULT 0,
    ADD COLUMN "shares"     INTEGER DEFAULT 0;

--changeset victoria:calculate-ranking splitStatements:false
CREATE PROCEDURE "public"."recalculate_ranking_score"() AS
$$
DECLARE
    "conf_vote-up"   REAL;
    "conf_vote-down" REAL;
    "conf_view"      REAL;
    "conf_bookmark"  REAL;
    "conf_comment"   REAL;
    "conf_share"     REAL;
BEGIN
    -- load config
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-up' INTO "conf_vote-up";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-down' INTO "conf_vote-down";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.view' INTO "conf_view";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.share' INTO "conf_share";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_comment";

    -- noinspection SqlWithoutWhere
    UPDATE "article_stats" "stats"
    SET
        "calculated_score" = "votes_up"::REAL * "conf_vote-up" + "votes_down"::REAL * "conf_vote-down" +
                             "views"::REAL * "conf_view" + "bookmarks"::REAL * "conf_bookmark" +
                             "comments"::REAL * "conf_comment" + "shares"::REAL * "conf_share";
END;
$$ LANGUAGE plpgsql;

--changeset victoria:stats-update splitStatements:false
CREATE PROCEDURE "public"."article_stats_update"() AS
$$
    BEGIN
    CREATE TEMPORARY TABLE "views_" ON COMMIT DROP
    AS (SELECT
            "article_id",
            COUNT(*) AS "count"
        FROM
            "article_view"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "comments_" ON COMMIT DROP
    AS (SELECT
            "article_id",
            COUNT(*) AS "count"
        FROM
            "comment"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "bookmarks_" ON COMMIT DROP
    AS (SELECT
            "article_id",
            COUNT(*) AS "count"
        FROM
            "bookmark"
        GROUP BY "article_id");
    CREATE TEMPORARY TABLE "votes_" ON COMMIT DROP
    AS (SELECT
            "article_id",
            "value",
            COUNT(*) AS "count"
        FROM
            "article_vote"
        GROUP BY "article_id", "value");

    -- noinspection SqlWithoutWhere
    UPDATE "article_stats" "stats"
    SET
        "views"      = coalesce("views"."count", 0),
        "comments"   = coalesce("comments"."count", 0),
        "bookmarks"  = coalesce("bookmarks"."count", 0),
        "votes_up"   = coalesce("up_votes"."count", 0),
        "votes_down" = coalesce("down_votes"."count", 0),
        "shares"     = 0
    FROM
        "article_stats" "s"
            LEFT JOIN "views_" "views" ON "views"."article_id" = "s"."article_id"
            LEFT JOIN "comments_" "comments" ON "comments"."article_id" = "s"."article_id"
            LEFT JOIN "bookmarks_" "bookmarks" ON "bookmarks"."article_id" = "s"."article_id"
            LEFT JOIN "votes_" "up_votes" ON "up_votes"."article_id" = "s"."article_id" AND "up_votes"."value" = 1
            LEFT JOIN "votes_" "down_votes"
                      ON "down_votes"."article_id" = "s"."article_id" AND "down_votes"."value" = -1;
    END
    $$ LANGUAGE "plpgsql";

--changeset radmir:calculate-ranking-with-non-unique-views splitStatements:false
CREATE OR REPLACE PROCEDURE "public".recalculate_ranking_score(
)
    LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    "conf_vote-up"   REAL;
    "conf_vote-down" REAL;
    "conf_view"      REAL;
    "conf_bookmark"  REAL;
    "conf_comment"   REAL;
    "conf_share"     REAL;
    "conf_divider"   REAL;
    "conf_factor1"   REAL;
    "conf_factor2"   REAL;
BEGIN

    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-up' INTO "conf_vote-up";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-down' INTO "conf_vote-down";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.view' INTO "conf_view";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.share' INTO "conf_share";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_comment";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.divider' INTO "conf_divider";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor1' INTO "conf_factor1";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor2' INTO "conf_factor2";

    UPDATE "article_stats" "stats"
    SET "calculated_score" = ROUND(("votes_up"::REAL * "conf_vote-up" + "votes_down"::REAL * "conf_vote-down" +
                                    "non_unique_views"::REAL * "conf_view" + "bookmarks"::REAL * "conf_bookmark" +
                                    "comments"::REAL * "conf_comment" + "shares"::REAL * "conf_share" + conf_factor1 +
                                    conf_factor2) / conf_divider);
END;
$BODY$;
