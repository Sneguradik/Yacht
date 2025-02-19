--liquibase formatted sql

--changeset lina:advertisement
create table advertisement
(
    id                BIGSERIAL
        CONSTRAINT advertisement_pkey
            PRIMARY KEY,
    active            BOOLEAN NOT NULL            DEFAULT FALSE,
    after_publication BIGINT,
    clicks_count      INTEGER NOT NULL            DEFAULT 0,
    created_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    image             VARCHAR(255),
    place             INTEGER,
    place_type        INTEGER,
    published_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    rotation          DOUBLE PRECISION,
    start             TIMESTAMP,
    stop              BIGINT,
    updated_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    url               VARCHAR(255),
    views_count       INTEGER NOT NULL
);

--changeset lina:advertisement-fix
alter table advertisement
    add column "name"              VARCHAR(255),
    add column "text"              VARCHAR(255),
    add column "start_date_time"   TIMESTAMP,
    add column "stop_date_time"    TIMESTAMP,
    add column "start_views_time"  TIMESTAMP,
    add column "stop_views_count"  BIGINT,
    add column "start_clicks_time" TIMESTAMP,
    add column "stop_clicks_count" BIGINT,
    drop column start,
    drop column stop,
    drop column published_at;

--changeset lina:advertisement-from-image-to-picture
alter table advertisement
    rename column image to picture;