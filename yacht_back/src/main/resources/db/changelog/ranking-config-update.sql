--liquibase formatted sql

--changeset lina:ranking-fix-config
UPDATE ranking_config
SET value = 1
WHERE id LIKE 'ranking.divider';