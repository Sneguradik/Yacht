package com.skolopendra.yacht.features.article.comment

import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.lib.graph.StoredJoin
import com.skolopendra.lib.graph.Graph
import com.skolopendra.yacht.features.user.UserSchema
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.jooq.JoinType
import org.jooq.impl.DSL
import org.springframework.stereotype.Component

@Component
class CommentSchema(
        val dsl: DSLContext
) {
    companion object {
        val GRAPH = (Graph on Tables.COMMENT) {
            val c = Tables.COMMENT
            val cv = Tables.COMMENT_VOTE
            val authorJoin = StoredJoin(Tables.USER, JoinType.JOIN, Tables.USER.ID.eq(c.AUTHOR_ID))
            val pc = Tables.COMMENT.`as`("parent_comment")
            val parentJoin = StoredJoin(pc, JoinType.LEFT_OUTER_JOIN, pc.ID.eq(c.PARENT_COMMENT_ID))
            val pa = Tables.USER.`as`("parent_comment_author")
            val parentAuthorJoin = StoredJoin(pa, JoinType.LEFT_OUTER_JOIN, pa.ID.eq(pc.AUTHOR_ID))
            val cx = Tables.ARTICLE
            val contextJoin = StoredJoin(cx, JoinType.JOIN, cx.ID.eq(c.ARTICLE_ID))
            val cw = Tables.COMMENT_WATCH

            "meta" embed {
                "id" from c.ID
                "createdAt" from c.CREATED_AT
                "updatedAt" from c.UPDATED_AT
                "deletedAt" from c.DELETED_AT
            }
            "watch" by { user: Long? -> if (user == null) nil() else jooq(DSL.field(cw.USER_ID.isNotNull)) using StoredJoin(cw, JoinType.LEFT_OUTER_JOIN, cw.COMMENT_ID.eq(c.ID), cw.USER_ID.eq(user)) }
            "votes" embed {
                "up" counts cv.where(cv.COMMENT_ID.eq(c.ID), cv.VALUE.eq(1))
                "down" counts cv.where(cv.COMMENT_ID.eq(c.ID), cv.VALUE.eq(-1))
                "you" by { user: Long? -> if (user == null) nil() else jooq(cv.VALUE) using StoredJoin(cv, JoinType.LEFT_OUTER_JOIN, cv.COMMENT_ID.eq(c.ID), cv.USER_ID.eq(user)) }
            }
            "owner" from (UserSchema.GRAPH using authorJoin)
            "html" from c.RENDERED_HTML
            // TODO: Recursion
            "parent" from (subgraph {
                "meta" embed {
                    "id" from pc.ID
                    "createdAt" from pc.CREATED_AT
                    "updatedAt" from pc.UPDATED_AT
                }
                "owner" from (subgraph {
                    "meta" embed {
                        "id" from pa.ID
                        "createdAt" from pa.CREATED_AT
                        "updatedAt" from pa.UPDATED_AT
                    }
                    "info" embed {
                        "firstName" from pa.FIRST_NAME
                        "lastName" from pa.LAST_NAME
                        "username" from pa.USERNAME
                        "picture" from pa.PROFILE_PICTURE_URL
                        "bio" from pa.BIO
                        "company" embed {
                            "confirmed" from pa.COMPANY_CONFIRMED
                            "isCompany" from pa.IS_COMPANY
                            "name" from pa.COMPANY_NAME
                        }
                    }
                } using parentAuthorJoin)
            } using parentJoin)
            "context" from (subgraph {
                "meta" embed {
                    "id" from cx.ID
                    "createdAt" from cx.CREATED_AT
                    "updatedAt" from cx.UPDATED_AT
                }
                "title" from cx.TITLE
            } using contextJoin)
        }
    }

    fun graph(forUser: Long?): GraphQuery =
            GRAPH.create(dsl, mapOf("user" to forUser))
}
