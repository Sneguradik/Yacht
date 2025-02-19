--liquibase formatted sql

--changeset victoria:article-search splitStatements:false
CREATE OR REPLACE FUNCTION "article_ts_vector"("title" VARCHAR, "summary" TEXT, "body" TEXT) RETURNS TSVECTOR AS
$$
BEGIN
    RETURN setweight(to_tsvector('russian', "title"), 'A') ||
           setweight(to_tsvector('russian', "summary"), 'B') ||
           setweight(to_tsvector('russian', "body"), 'C');
END
$$
    LANGUAGE 'plpgsql'
    IMMUTABLE;

CREATE INDEX "IDX_article_fts" ON "article" USING "gin" ("article_ts_vector"("title", "summary", "rendered_text_only"));

--changeset victoria:more-search splitStatements:false
CREATE OR REPLACE FUNCTION "user_ts_vector"("first_name" VARCHAR, "last_name" VARCHAR,
                                            "bio" TEXT) RETURNS TSVECTOR AS
$$
BEGIN
    RETURN setweight(to_tsvector('russian', "first_name" || ' ' || "last_name"), 'A') ||
           setweight(to_tsvector('russian', COALESCE("bio", '')), 'B');
END
$$ LANGUAGE 'plpgsql' IMMUTABLE;

CREATE OR REPLACE FUNCTION "company_ts_vector"("company_name" VARCHAR, "bio" TEXT) RETURNS TSVECTOR AS
$$
BEGIN
    RETURN setweight(to_tsvector('russian', COALESCE("company_name", '')), 'A') ||
           setweight(to_tsvector('russian', COALESCE("bio", '')), 'B');
END
$$ LANGUAGE 'plpgsql' IMMUTABLE;

CREATE INDEX "IDX_user_fts" ON "user" USING "gin" ("user_ts_vector"("first_name", "last_name", "bio"));

CREATE INDEX "IDX_company_fts" ON "user" USING "gin" ("company_ts_vector"("company_name", "bio"));

CREATE OR REPLACE FUNCTION "topic_ts_vector"("name" VARCHAR, "description" VARCHAR, "description_full" VARCHAR) RETURNS TSVECTOR AS
$$
BEGIN
    RETURN setweight(to_tsvector('russian', COALESCE("name", '')), 'A') ||
           setweight(to_tsvector('russian', COALESCE("description", '')), 'B') ||
           setweight(to_tsvector('russian', COALESCE("description_full", '')), 'C');
END
$$ LANGUAGE 'plpgsql' IMMUTABLE;

CREATE INDEX "IDX_topic_fts" ON "topic" USING "gin" ("topic_ts_vector"("name", "description", "description_full"));

CREATE INDEX "IDX_tag_fts" ON "tag" USING "gin" (to_tsvector('russian', "content"));

--changeset lina:advertisement-search splitStatements:false
CREATE OR REPLACE FUNCTION "advertisement-ts-vector"("name" VARCHAR, "text" VARCHAR,
                                                     "url" TEXT) RETURNS TSVECTOR AS
$$
BEGIN
    RETURN setweight(to_tsvector('russian', "name"), 'A') ||
           setweight(to_tsvector('russian', COALESCE("text", '')), 'B') ||
           setweight(to_tsvector('russian', "url"), 'C');
END
$$ LANGUAGE 'plpgsql' IMMUTABLE;

--changeset lina:advertisement-ts-vector-name-fix
    ALTER FUNCTION "advertisement-ts-vector"(name VARCHAR, text VARCHAR, url TEXT) rename to "advertisement_ts_vector";

--changeset radmir:user-search-include-username
CREATE OR REPLACE FUNCTION "user_ts_vector"("first_name" VARCHAR, "last_name" VARCHAR, "username" VARCHAR,
                                            "bio" TEXT) RETURNS TSVECTOR AS
'
DECLARE
BEGIN
    RETURN setweight(to_tsvector(''russian'', "first_name" || '' '' || "last_name"), ''A'') ||
           setweight(to_tsvector(''english'', "username" || string_agg(''@'',"username")), ''B'') ||
           setweight(to_tsvector(''russian'', COALESCE("bio", '''')), ''C'');
END
' LANGUAGE 'plpgsql' IMMUTABLE;

DROP INDEX IF EXISTS "IDX_user_fts";
CREATE INDEX "IDX_user_fts" ON "user" USING "gin" ("user_ts_vector"("first_name", "last_name", "username", "bio"));