--liquibase formatted sql

--changeset victoria:topic-rating
CREATE VIEW "topic_rating"
AS
    (
    SELECT
        "topic_id",
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "article_stats"."calculated_score") AS "score"
    FROM
        "article_topic"
            INNER JOIN "article"
                       ON "article"."id" = "article_topic"."article_id" AND "article"."publication_stage" = 2 AND
                          "article_topic"."rank" = 1
            INNER JOIN "article_stats" ON "article_stats"."article_id" = "article_topic"."article_id"
    GROUP BY
        "topic_id"
        );

--changeset victoria:tag-rating
CREATE VIEW "tag_rating"
AS
    (
    SELECT
        "tag_id",
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "article_stats"."calculated_score") AS "score"
    FROM
        "article_tag"
            INNER JOIN "article" ON "article"."id" = "article_tag"."article_id" AND "article"."publication_stage" = 2
            INNER JOIN "article_stats" ON "article_stats"."article_id" = "article_tag"."article_id"
    GROUP BY
        "tag_id"
        );

--changeset victoria:user-rating
CREATE VIEW "user_rating"
AS
    (
    SELECT
        "user"."id",
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "article_stats"."calculated_score") AS "score"
    FROM
        "user"
            INNER JOIN "article" ON "article"."author_id" = "user"."id" AND "article"."publication_stage" = 2
            INNER JOIN "article_stats" ON "article_stats"."article_id" = "article"."id"
    GROUP BY
        "user"."id"
        );

--changeset radmir:user-rating-update
CREATE OR REPLACE VIEW "author_rating"
AS
(
SELECT
    "user"."id",
    percentile_cont(0.5) WITHIN GROUP (ORDER BY "article_stats"."calculated_score") AS "score"
FROM
    "user"
        INNER JOIN "article" ON "article"."author_id" = "user"."id" AND "article"."publication_stage" = 2
        INNER JOIN "article_stats" ON "article_stats"."article_id" = "article"."id"
GROUP BY
    "user"."id"
);

CREATE OR REPLACE VIEW "user_rating"
AS
(
SELECT *
FROM "author_rating"
UNION ALL
select distinct "user"."id", 0
from "user"
inner join user_role on "user".id = user_role.user_id
where 1 = 1
      and (user_role.role_name = 'ROLE_SUPERUSER'
      or user_role.role_name = 'ROLE_CHIEF_EDITOR'
      or user_role.role_name = 'ROLE_SALES'
      or user_role.role_name = 'ROLE_PRIVILEGED_USER')
      and "user".id not in (
        SELECT "author_rating".id
        FROM "author_rating"
        GROUP BY "author_rating".id
      )
);