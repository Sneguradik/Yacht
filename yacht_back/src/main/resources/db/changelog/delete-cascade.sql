--liquibase formatted sql

--changeset victoria:article-promotions-cascades
ALTER TABLE "article_promotion_list_item"
    DROP CONSTRAINT "article_promotion_list_item_article_id_fkey",
    ADD CONSTRAINT "FK_article_promotion_list_item__article" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE;

--changeset victoria:comment-cascades
ALTER TABLE "comment_vote"
    DROP CONSTRAINT "fksuhgx7catnt6chnndede0wmpr",
    ADD CONSTRAINT "FK_comment_vote__comment" FOREIGN KEY ("comment_id") REFERENCES "comment" ("id") ON DELETE CASCADE;

--changeset victoria:article-cascades
ALTER TABLE "article_stats"
    DROP CONSTRAINT "fk36qonrmlgpbp711s51q5gejc",
    ADD CONSTRAINT "FK_article_stats" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE;
ALTER TABLE "article_vote"
    DROP CONSTRAINT "fkp8bfgu7gea52k8sa6smpj4fni",
    ADD CONSTRAINT "FK_article_vote__article" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE;
ALTER TABLE "article_tag"
    DROP CONSTRAINT "fkenqeees0y8hkm7x1p1ittuuye",
    ADD CONSTRAINT "FK_article_tag__article" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE;
ALTER TABLE "comment"
    DROP CONSTRAINT "fk5yx0uphgjc6ik6hb82kkw501y",
    ADD CONSTRAINT "FK_comment__article" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE;
ALTER TABLE "article_topic"
    DROP CONSTRAINT "fkfxrcs5lleexad7yxr8ihefw7e",
    ADD CONSTRAINT "FK_article_topic__article" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE;
ALTER TABLE "article_hide"
    DROP CONSTRAINT "fkidkwh97wobigaqxtjlar3pke",
    ADD CONSTRAINT "FK_article_hide__article" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE;
ALTER TABLE "bookmark"
    DROP CONSTRAINT "fkcow5ux3yhmj8uwu36so5928gp",
    ADD CONSTRAINT "FK_bookmark__article" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE;
ALTER TABLE "article_view"
    DROP CONSTRAINT "fk3p313775eqlibwt11mvbqv5sn",
    ADD CONSTRAINT "FK_article_view__article" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE;
ALTER TABLE "front_page_story"
    DROP CONSTRAINT "fk2jmismoke9imuakt3avulbk7t",
    ADD CONSTRAINT "FK_front_page_story__article" FOREIGN KEY ("article_id") REFERENCES "article" ("id") ON DELETE CASCADE;

--changeset victoria:user-cascades
ALTER TABLE "user_role"
    DROP CONSTRAINT "fkfgsgxvihks805qcq8sq26ab7c",
    ADD CONSTRAINT "FK_user_role__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "article"
    DROP CONSTRAINT "fkb70m3e0cghmyrbgn8i17k7l1f",
    ADD CONSTRAINT "FK_article__user" FOREIGN KEY ("author_id") REFERENCES "user" ("id") ON DELETE CASCADE;
ALTER TABLE "comment"
    DROP CONSTRAINT "fkrhy3r0t23ktix2xv13vri24n3",
    ADD CONSTRAINT "FK_comment__author" FOREIGN KEY ("author_id") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "company_membership"
    DROP CONSTRAINT "FK_company_membership_user",
    DROP CONSTRAINT "FK_company_membership_company",
    ADD CONSTRAINT "FK_company_membership__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    ADD CONSTRAINT "FK_company_membership__company" FOREIGN KEY ("company_id") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "author_subscription"
    DROP CONSTRAINT "fk69goat148t5t6hgomg0dh48ij",
    DROP CONSTRAINT "fkianfxav39rmkyrcx3dcato10d",
    ADD CONSTRAINT "FK_author_subscription__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
    ADD CONSTRAINT "FK_author_subscription__author" FOREIGN KEY ("author_id") REFERENCES "user" ("id") ON DELETE CASCADE;
ALTER TABLE "topic_subscription"
    DROP CONSTRAINT "fki91x9vn28ob2aarq7pn246a21",
    ADD CONSTRAINT "FK_topic_subscription__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "bookmark"
    DROP CONSTRAINT "fk7t914nw3c53vqq3tqnptg0flc",
    ADD CONSTRAINT "FK_bookmark__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;
ALTER TABLE "article_hide"
    DROP CONSTRAINT "fkhiq6lq6wi5rug5vwp1p6laxwl",
    ADD CONSTRAINT "FK_article_hide__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;
ALTER TABLE "article_view"
    DROP CONSTRAINT "fk7oku4a3kfn4sbb0acie5l3k9k",
    ADD CONSTRAINT "FK_article_view__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "notification"
    DROP CONSTRAINT "FK_notification_target",
    ADD CONSTRAINT "FK_notification__target" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;
ALTER TABLE "company_application"
    DROP CONSTRAINT "FK_company_application_company",
    ADD CONSTRAINT "FK_company_application__company" FOREIGN KEY ("company_id") REFERENCES "user" ("id") ON DELETE CASCADE;

ALTER TABLE "article_vote"
    DROP CONSTRAINT "fkpb14naeynlocrj8868wlq14nw",
    ADD CONSTRAINT "FK_article_vote__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;
ALTER TABLE "comment_vote"
    DROP CONSTRAINT "fk8fabofq2cq2s0v1qxej0g51l4",
    ADD CONSTRAINT "FK_comment_vote__user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE;
