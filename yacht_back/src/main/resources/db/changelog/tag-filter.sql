--liquibase formatted sql

--changeset victoria:filter-used-tags
DROP VIEW "tag_v";

CREATE VIEW "tag_v"
AS
    SELECT
        -- meta
        "id",
        "created_at",
        "updated_at",
        -- info
        "content",
        "post_count"."count" AS "post_count"
    FROM
        "tag"
            LEFT OUTER JOIN (
            SELECT
                "tag_id",
                COALESCE(COUNT(*), 0) AS "count"
            FROM
                "article_tag"
                    INNER JOIN "article" ON "article_id" = "article"."id" AND "article"."published" IS TRUE
            GROUP BY "tag_id"
        ) "post_count" ON "tag"."id" = "tag_id";
