--liquibase formatted sql

--changeset victoria:deduplicate-user-subs
DELETE
FROM
    "author_subscription" "s" USING (
    SELECT
        min("ctid") AS "ctid",
        "ds"."author_id",
        "ds"."user_id"
    FROM
        "author_subscription" "ds"
    GROUP BY "ds"."author_id", "ds"."user_id"
    HAVING
        count(*) > 1
) "ds"
WHERE
      "s"."user_id" = "ds"."user_id"
  AND "s"."author_id" = "ds"."author_id"
  AND "s"."ctid" <> "ds"."ctid";

ALTER TABLE "author_subscription"
    ADD CONSTRAINT "UQ_author_subscription" UNIQUE ("user_id", "author_id");

--changeset victoria:deduplicate-topic-subs
DELETE
FROM
    "topic_subscription" "s" USING (
    SELECT
        min("ctid") AS "ctid",
        "ds"."topic_id",
        "ds"."user_id"
    FROM
        "topic_subscription" "ds"
    GROUP BY "ds"."topic_id", "ds"."user_id"
    HAVING
        count(*) > 1
) "ds"
WHERE
      "s"."user_id" = "ds"."user_id"
  AND "s"."topic_id" = "ds"."topic_id"
  AND "s"."ctid" <> "ds"."ctid";

ALTER TABLE "topic_subscription"
    ADD CONSTRAINT "UQ_topic_subscription" UNIQUE ("user_id", "topic_id");

--changeset victoria:deduplicate-company-subs
DELETE
FROM
    "company_subscription" "s" USING (
    SELECT
        min("ctid") AS "ctid",
        "ds"."company_id",
        "ds"."user_id"
    FROM
        "company_subscription" "ds"
    GROUP BY "ds"."company_id", "ds"."user_id"
    HAVING
        count(*) > 1
) "ds"
WHERE
      "s"."user_id" = "ds"."user_id"
  AND "s"."company_id" = "ds"."company_id"
  AND "s"."ctid" <> "ds"."ctid";

ALTER TABLE "company_subscription"
    ADD CONSTRAINT "UQ_company_subscription" UNIQUE ("user_id", "company_id");
