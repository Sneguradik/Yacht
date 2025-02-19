--liquibase formatted sql

--changeset lina:vote-table-fix
ALTER TABLE "article_vote"
    ADD COLUMN "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now();

--changeset lina:article-stats-update-by-time splitStatements:false
CREATE OR REPLACE FUNCTION "public"."article_rating_cnf_t"("after" DATE, "before" DATE, "conf_vote-up" REAL,
                                                           "conf_vote-down" REAL, "conf_view" REAL,
                                                           "conf_bookmark" REAL, "conf_comment" REAL,
                                                           "conf_share" REAL)
    RETURNS TABLE
            (
                "aid"   BIGINT,
                "score" DOUBLE PRECISION
            )
AS
$$
BEGIN
    RETURN QUERY (
        SELECT
            "calc_stats"."id"    AS "aid",
            "calc_stats"."score" AS "score"
        FROM
            (
                SELECT
                    "s"."article_id"                                                 AS "id",
                    "conf_view" * coalesce("views"."count", 0) +
                    "conf_comment" * coalesce("comments"."count", 0) +
                    "conf_bookmark" * coalesce("bookmarks"."count", 0) +
                    "conf_vote-up" * coalesce("votes"."up", 0) +
                    "conf_vote-down" * coalesce("votes"."down", 0)::DOUBLE PRECISION AS "score"
                FROM
                    "article_stats" "s"
                        LEFT JOIN
                        (SELECT
                             "article_id",
                             COUNT(*) AS "count"
                         FROM
                             "article_view"
                         WHERE
                               ("after" IS NULL OR "created_at" >= "after")
                           AND ("before" IS NULL OR "created_at" <= "before")
                         GROUP BY "article_id") "views"
                        ON "views"."article_id" = "s"."article_id"
                        LEFT JOIN (SELECT
                                       "article_id",
                                       COUNT(*) AS "count"
                                   FROM
                                       "comment"
                                   WHERE
                                         ("after" IS NULL OR "created_at" >= "after")
                                     AND ("before" IS NULL OR "created_at" <= "before")
                                   GROUP BY "article_id") "comments"
                                  ON "comments"."article_id" = "s"."article_id"

                        LEFT JOIN (SELECT
                                       "article_id",
                                       COUNT(*) AS "count"
                                   FROM
                                       "bookmark"
                                   WHERE
                                         ("after" IS NULL OR "created_at" >= "after")
                                     AND ("before" IS NULL OR "created_at" <= "before")
                                   GROUP BY "article_id") "bookmarks"
                                  ON "bookmarks"."article_id" = "s"."article_id"

                        LEFT JOIN (SELECT
                                       "article_id",
                                       COUNT(CASE WHEN "value" = 1 THEN 1 END)  AS "up",
                                       COUNT(CASE WHEN "value" = -1 THEN 1 END) AS "down"
                                   FROM
                                       "article_vote"
                                   WHERE
                                         ("after" IS NULL OR "created_at" >= "after")
                                     AND ("before" IS NULL OR "created_at" <= "before")
                                   GROUP BY "article_id") "votes"
                                  ON "votes"."article_id" = "s"."article_id"
            ) "calc_stats"
    );
END
$$ LANGUAGE plpgsql;

--changeset victoria:article-stats-update-by-time-cfg splitStatements:false
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
BEGIN
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-up' INTO "conf_vote-up";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-down' INTO "conf_vote-down";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.view' INTO "conf_view";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.share' INTO "conf_share";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_comment";

    RETURN QUERY SELECT *
                 FROM
                     "article_rating_cnf_t"("after", "before", "conf_vote-up", "conf_vote-down", "conf_view",
                                            "conf_bookmark", "conf_comment", "conf_share");
END
$$ LANGUAGE plpgsql;

--changeset victoria:topic-rating-t splitStatements:false
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
BEGIN
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-up' INTO "conf_vote-up";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-down' INTO "conf_vote-down";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.view' INTO "conf_view";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.share' INTO "conf_share";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_comment";

    RETURN QUERY (
        SELECT
            "at"."topic_id"                                               AS "tid",
            percentile_cont(0.5) WITHIN GROUP (ORDER BY "rating"."score") AS "score",
            COUNT(*)                                                      AS "count"
        FROM
            "article_topic" AS "at"
                INNER JOIN "topic" ON "topic"."id" = "at"."topic_id"
                INNER JOIN "article" ON "article"."id" = "at"."article_id" AND "article"."publication_stage" = 2 AND
                                        ("before" IS NULL OR "article"."published_at" <= "before") AND
                                        ("after" IS NULL OR "article"."published_at" >= "after")
                INNER JOIN article_rating_cnf_t("after", "before", "conf_vote-up", "conf_vote-down", "conf_view",
                                                "conf_bookmark", "conf_comment", "conf_share") "rating"
                           ON "rating"."aid" = "at"."article_id"
        GROUP BY "at"."topic_id");
END
$$ LANGUAGE plpgsql;

--changeset victoria:user-rating-t splitStatements:false
CREATE OR REPLACE FUNCTION "public"."user_rating_t"("after" DATE, "before" DATE)
    RETURNS TABLE
            (
                "uid"   BIGINT,
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
BEGIN
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-up' INTO "conf_vote-up";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.vote-down' INTO "conf_vote-down";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.view' INTO "conf_view";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.share' INTO "conf_share";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_comment";
    RETURN QUERY
        SELECT
            "article"."author_id"                                         AS "uid",
            percentile_cont(0.5) WITHIN GROUP (ORDER BY "rating"."score") AS "score",
            COUNT(*)                                                      AS "count"
        FROM
            "article"
                INNER JOIN article_rating_cnf_t("after", "before", "conf_vote-up", "conf_vote-down", "conf_view",
                                                "conf_bookmark", "conf_comment", "conf_share") "rating"
                           ON "rating"."aid" = "article"."id" AND "article"."publication_stage" = 2 AND
                              ("before" IS NULL OR "article"."published_at" <= "before") AND
                              ("after" IS NULL OR "article"."published_at" >= "after")
        GROUP BY "article"."author_id";
END
$$ LANGUAGE plpgsql;

--changeset we2beast:new-count-of-rating-with-edit-methods
CREATE OR REPLACE FUNCTION "public"."article_rating_cnf_t"("after" DATE, "before" DATE, "conf_vote-up" REAL,
                                                              "conf_vote-down" REAL, "conf_view" REAL,
                                                              "conf_bookmark" REAL, "conf_comment" REAL,
                                                              "conf_share" REAL)
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
                 SELECT "s"."article_id"                                                 AS "id",
                        "conf_view" * coalesce("views"."count", 0) +
                        "conf_comment" * coalesce("comments"."count", 0) +
                        "conf_bookmark" * coalesce("bookmarks"."count", 0) +
                        "conf_vote-up" * coalesce("votes"."up", 0) +
                        "conf_vote-down" * coalesce("votes"."down", 0)::DOUBLE PRECISION AS "score"
                 FROM "article_stats" "s"
                          LEFT JOIN
                      (SELECT "article_id",
                              COUNT(*) AS "count"
                       FROM "article_view"
                       WHERE CASE true
                                 WHEN
                                     (SELECT "is_edited" FROM "article" WHERE "id" = "article_id") THEN
                                         "created_at" >=
                                         (SELECT "updated_at" FROM "article" WHERE "id" = "article_id")
                                 ELSE
                                     ("after" IS NULL OR "created_at" >= "after")
                           END
                         AND ("before" IS NULL OR "created_at" <= "before")
                       GROUP BY "article_id") "views"
                      ON "views"."article_id" = "s"."article_id"
                          LEFT JOIN (SELECT "article_id",
                                            COUNT(*) AS "count"
                                     FROM "comment"
                                     WHERE CASE true
                                               WHEN
                                                   (SELECT "is_edited" FROM "article" WHERE "id" = "article_id")
                                                   THEN
                                                       "created_at" >=
                                                       (SELECT "updated_at" FROM "article" WHERE "id" = "article_id")
                                               ELSE
                                                   ("after" IS NULL OR "created_at" >= "after")
                                         END
                                       AND ("before" IS NULL OR "created_at" <= "before")
                                     GROUP BY "article_id") "comments"
                                    ON "comments"."article_id" = "s"."article_id"

                          LEFT JOIN (SELECT "article_id",
                                            COUNT(*) AS "count"
                                     FROM "bookmark"
                                     WHERE CASE true
                                               WHEN
                                                   (SELECT "is_edited" FROM "article" WHERE "id" = "article_id")
                                                   THEN
                                                       "created_at" >=
                                                       (SELECT "updated_at" FROM "article" WHERE "id" = "article_id")
                                               ELSE
                                                   ("after" IS NULL OR "created_at" >= "after")
                                         END
                                       AND ("before" IS NULL OR "created_at" <= "before")
                                     GROUP BY "article_id") "bookmarks"
                                    ON "bookmarks"."article_id" = "s"."article_id"

                          LEFT JOIN (SELECT "article_id",
                                            COUNT(CASE WHEN "value" = 1 THEN 1 END)  AS "up",
                                            COUNT(CASE WHEN "value" = -1 THEN 1 END) AS "down"
                                     FROM "article_vote"
                                     WHERE CASE true
                                               WHEN
                                                   (SELECT "is_edited" FROM "article" WHERE "id" = "article_id")
                                                   THEN
                                                       "created_at" >=
                                                       (SELECT "updated_at" FROM "article" WHERE "id" = "article_id")
                                               ELSE
                                                   ("after" IS NULL OR "created_at" >= "after")
                                         END
                                       AND ("before" IS NULL OR "created_at" <= "before")
                                     GROUP BY "article_id") "votes"
                                    ON "votes"."article_id" = "s"."article_id"
             ) "calc_stats"
    );
END
' LANGUAGE plpgsql;

--changeset lina:updated-stats splitStatements:false
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
                                   "conf_comment" * coalesce("comments"."count", 0) +
                                   "conf_bookmark" * coalesce("bookmarks"."count", 0) +
                                   "conf_vote-up" * coalesce("votes"."up", 0) +
                                   "conf_vote-down" * coalesce("votes"."down", 0)::DOUBLE PRECISION +
                                   "conf_factor1" + "conf_factor2")
                                / conf_divider) AS "score"
                     FROM "article_stats" "s"
                              LEFT JOIN
                          (SELECT "article_id",
                                  COUNT(*) AS "count"
                           FROM "article_view"
                           WHERE CASE true
                                     WHEN
                                         (SELECT "is_edited"
                                          FROM "article"
                                          WHERE "id" = "article_id") THEN
                                             "created_at" >=
                                             (SELECT "updated_at"
                                              FROM "article"
                                              WHERE "id" = "article_id")
                                     ELSE
                                         ("after" IS NULL OR "created_at" >= "after")
                               END
                             AND ("before" IS NULL OR "created_at" <= "before")
                           GROUP BY "article_id") "views"
                          ON "views"."article_id" = "s"."article_id"
                              LEFT JOIN (SELECT "article_id",
                                                COUNT(*) AS "count"
                                         FROM "comment"
                                         WHERE CASE true
                                                   WHEN
                                                       (SELECT "is_edited"
                                                        FROM "article"
                                                        WHERE "id" = "article_id")
                                                       THEN
                                                           "created_at" >=
                                                           (SELECT "updated_at"
                                                            FROM "article"
                                                            WHERE "id" = "article_id")
                                                   ELSE
                                                       ("after" IS NULL OR "created_at" >= "after")
                                             END
                                           AND ("before" IS NULL OR "created_at" <= "before")
                                         GROUP BY "article_id") "comments"
                                        ON "comments"."article_id" = "s"."article_id"

                              LEFT JOIN (SELECT "article_id",
                                                COUNT(*) AS "count"
                                         FROM "bookmark"
                                         WHERE CASE true
                                                   WHEN
                                                       (SELECT "is_edited"
                                                        FROM "article"
                                                        WHERE "id" = "article_id")
                                                       THEN
                                                           "created_at" >=
                                                           (SELECT "updated_at"
                                                            FROM "article"
                                                            WHERE "id" = "article_id")
                                                   ELSE
                                                       ("after" IS NULL OR "created_at" >= "after")
                                             END
                                           AND ("before" IS NULL OR "created_at" <= "before")
                                         GROUP BY "article_id") "bookmarks"
                                        ON "bookmarks"."article_id" = "s"."article_id"

                              LEFT JOIN (SELECT "article_id",
                                                COUNT(CASE WHEN "value" = 1 THEN 1 END)  AS "up",
                                                COUNT(CASE WHEN "value" = -1 THEN 1 END) AS "down"
                                         FROM "article_vote"
                                         WHERE CASE true
                                                   WHEN
                                                       (SELECT "is_edited"
                                                        FROM "article"
                                                        WHERE "id" = "article_id")
                                                       THEN
                                                           "created_at" >=
                                                           (SELECT "updated_at"
                                                            FROM "article"
                                                            WHERE "id" = "article_id")
                                                   ELSE
                                                       ("after" IS NULL OR "created_at" >= "after")
                                             END
                                           AND ("before" IS NULL OR "created_at" <= "before")
                                         GROUP BY "article_id") "votes"
                                        ON "votes"."article_id" = "s"."article_id"
                 ) "calc_stats"
        );
    END;
' LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "public"."user_rating_t"(after date, before date)
    RETURNS TABLE
            (
                uid   BIGINT,
                score DOUBLE PRECISION,
                count BIGINT
            )
AS
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
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_comment";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.divider' INTO "conf_divider";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor1' INTO "conf_factor1";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor2' INTO "conf_factor2";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.userMethod' INTO "conf_userMethod";

    RETURN QUERY
        SELECT "article"."author_id"                                                               AS "uid",
               case "conf_userMethod"
                   when 1.0 then ROUND(AVG("rating"."score"))
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
$$ LANGUAGE plpgsql;


--changeset lina:ranking-score splitStatements:false
CREATE OR REPLACE PROCEDURE recalculate_ranking_score()
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
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_comment";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.divider' INTO "conf_divider";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor1' INTO "conf_factor1";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor2' INTO "conf_factor2";


    UPDATE "article_stats" "stats"
    SET "calculated_score" = ROUND(("votes_up"::REAL * "conf_vote-up" + "votes_down"::REAL * "conf_vote-down" +
                                    "views"::REAL * "conf_view" + "bookmarks"::REAL * "conf_bookmark" +
                                    "comments"::REAL * "conf_comment" + "shares"::REAL * "conf_share" + conf_factor1 +
                                    conf_factor2) / conf_divider);
END;
$$ LANGUAGE plpgsql;

--changeset lina:article-rating-t-update splitStatements:false
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
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_comment";
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

--changeset radmir:topic-rating-t-fix-bug splitStatements:false
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
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.comment' INTO "conf_bookmark";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.bookmark' INTO "conf_comment";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.divider' INTO "conf_divider";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor1' INTO "conf_factor1";
    SELECT "value" FROM "ranking_config" WHERE "id" = 'ranking.factor2' INTO "conf_factor2";

    RETURN QUERY (
        SELECT
            "at"."topic_id"                                               AS "tid",
            percentile_cont(0.5) WITHIN GROUP (ORDER BY "rating"."score") AS "score",
            COUNT(*)                                                      AS "count"
        FROM
            "article_topic" AS "at"
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