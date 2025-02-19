--liquibase formatted sql

--changeset lina:add-pinned
ALTER TABLE "user"
    ADD COLUMN "is_pinned" BOOLEAN DEFAULT FALSE;