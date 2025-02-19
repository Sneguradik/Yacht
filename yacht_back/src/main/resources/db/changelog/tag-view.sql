--liquibase formatted sql

--changeset lina:tag-view
CREATE TABLE "tag_view"
(
    "id"          BIGSERIAL PRIMARY KEY,
    "created_at"  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    "fingerprint" TEXT,
    "tag_id"      BIGINT REFERENCES "tag" ("id"),
    "user_id"     BIGINT REFERENCES "user" ("id"),
    CONSTRAINT "UQ_tag_view__anonymous" UNIQUE ("fingerprint", "tag_id"),
    CONSTRAINT "UQ_tag_view__user" UNIQUE ("user_id", "tag_id"),
    CONSTRAINT "FK_tag_view__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION,
    CONSTRAINT "FK_tag_view__tag" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE CASCADE,
    CONSTRAINT "CHK_tag_view" CHECK (("fingerprint" IS NOT NULL AND "user_id" IS NULL) OR
                                     ("fingerprint" IS NULL AND "user_id" IS NOT NULL))
);

--changeset lina:tag-view-constraint-fix
ALTER TABLE "tag_view"
    DROP CONSTRAINT "tag_view_tag_id_fkey";
ALTER TABLE "tag_view"
    DROP CONSTRAINT "tag_view_user_id_fkey";

--changeset victoria:tag-view-user-cascade
ALTER TABLE "tag_view"
    DROP CONSTRAINT "FK_tag_view__user",
    ADD CONSTRAINT "FK_tag_view__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;

--changeset radmir:job_non_unique_view
create TABLE "tag_non_unique_view"
(
    "id"         BIGINT not null PRIMARY KEY,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "views_count"       INTEGER NOT NULL,
    "tag_id"        BIGINT                      NOT NULL,
    CONSTRAINT "FK_tag_id" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE CASCADE
);

ALTER TABLE tag_non_unique_view
    ADD CONSTRAINT "tag_unique" UNIQUE ("tag_id");
