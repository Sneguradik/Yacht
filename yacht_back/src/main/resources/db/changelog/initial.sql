--liquibase formatted sql

--changeset victoria:master
CREATE TABLE hibernate_sequences
(
    sequence_name VARCHAR(255) NOT NULL,
    next_val      BIGINT,
    CONSTRAINT hibernate_sequences_pkey PRIMARY KEY (sequence_name)
);

CREATE TABLE role
(
    id   BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    name VARCHAR(255),
    CONSTRAINT role_pkey PRIMARY KEY (id)
);

CREATE TABLE privilege
(
    id   BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    name VARCHAR(255),
    CONSTRAINT privilege_pkey PRIMARY KEY (id)
);

CREATE TABLE role_privilege
(
    role_id      BIGINT NOT NULL,
    privilege_id BIGINT NOT NULL,
    CONSTRAINT fkdkwbrwb5r8h74m1v7dqmhp99c FOREIGN KEY (privilege_id) REFERENCES privilege (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fksykrtrdngu5iexmbti7lu9xa FOREIGN KEY (role_id) REFERENCES role (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE tag
(
    id      BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    content VARCHAR(255),
    CONSTRAINT tag_pkey PRIMARY KEY (id)
);

CREATE TABLE content_attribute
(
    id        BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    image     VARCHAR(255),
    name      VARCHAR(255),
    type      INTEGER,
    parent_id BIGINT,
    CONSTRAINT content_attribute_pkey PRIMARY KEY (id),
    CONSTRAINT fkmqi4jljf93y8wdx7wh49b61xw FOREIGN KEY (parent_id) REFERENCES content_attribute (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE "user"
(
    id                  BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    email               VARCHAR(255),
    first_name          VARCHAR(255),
    last_name           VARCHAR(255),
    origin              INTEGER,
    password            VARCHAR(255),
    profile_picture_url VARCHAR(255),
    service_id          VARCHAR(255),
    username            VARCHAR(255),
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT uk_ob8kqyqqgmefl0aco34akdtpe UNIQUE (email),
    CONSTRAINT uk_sb8bbouer5wak8vyiiy4pf2bx UNIQUE (username)
);

CREATE TABLE user_role
(
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    CONSTRAINT fka68196081fvovjhkek5m97n3y FOREIGN KEY (role_id) REFERENCES role (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fkfgsgxvihks805qcq8sq26ab7c FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE article
(
    id                 BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    created_at         TIMESTAMP WITHOUT TIME ZONE,
    updated_at         TIMESTAMP WITHOUT TIME ZONE,
    editable_data      TEXT,
    published_at       TIMESTAMP WITHOUT TIME ZONE,
    summary            TEXT,
    published          BOOLEAN                                 NOT NULL,
    rendered_html      TEXT,
    rendered_text_only TEXT,
    cover              VARCHAR(255),
    title              VARCHAR(255),
    author_id          BIGINT                                  NOT NULL,
    fixed              BOOLEAN DEFAULT FALSE,
    CONSTRAINT article_pkey PRIMARY KEY (id),
    CONSTRAINT fkb70m3e0cghmyrbgn8i17k7l1f FOREIGN KEY (author_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE comment
(
    id                BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    created_at        TIMESTAMP WITHOUT TIME ZONE,
    updated_at        TIMESTAMP WITHOUT TIME ZONE,
    editable_data     TEXT,
    rendered_html     TEXT,
    author_id         BIGINT                                  NOT NULL,
    article_id        BIGINT,
    parent_comment_id BIGINT,
    CONSTRAINT comment_pkey PRIMARY KEY (id),
    CONSTRAINT fkrhy3r0t23ktix2xv13vri24n3 FOREIGN KEY (author_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fk5yx0uphgjc6ik6hb82kkw501y FOREIGN KEY (article_id) REFERENCES article (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fkhvh0e2ybgg16bpu229a5teje7 FOREIGN KEY (parent_comment_id) REFERENCES comment (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE front_page_story
(
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    article_id BIGINT NOT NULL,
    CONSTRAINT front_page_story_pkey PRIMARY KEY (article_id),
    CONSTRAINT fk2jmismoke9imuakt3avulbk7t FOREIGN KEY (article_id) REFERENCES article (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE article_view
(
    id          BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    fingerprint VARCHAR(255),
    article_id  BIGINT                                  NOT NULL,
    user_id     BIGINT,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT article_view_pkey PRIMARY KEY (id),
    CONSTRAINT ukfumvb956rdn1bu4o0ou9i5vai UNIQUE (fingerprint, article_id),
    CONSTRAINT ukm3b56csqvggoal6egho7e2nc4 UNIQUE (user_id, article_id),
    CONSTRAINT fk7oku4a3kfn4sbb0acie5l3k9k FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fk3p313775eqlibwt11mvbqv5sn FOREIGN KEY (article_id) REFERENCES article (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE article_feed_view
(
    id          UUID   NOT NULL,
    fingerprint VARCHAR(255),
    article_id  BIGINT NOT NULL,
    user_id     BIGINT,
    CONSTRAINT article_feed_view_pkey PRIMARY KEY (id),
    CONSTRAINT uk1ogx6lgxxwrcqi2wt1t3g28c3 UNIQUE (fingerprint, article_id),
    CONSTRAINT uk6ytfi1ki1e1od65u9rv79f51k UNIQUE (user_id, article_id),
    CONSTRAINT fkkfbt7g4dsqvatuotroj1synny FOREIGN KEY (article_id) REFERENCES article (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fk7dxtxybuuvv6uhgbttykywlen FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE attribute_subscription
(
    id           UUID    NOT NULL,
    bad          BOOLEAN NOT NULL,
    user_id      BIGINT,
    attribute_id BIGINT,
    CONSTRAINT attribute_subscription_pkey PRIMARY KEY (id),
    CONSTRAINT fk8hlt66b3cbwhwupxjiyq7rjcf FOREIGN KEY (attribute_id) REFERENCES content_attribute (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fki91x9vn28ob2aarq7pn246a21 FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE author_subscription
(
    id        UUID    NOT NULL,
    bad       BOOLEAN NOT NULL,
    user_id   BIGINT,
    author_id BIGINT,
    CONSTRAINT author_subscription_pkey PRIMARY KEY (id),
    CONSTRAINT fk69goat148t5t6hgomg0dh48ij FOREIGN KEY (author_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fkianfxav39rmkyrcx3dcato10d FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE bookmark
(
    id         BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    article_id BIGINT                                  NOT NULL,
    user_id    BIGINT                                  NOT NULL,
    CONSTRAINT bookmark_pkey PRIMARY KEY (id),
    CONSTRAINT ukligtowvobw28jya77md1d3jch UNIQUE (user_id, article_id),
    CONSTRAINT fkcow5ux3yhmj8uwu36so5928gp FOREIGN KEY (article_id) REFERENCES article (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fk7t914nw3c53vqq3tqnptg0flc FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE article_attribute
(
    article_id   BIGINT NOT NULL,
    attribute_id BIGINT NOT NULL,
    CONSTRAINT fkmdx5r8x61hllja2e1tlv8sho8 FOREIGN KEY (attribute_id) REFERENCES content_attribute (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fkfxrcs5lleexad7yxr8ihefw7e FOREIGN KEY (article_id) REFERENCES article (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE article_tag
(
    article_id BIGINT NOT NULL,
    tag_id     BIGINT NOT NULL,
    CONSTRAINT fkesqp7s9jj2wumlnhssbme5ule FOREIGN KEY (tag_id) REFERENCES tag (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fkenqeees0y8hkm7x1p1ittuuye FOREIGN KEY (article_id) REFERENCES article (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE article_vote
(
    id         BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    value      SMALLINT                                NOT NULL,
    user_id    BIGINT                                  NOT NULL,
    article_id BIGINT                                  NOT NULL,
    CONSTRAINT article_vote_pkey PRIMARY KEY (id),
    CONSTRAINT ukkqx46nbh2m64dam5ja3rxu130 UNIQUE (user_id, article_id),
    CONSTRAINT fkp8bfgu7gea52k8sa6smpj4fni FOREIGN KEY (article_id) REFERENCES article (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fkpb14naeynlocrj8868wlq14nw FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE article_stats
(
    bookmarks               BIGINT NOT NULL,
    calculated_score        FLOAT8 NOT NULL,
    comments                BIGINT NOT NULL,
    feed_views              BIGINT NOT NULL,
    reactions               BIGINT NOT NULL,
    score                   BIGINT NOT NULL,
    unique_users_commenting BIGINT NOT NULL,
    views                   BIGINT NOT NULL,
    article_id              BIGINT NOT NULL,
    CONSTRAINT article_stats_pkey PRIMARY KEY (article_id),
    CONSTRAINT fk36qonrmlgpbp711s51q5gejc FOREIGN KEY (article_id) REFERENCES article (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE image
(
    id          BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    url         VARCHAR(255),
    uploaded_by BIGINT,
    CONSTRAINT image_pkey PRIMARY KEY (id),
    CONSTRAINT fko3jualgxgi59r0shtfrbf616d FOREIGN KEY (uploaded_by) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE article_hide
(
    id         UUID   NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    article_id BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    CONSTRAINT article_hide_pkey PRIMARY KEY (id),
    CONSTRAINT fkidkwh97wobigaqxtjlar3pke FOREIGN KEY (article_id) REFERENCES article (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT ukmi2kb06t7ssfw7imehrbvjs2j UNIQUE (user_id, article_id),
    CONSTRAINT fkhiq6lq6wi5rug5vwp1p6laxwl FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE comment_vote
(
    id         BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    value      SMALLINT                                NOT NULL,
    user_id    BIGINT                                  NOT NULL,
    comment_id BIGINT                                  NOT NULL,
    CONSTRAINT comment_vote_pkey PRIMARY KEY (id),
    CONSTRAINT ukgybr5lhrhiq6u5dsc1hv9fhu9 UNIQUE (user_id, comment_id),
    CONSTRAINT fksuhgx7catnt6chnndede0wmpr FOREIGN KEY (comment_id) REFERENCES comment (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fk8fabofq2cq2s0v1qxej0g51l4 FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE company
(
    created_at            TIMESTAMP WITHOUT TIME ZONE,
    description           TEXT,
    logo                  TEXT,
    name                  VARCHAR(255),
    private_contact_email VARCHAR(255),
    public_contact_email  VARCHAR(255),
    updated_at            TIMESTAMP WITHOUT TIME ZONE,
    verified              BOOLEAN NOT NULL,
    website               TEXT,
    owner_id              BIGINT  NOT NULL,
    CONSTRAINT company_pkey PRIMARY KEY (owner_id),
    CONSTRAINT fk96xcwqm155w5ivvwiqgfodhue FOREIGN KEY (owner_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE company_subscription
(
    id         UUID    NOT NULL,
    bad        BOOLEAN NOT NULL,
    user_id    BIGINT,
    company_id BIGINT,
    CONSTRAINT company_subscription_pkey PRIMARY KEY (id),
    CONSTRAINT fkruycimsxxjkjw6sxl30i8dgwr FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fkb6ftcva71bffj1ao5h2x8a4j9 FOREIGN KEY (company_id) REFERENCES company (owner_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE company_application
(
    id               BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    created_at       TIMESTAMP WITHOUT TIME ZONE,
    message          TEXT,
    rejection_reason TEXT,
    status           INTEGER,
    updated_at       TIMESTAMP WITHOUT TIME ZONE,
    company_id       BIGINT                                  NOT NULL,
    CONSTRAINT company_application_pkey PRIMARY KEY (id),
    CONSTRAINT fkjp2w3o45g2iij6qbcyp5fdc79 FOREIGN KEY (company_id) REFERENCES company (owner_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE notification
(
    id         BIGINT  NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    seen       BOOLEAN NOT NULL,
    target_id  BIGINT,
    CONSTRAINT notification_pkey PRIMARY KEY (id),
    CONSTRAINT fk84pdex6eiqngsb7352cqrul8d FOREIGN KEY (target_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE comment_mention_notification
(
    id         BIGINT  NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    seen       BOOLEAN NOT NULL,
    target_id  BIGINT,
    comment_id BIGINT,
    CONSTRAINT comment_mention_notification_pkey PRIMARY KEY (id),
    CONSTRAINT fkrm1tfrrgsrg8t9f4oucc0cdt9 FOREIGN KEY (comment_id) REFERENCES comment (id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT fk_1vf8122ic9svlxu18poo9mvrs FOREIGN KEY (target_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE service_notification
(
    id           BIGINT  NOT NULL,
    created_at   TIMESTAMP WITHOUT TIME ZONE,
    seen         BOOLEAN NOT NULL,
    target_id    BIGINT,
    message_html VARCHAR(255),
    CONSTRAINT service_notification_pkey PRIMARY KEY (id),
    CONSTRAINT fk_g8yjpr0h0ym94jr87r6h6ib9o FOREIGN KEY (target_id) REFERENCES "user" (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

--changeset radmir:deleted-user
ALTER TABLE "user"
    ADD COLUMN "is_deleted" BOOLEAN DEFAULT false

--changeset radmir:last-login-user
ALTER TABLE "user"
    ADD COLUMN "last_login" TIMESTAMP WITHOUT TIME ZONE

