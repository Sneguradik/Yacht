--liquibase formatted sql

--changeset lina:add-cover-image
ALTER TABLE "user"
   ADD COLUMN "profile_cover_url" VARCHAR(255);

--changeset victoria:add-contact-data
ALTER TABLE "user"
    ADD COLUMN "bio" TEXT,
    ADD COLUMN "geolocation" VARCHAR(255),
    ADD COLUMN "contact_email" VARCHAR(255),
    ADD COLUMN "contact_website_url" VARCHAR(255),
    ADD COLUMN "contact_phone" VARCHAR(32),
    ADD COLUMN "contact_social_instagram" VARCHAR(127),
    ADD COLUMN "contact_social_vk" VARCHAR(127),
    ADD COLUMN "contact_social_facebook" VARCHAR(127),
    ADD COLUMN "contact_social_twitter" VARCHAR(127),
    ADD COLUMN "contact_social_youtube" VARCHAR(127),
    ADD COLUMN "contact_social_linkedin" VARCHAR(127);

--changeset victoria:add-timestamps
ALTER TABLE "user"
    ADD COLUMN "created_at" TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN "updated_at" TIMESTAMP WITHOUT TIME ZONE;

--changeset victoria:user-timestamps-non-null
UPDATE "user"
SET
    "created_at" = NOW(),
    "updated_at" = NOW()
WHERE
     "user"."created_at" IS NULL
  OR "user"."updated_at" IS NULL;

ALTER TABLE "user"
    ALTER "created_at" SET DEFAULT NOW(),
    ALTER "updated_at" SET DEFAULT NOW(),
    ALTER "created_at" SET NOT NULL,
    ALTER "updated_at" SET NOT NULL;
