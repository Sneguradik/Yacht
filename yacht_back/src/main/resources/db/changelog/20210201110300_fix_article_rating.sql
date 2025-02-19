--liquibase formatted sql

--changeset radmir:fix_article_rating splitStatements:false
CREATE OR REPLACE FUNCTION "public"."topic_rating_t"("after" DATE, "before" DATE)
    RETURNS TABLE
            (
                "tid"   BIGINT,
                "score" DOUBLE PRECISION,
                "count" BIGINT
            )
AS
$$
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
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_comment";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.divider' INTO "conf_divider";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor1' INTO "conf_factor1";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor2' INTO "conf_factor2";

    RETURN QUERY (
        SELECT "at"."topic_id"                                               AS "tid",
               percentile_cont(0.5) WITHIN GROUP (ORDER BY "rating"."score") AS "score",
               COUNT(*)                                                      AS "count"
        FROM "article_topic" AS "at"
                 INNER JOIN "topic" ON "topic"."id" = "at"."topic_id"
                 INNER JOIN "article" ON "article"."id" = "at"."article_id" AND "article"."publication_stage" = 2 AND
                                         ("before" IS NULL OR "article"."published_at" <= "before") AND
                                         ("after" IS NULL OR "article"."published_at" >= "after")
                 INNER JOIN "article_rating_cnf_t"("after", "before", "conf_vote-up", "conf_vote-down", "conf_view",
                                                   "conf_bookmark", "conf_comment", "conf_share", "conf_divider",
                                                   "conf_factor1", "conf_factor2") "rating"
                            ON "rating"."aid" = "at"."article_id"
        GROUP BY "at"."topic_id");
END
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "public"."article_rating_t"("after" DATE, "before" DATE)
    RETURNS TABLE
            (
                "aid"   BIGINT,
                "score" DOUBLE PRECISION
            )
AS
$$
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
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_comment";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.divider' INTO "conf_divider";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor1' INTO "conf_factor1";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor2' INTO "conf_factor2";

    RETURN QUERY SELECT *
                 FROM
                     "article_rating_cnf_t"("after", "before", "conf_vote-up", "conf_vote-down", "conf_view",
                                            "conf_bookmark", "conf_comment", "conf_share", "conf_divider",
                                            "conf_factor1", "conf_factor2");
END
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS article_rating_cnf_t(date, date, real, real, real, real, real, real);

CREATE OR REPLACE FUNCTION "public"."article_rating_cnf_t"("after" DATE, "before" DATE, "conf_vote-up" REAL,
                                                           "conf_vote-down" REAL, "conf_view" REAL,
                                                           "conf_bookmark" REAL, "conf_comment" REAL,
                                                           "conf_share" REAL, "conf_divider" REAL,
                                                           "conf_factor1" REAL, "conf_factor2" REAL)
    RETURNS TABLE
            (
                "aid"   BIGINT,
                "score" DOUBLE PRECISION
            )
AS
'
    BEGIN
        RETURN QUERY (
            SELECT "calc_stats"."id"    AS "aid",
                   "calc_stats"."score" AS "score"
            FROM (
                     SELECT "s"."article_id"    AS "id",
                            ROUND(("conf_view" * coalesce("views"."count", 0) +
                                   "conf_comment" * "s"."comments" +
                                   "conf_bookmark" * "s"."bookmarks" +
                                   "conf_vote-up" * "s"."votes_up" +
                                   "conf_vote-down" * "s"."votes_down" +
                                   "conf_factor1" + "conf_factor2")
                                / conf_divider) AS "score"
                     FROM "article_stats" "s"
                              LEFT JOIN
                          (SELECT "article_id",
                                  "views_count" AS "count"
                           FROM "article_non_unique_view"
                           WHERE ("after" IS NULL OR (SELECT "created_at" >= "after"
                                                      FROM "article"
                                                      WHERE id = article_id))
                             AND ("before" IS NULL OR (SELECT "created_at" <= "before"
                                                       FROM "article"
                                                       WHERE id = article_id))
                           GROUP BY "article_id", "views_count") "views"
                          ON "views"."article_id" = "s"."article_id"
                 ) "calc_stats"
        );
    END;
' LANGUAGE plpgsql;

--changeset radmir:fix_user_rating splitStatements:false
create or replace function user_rating_t(after date, before date)
    returns TABLE(uid bigint, score double precision, count bigint)
    language plpgsql
as
$$
DECLARE
    "conf_vote-up"    REAL;
    "conf_vote-down"  REAL;
    "conf_view"       REAL;
    "conf_bookmark"   REAL;
    "conf_comment"    REAL;
    "conf_share"      REAL;
    "conf_divider"    REAL;
    "conf_factor1"    REAL;
    "conf_factor2"    REAL;
    "conf_userMethod" REAL;

BEGIN
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-up' INTO "conf_vote-up";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-down' INTO "conf_vote-down";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.view' INTO "conf_view";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.share' INTO "conf_share";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_comment";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.divider' INTO "conf_divider";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor1' INTO "conf_factor1";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor2' INTO "conf_factor2";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.userMethod' INTO "conf_userMethod";

    RETURN QUERY
        SELECT "article"."author_id"                                                               AS "uid",
               case "conf_userMethod"
                   when 1.0 then ROUND(AVG("rating"."score")::numeric, 2)
                   when 0.0 then percentile_cont(0.5) WITHIN GROUP (ORDER BY "rating"."score") END AS "score",
               COUNT(*)                                                                            AS "count"
        FROM "article"
                 INNER JOIN article_rating_cnf_t("after", "before", "conf_vote-up", "conf_vote-down", "conf_view",
                                                 "conf_bookmark", "conf_comment", "conf_share", "conf_divider",
                                                 "conf_factor1", "conf_factor2") "rating"
                            ON "rating"."aid" = "article"."id" AND "article"."publication_stage" = 2 AND
                               ("before" IS NULL OR "article"."published_at" <= "before") AND
                               ("after" IS NULL OR "article"."published_at" >= "after")
        GROUP BY "article"."author_id";
END;
$$;

CREATE OR REPLACE VIEW "author_rating"
AS
(
SELECT "uid" as "id", "score"
FROM user_rating_t((now() - make_interval(0, 0, 0, (SELECT "value" as "days"
                                                    FROM "ranking_config"
                                                    WHERE "id" = 'ranking.days')::integer, 0, 0, 0.0))::date,
                   null) as "rating"
    );
