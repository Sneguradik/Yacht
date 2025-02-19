--liquibase formatted sql

--changeset victoria:article-stats
ALTER TABLE "article_stats"
    ALTER COLUMN "score" SET DEFAULT 0,
    ALTER COLUMN "unique_users_commenting" SET DEFAULT 0,
    ALTER COLUMN "reactions" SET DEFAULT 0,
    ALTER COLUMN "feed_views" SET DEFAULT 0,
    ALTER COLUMN "bookmarks" SET DEFAULT 0,
    ALTER COLUMN "comments" SET DEFAULT 0,
    ALTER COLUMN "views" SET DEFAULT 0,
    ALTER COLUMN "calculated_score" SET DEFAULT 0;

INSERT INTO "article_stats" ("article_id")
SELECT
    "id"
FROM
    "article"
WHERE
    NOT EXISTS(
            SELECT 1 FROM "article_stats" WHERE "article_id" = "article"."id");

--changeset victoria:article-stats-trigger splitStatements:false
CREATE OR REPLACE FUNCTION "create_article_stats"() RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO "article_stats"("article_id") VALUES (new."id") ON CONFLICT DO NOTHING;
        RETURN new;
    END;
    $$ LANGUAGE plpgsql;

CREATE TRIGGER "article_stats_trigger" AFTER INSERT ON "article" FOR EACH ROW EXECUTE PROCEDURE "create_article_stats"();

--changeset radmir:article-stats-non-unique-column
ALTER TABLE article_stats
    ADD COLUMN IF NOT EXISTS non_unique_views INTEGER