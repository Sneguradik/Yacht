--liquibase formatted sql

--changeset victoria:add-company-username
ALTER TABLE "company"
    ADD COLUMN "username" VARCHAR(255);
ALTER TABLE "company"
    ADD CONSTRAINT "UQ_company_username" UNIQUE ("username");

--changeset victoria:add-company-cover
ALTER TABLE "company"
    ADD COLUMN "profile_cover_url" VARCHAR(255);

--changeset victoria:non-null-tag-timestamps
UPDATE "tag"
SET
    "created_at" = NOW(),
    "updated_at" = NOW()
WHERE
     "tag"."created_at" IS NULL
  OR "tag"."updated_at" IS NULL;

ALTER TABLE "tag"
    ALTER "created_at" SET DEFAULT NOW(),
    ALTER "updated_at" SET DEFAULT NOW(),
    ALTER "created_at" SET NOT NULL,
    ALTER "updated_at" SET NOT NULL;

--changeset victoria:tags-unique-name
ALTER TABLE "tag"
    ADD CONSTRAINT "UQ_tag" UNIQUE("content");