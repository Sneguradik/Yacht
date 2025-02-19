--liquibase formatted sql

--changeset victoria:showcase
CREATE TABLE "showcase_static_item"
(
    "id"                BIGSERIAL PRIMARY KEY,
    "created_at"        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "updated_at"        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "publication_stage" INTEGER                     NOT NULL DEFAULT 0,
    "published_at"      TIMESTAMP WITHOUT TIME ZONE,
    "duration"          INTERVAL,
    "cover"             TEXT,
    "subtitle"          TEXT                        NOT NULL DEFAULT '',
    "title"             TEXT                        NOT NULL DEFAULT '',
    "options"           JSON,
    "url"               TEXT
);

CREATE TABLE "showcase_static_item_view"
(
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "user_id"    BIGINT                      NOT NULL,
    "item_id"    BIGINT                      NOT NULL,
    CONSTRAINT "PK_showcase_static_item_view" PRIMARY KEY ("user_id", "item_id"),
    CONSTRAINT "FK_showcase_static_item_view__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id"),
    CONSTRAINT "FK_showcase_static_item_view__item" FOREIGN KEY ("item_id") REFERENCES "showcase_static_item" ("id")
);

--changeset victoria:fix-cascade-delete
ALTER TABLE "showcase_static_item_view"
    DROP CONSTRAINT "FK_showcase_static_item_view__user",
    DROP CONSTRAINT "FK_showcase_static_item_view__item",
    ADD CONSTRAINT "FK_showcase_static_item_view__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    ADD CONSTRAINT "FK_showcase_static_item_view__item" FOREIGN KEY ("item_id") REFERENCES "showcase_static_item" ("id") ON DELETE CASCADE;

--changeset radmir:showcase-stat
DROP TABLE IF EXISTS "showcase_static_item_stat";

CREATE TABLE "showcase_static_item_stat"
(
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "count"       BIGINT NOT NULL DEFAULT 0,
    "item_id"        BIGINT                      NOT NULL,
    "stat_type" INT4 not null default 0,
    CONSTRAINT "PK_showcase_static_item_stat" PRIMARY KEY ("stat_type", "item_id"),
    CONSTRAINT "FK_showcase_static_item_stat" FOREIGN KEY ("item_id") REFERENCES "showcase_static_item" ("id") ON DELETE CASCADE
);

ALTER TABLE "showcase_static_item"
    ADD COLUMN "item_id" BIGINT UNIQUE,
    ADD CONSTRAINT "item_id_unique" UNIQUE ("item_id");

--changeset radmir:showcase-stat-2
DROP TABLE IF EXISTS "showcase_static_item_stat";

CREATE TABLE "showcase_static_item_stat"
(
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "views_count"       BIGINT NOT NULL DEFAULT 0,
    "posts_count"       BIGINT NOT NULL DEFAULT 0,
    "subscribers_count"       BIGINT NOT NULL DEFAULT 0,
    "item_id"        BIGINT                      NOT NULL,
    CONSTRAINT "PK_showcase_static_item_stat" PRIMARY KEY ("item_id"),
    CONSTRAINT "FK_showcase_static_item_stat" FOREIGN KEY ("item_id") REFERENCES "showcase_static_item" ("id") ON DELETE CASCADE
);

--changeset radmir:showcase-stat-bug-prevent
DROP TABLE IF EXISTS "showcase_static_item_stat";

CREATE TABLE "showcase_static_item_stat"
(
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "views_count"       BIGINT NOT NULL DEFAULT 0,
    "posts_count"       BIGINT NOT NULL DEFAULT 0,
    "subscribers_count"       BIGINT NOT NULL DEFAULT 0,
    "item_id"        BIGINT                      NOT NULL,
    "item_type"      INT4 NOT NULL,
    CONSTRAINT "PK_showcase_static_item_stat" PRIMARY KEY ("item_id", "item_type"),
    CONSTRAINT "FK_showcase_static_item_stat" FOREIGN KEY ("item_id") REFERENCES "showcase_static_item" ("id") ON DELETE CASCADE
);

ALTER TABLE "showcase_static_item"
    DROP COLUMN IF EXISTS "item_id",
    DROP CONSTRAINT IF EXISTS "item_id_unique",
    ADD COLUMN "item_id" BIGINT,
    ADD COLUMN "item_type" INT4 NOT NULL DEFAULT 0,
    ADD CONSTRAINT "item_id_unique" UNIQUE ("item_id", "item_type")

--changeset radmir:showcase-stat-clear
DELETE FROM  "showcase_static_item";
DELETE FROM  "showcase_static_item_view";
