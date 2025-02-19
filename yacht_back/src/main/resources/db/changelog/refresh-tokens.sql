--liquibase formatted sql

--changeset we2beast:refresh-tokens
create table refresh_tokens
(
    id            bigserial not null
        constraint refresh_tokens_pkey
            primary key,
    created_at    timestamp,
    refresh_token text,
    updated_at    timestamp,
    user_id       bigint
        constraint FK_refresh_token__user
            references "user"
);
