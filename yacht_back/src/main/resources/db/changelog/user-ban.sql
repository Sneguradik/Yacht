--liquibase formatted sql

--changeset victoria:user-ban
ALTER TABLE "user"
    ADD COLUMN "is_banned" BOOLEAN NOT NULL DEFAULT FALSE;
