--liquibase formatted sql

--changeset lina:article-promotion-list
create TABLE "article_promotion_list"
(
    "id"         BIGINT PRIMARY KEY,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "name"       VARCHAR(255) NOT NULL UNIQUE
);

create TABLE "article_promotion_list_item"
(
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "article_id" BIGINT NOT NULL REFERENCES "article"("id"),
    "list_id"    BIGINT NOT NULL REFERENCES "article_promotion_list"("id"),
    CONSTRAINT "PK_promotion_list_item" PRIMARY KEY ("article_id", "list_id")
);

--changeset lina:article-promotion-list-id-convert-into-sequence
CREATE SEQUENCE article_promotion_list_id_seq;
ALTER TABLE article_promotion_list ALTER COLUMN id SET NOT NULL;
ALTER TABLE article_promotion_list ALTER COLUMN id SET DEFAULT nextval('article_promotion_list_id_seq');
ALTER SEQUENCE article_promotion_list_id_seq OWNED BY article_promotion_list.id;

--changeset victoria:list-text-id
ALTER TABLE "article_promotion_list"
    RENAME COLUMN "id" TO "id_num";
ALTER TABLE "article_promotion_list_item"
    RENAME COLUMN "list_id" TO "list_id_num";
ALTER TABLE "article_promotion_list"
    ADD COLUMN "id" TEXT;
UPDATE "article_promotion_list" SET "id" = "name" WHERE TRUE;
ALTER TABLE "article_promotion_list_item"
    ADD COLUMN "list_id" TEXT;
UPDATE "article_promotion_list_item" SET "list_id" = "id" FROM "article_promotion_list" WHERE "id_num" = "list_id_num";
ALTER TABLE "article_promotion_list_item"
    DROP COLUMN "list_id_num" CASCADE;
ALTER TABLE "article_promotion_list"
    DROP COLUMN "id_num";
ALTER TABLE "article_promotion_list"
    ADD CONSTRAINT "PK_article_promotion_list" PRIMARY KEY ("id");
ALTER TABLE "article_promotion_list_item"
    ALTER COLUMN "list_id" SET NOT NULL;
ALTER TABLE "article_promotion_list_item"
    ADD CONSTRAINT "FK_article_promotion_list_item__list" FOREIGN KEY ("list_id") REFERENCES "article_promotion_list" ("id"),
    ADD CONSTRAINT "PK_article_promotion_list_item" PRIMARY KEY ("article_id", "list_id");
ALTER TABLE "article_promotion_list"
    DROP COLUMN "name";