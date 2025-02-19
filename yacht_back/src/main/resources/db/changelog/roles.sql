--liquibase formatted sql

--changeset victoria:roles-update
UPDATE "role" SET "name" = 'ROLE_USER' WHERE "name" = 'USER';
UPDATE "role" SET "name" = 'ROLE_SUPERUSER' WHERE "name" = 'ADMIN';
UPDATE "role" SET "name" = 'ROLE_EDITOR' WHERE "name" = 'EDITOR';

--changeset victoria:drop-privilege
DROP TABLE "role_privilege";
DROP TABLE "privilege";

--changeset victoria:role-name-pk
ALTER TABLE "user_role"
    ADD COLUMN "role_name" VARCHAR NOT NULL DEFAULT '',
    DROP CONSTRAINT "fka68196081fvovjhkek5m97n3y";

UPDATE "user_role" SET "role_name" = (SELECT "name" FROM "role" WHERE "role"."id" = "role_id") WHERE TRUE;

ALTER TABLE "role"
    DROP CONSTRAINT "role_pkey";

DROP INDEX IF EXISTS "role_pkey";

ALTER TABLE "role"
    ADD CONSTRAINT "role_pkey" PRIMARY KEY ("name");

ALTER TABLE "role"
    DROP COLUMN "id";

ALTER TABLE "user_role"
    ADD CONSTRAINT "FK_user_role_name" FOREIGN KEY ("role_name") REFERENCES "role" ("name");

ALTER TABLE "user_role"
    DROP COLUMN "role_id";

--changeset radmir:roles-update-delete-editor-corrector
update user_role
set role_name='ROLE_PRIVILEGED_USER'
where 1 = 1
  and role_name in (
    select name
    from role
    where name = 'ROLE_EDITOR'
       or name = 'ROLE_CORRECTOR')
  and user_id not in (
    select user_id
    from role
    where name = 'ROLE_PRIVILEGED_USER'
);

delete
from user_role
where role_name in (
    select name
    from role
    where name = 'ROLE_EDITOR'
       or name = 'ROLE_CORRECTOR');

delete
from role
where name in (
    select name
    from role
    where name = 'ROLE_EDITOR'
       or name = 'ROLE_CORRECTOR'
);


--changeset radmir:roles-delete-editor
delete
from role
where name='ROLE_EDITOR'
