--liquibase formatted sql

--changeset victoria:ranking-config
CREATE TABLE "ranking_config"
(
    "id"    VARCHAR(64) PRIMARY KEY,
    "value" REAL DEFAULT 1.0
);

INSERT INTO "ranking_config"("id", "value")
VALUES ('ranking.vote-up', 5.0),
       ('ranking.vote-down', 0.0),
       ('ranking.view', 2.0),
       ('ranking.bookmark', 15.0),
       ('ranking.comment', 8.0),
       ('ranking.share', 0.0);

--changeset lina:ranking-jobsEvents
INSERT INTO "ranking_config"(id, value)
VALUES ('ranking.jobsEvents.feed.jobs', 1.0),
       ('ranking.jobsEvents.feed.events', 0.0),

       ('ranking.jobsEvents.publications.jobs', 1.0),
       ('ranking.jobsEvents.publications.events', 0.0),

       ('ranking.jobsEvents.popular.jobs', 1.0),
       ('ranking.jobsEvents.popular.events', 0.0),

       ('ranking.jobsEvents.publicationsBottom', 0.0),

       ('ranking.jobsEvents.firstView.jobs', 0.0),
       ('ranking.jobsEvents.firstView.events', 0.0),

       ('ranking.jobsEvents.secondView.jobs', 0.0),
       ('ranking.jobsEvents.secondView.events', 0.0),

       ('ranking.jobsEvents.thirdView.jobs', 0.0),
       ('ranking.jobsEvents.thirdView.events', 0.0);

--changeset lina:ranking-expansion
INSERT INTO "ranking_config"(id, value)
VALUES ('ranking.factor1', 0.0),
       ('ranking.factor2', 0.0),
       ('ranking.days', 0.0),
       ('ranking.divider', 0.0),
       ('ranking.userMethod', 0.0)