--liquibase formatted sql

--changeset victoria:cleanup
DROP TABLE "article_feed_view";
DROP TABLE "company_subscription";
DROP TABLE "company";
DROP TABLE "image";
