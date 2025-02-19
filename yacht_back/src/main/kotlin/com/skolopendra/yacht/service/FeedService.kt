package com.skolopendra.yacht.service

import com.skolopendra.yacht.jooq.Tables.*
import org.jooq.DSLContext
import org.jooq.Field
import org.jooq.impl.DSL.*
import org.springframework.stereotype.Service

@Service
class FeedService(
        val dsl: DSLContext
) {
    fun view(forUser: Long?): Field<Boolean> {
        return field(exists(selectOne().from(ARTICLE_VIEW).where(
                ARTICLE_VIEW.USER_ID.eq(forUser),
                ARTICLE_VIEW.ARTICLE_ID.eq(ARTICLE.ID))))
    }

    fun bookmark(forUser: Long?): Field<Boolean> {
        return field(exists(selectOne().from(BOOKMARK).where(
                BOOKMARK.USER_ID.eq(forUser),
                BOOKMARK.ARTICLE_ID.eq(ARTICLE.ID))))
    }

    fun vote(forUser: Long?): Field<Short> {
        return select(ARTICLE_VOTE.VALUE).from(ARTICLE_VOTE).where(
                ARTICLE_VOTE.USER_ID.eq(forUser),
                ARTICLE_VOTE.ARTICLE_ID.eq(ARTICLE.ID)).asField()
    }

}
