--liquibase formatted sql

--changeset victoria:deduplicate
DELETE
FROM
    "article_attribute" "aa" USING (
    SELECT
        min("ctid") AS "ctid",
        "da"."attribute_id",
        "da"."article_id"
    FROM
        "article_attribute" "da"
    GROUP BY "da"."attribute_id", "da"."article_id"
    HAVING
        count(*) > 1
) "da"
WHERE
      "aa"."article_id" = "da"."article_id"
  AND "aa"."attribute_id" = "da"."attribute_id"
  AND "aa"."ctid" <> "da"."ctid";

ALTER TABLE "article_attribute"
    ADD CONSTRAINT "PK_article_attribute" PRIMARY KEY ("article_id", "attribute_id");

DELETE
FROM
    "article_tag" "at" USING (
    SELECT
        min("ctid") AS "ctid",
        "dt"."tag_id",
        "dt"."article_id"
    FROM
        "article_tag" "dt"
    GROUP BY "dt"."tag_id", "dt"."article_id"
    HAVING
        count(*) > 1
) "da"
WHERE
      "at"."article_id" = "da"."article_id"
  AND "at"."tag_id" = "da"."tag_id"
  AND "at"."ctid" <> "da"."ctid";

ALTER TABLE "article_tag"
    ADD CONSTRAINT "PK_article_tag" PRIMARY KEY ("article_id", "tag_id");

--changeset victoria:attribute-rank
ALTER TABLE "article_attribute"
    ADD COLUMN "created_at" TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN "updated_at" TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN "rank"       SMALLINT;

WITH
    "new_ranks" AS
        (
            SELECT
                rank() OVER (PARTITION BY "article_attribute"."article_id" ORDER BY "attribute_id") AS "rank",
                "article_id",
                "attribute_id"
            FROM
                "article_attribute"
        )
UPDATE "article_attribute"
SET
    "rank"       = "new_ranks"."rank",
    "created_at" = now(),
    "updated_at" = now()
FROM
    "new_ranks"
WHERE
      "article_attribute"."article_id" = "new_ranks"."article_id"
  AND "article_attribute"."attribute_id" = "new_ranks"."attribute_id";

--changeset victoria:tag-rank
ALTER TABLE "article_tag"
    ADD COLUMN "created_at" TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN "updated_at" TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN "rank"       SMALLINT;

WITH
    "new_ranks" AS
        (
            SELECT
                rank() OVER (PARTITION BY "article_tag"."article_id" ORDER BY "tag_id") AS "rank",
                "article_id",
                "tag_id"
            FROM
                "article_tag"
        )
UPDATE "article_tag"
SET
    "rank"       = "new_ranks"."rank",
    "created_at" = now(),
    "updated_at" = now()
FROM
    "new_ranks"
WHERE
      "article_tag"."article_id" = "new_ranks"."article_id"
  AND "article_tag"."tag_id" = "new_ranks"."tag_id";
