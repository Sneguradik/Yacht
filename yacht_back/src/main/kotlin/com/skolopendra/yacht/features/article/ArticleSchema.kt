package com.skolopendra.yacht.features.article

import com.skolopendra.lib.graph.StoredJoin
import com.skolopendra.lib.graph.Graph
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.user.UserSchema
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.util.joinType
import org.jooq.JoinType
import org.jooq.impl.DSL

class ArticleSchema {
    companion object {
        val GRAPH = (Graph on Tables.ARTICLE) {
            val tagTable = DSL.select(DSL.function("array_to_string", String::class.java,
                    DSL.arrayAgg(Tables.ARTICLE_TAG.TAG_ID).orderBy(Tables.ARTICLE_TAG.RANK), DSL.value(",")).`as`("tags_join"), Tables.ARTICLE_TAG.ARTICLE_ID.`as`("article_id")).from(Tables.ARTICLE_TAG).groupBy(Tables.ARTICLE_TAG.ARTICLE_ID)
            val tagJoin = StoredJoin(tagTable, JoinType.LEFT_OUTER_JOIN, checkNotNull(tagTable.field("article_id", Long::class.java)).eq(Tables.ARTICLE.ID))

            val topicTable = DSL.select(DSL.function("array_to_string", String::class.java,
                    DSL.arrayAgg(Tables.ARTICLE_TOPIC.TOPIC_ID).orderBy(Tables.ARTICLE_TOPIC.RANK), DSL.value(",")).`as`("topics_join"), Tables.ARTICLE_TOPIC.ARTICLE_ID.`as`("article_id")).from(Tables.ARTICLE_TOPIC).groupBy(Tables.ARTICLE_TOPIC.ARTICLE_ID)
            val topicJoin = StoredJoin(topicTable, JoinType.LEFT_OUTER_JOIN, checkNotNull(topicTable.field("article_id", Long::class.java)).eq(Tables.ARTICLE.ID))

            val authorJoin = StoredJoin(Tables.USER, JoinType.JOIN, Tables.ARTICLE.AUTHOR_ID.eq(Tables.USER.ID))
            val viewsJoin = StoredJoin(Tables.ARTICLE_NON_UNIQUE_VIEW, JoinType.LEFT_OUTER_JOIN, Tables.ARTICLE_NON_UNIQUE_VIEW.ARTICLE_ID.eq(Tables.ARTICLE.ID))

            val promotionListTable = DSL.select(DSL.function("array_to_string", String::class.java,
                    DSL.arrayAgg(Tables.ARTICLE_PROMOTION_LIST_ITEM.LIST_ID).orderBy(Tables.ARTICLE_PROMOTION_LIST_ITEM.LIST_ID),
                    DSL.value(",")).`as`("article_promotion_item_join"),
                    Tables.ARTICLE_PROMOTION_LIST_ITEM.ARTICLE_ID.`as`("article_id"))
                    .from(Tables.ARTICLE_PROMOTION_LIST_ITEM).groupBy(Tables.ARTICLE_PROMOTION_LIST_ITEM.ARTICLE_ID)

            val promotionListJoin = StoredJoin(promotionListTable, JoinType.LEFT_OUTER_JOIN,
                    checkNotNull(promotionListTable.field("article_id", Long::class.java)).eq(Tables.ARTICLE.ID))

            "meta" embed {
                "id" from Tables.ARTICLE.ID
                "createdAt" from Tables.ARTICLE.CREATED_AT
                "updatedAt" from Tables.ARTICLE.UPDATED_AT
            }
            "status" embed {
                "publicationStage" from (Tables.ARTICLE.PUBLICATION_STAGE enum Publication.Stage.values())
                "publishedAt" from Tables.ARTICLE.PUBLISHED_AT
            }
            "info" embed {
                "title" from Tables.ARTICLE.TITLE
                "cover" from Tables.ARTICLE.COVER
                "summary" from Tables.ARTICLE.SUMMARY
            }
            "votes" embed {
                "up" counts Tables.ARTICLE_VOTE.where(Tables.ARTICLE_VOTE.ARTICLE_ID.eq(Tables.ARTICLE.ID), Tables.ARTICLE_VOTE.VALUE.eq(1))
                "down" counts Tables.ARTICLE_VOTE.where(Tables.ARTICLE_VOTE.ARTICLE_ID.eq(Tables.ARTICLE.ID), Tables.ARTICLE_VOTE.VALUE.eq(-1))
                "you" by { user: Long? ->
                    if (user == null) nil() else
                        jooq(Tables.ARTICLE_VOTE.VALUE) using StoredJoin(Tables.ARTICLE_VOTE, JoinType.LEFT_OUTER_JOIN, Tables.ARTICLE_VOTE.ARTICLE_ID.eq(Tables.ARTICLE.ID), Tables.ARTICLE_VOTE.USER_ID.eq(user))
                }
            }
            "bookmarks" embed {
                "count" counts Tables.BOOKMARK.where(Tables.BOOKMARK.ARTICLE_ID.eq(Tables.ARTICLE.ID))
                "you" by { user: Long? ->
                    if (user == null) nil() else
                        jooq(DSL.field(Tables.BOOKMARK.ID.isNotNull)) using StoredJoin(Tables.BOOKMARK, JoinType.LEFT_OUTER_JOIN, Tables.BOOKMARK.ARTICLE_ID.eq(Tables.ARTICLE.ID), Tables.BOOKMARK.USER_ID.eq(user))
                }
            }
            "views" embed {
                "count" from (Tables.ARTICLE_NON_UNIQUE_VIEW.VIEWS_COUNT using viewsJoin mapNull { views: Int? -> views ?: 0})
                "you" by { user: Long? ->
                    if (user == null) nil() else
                        jooq(DSL.field(Tables.ARTICLE_VIEW.ID.isNotNull)) using StoredJoin(Tables.ARTICLE_VIEW, JoinType.LEFT_OUTER_JOIN, Tables.ARTICLE_VIEW.ARTICLE_ID.eq(Tables.ARTICLE.ID), Tables.ARTICLE_VIEW.USER_ID.eq(user))
                }
            }
            "commentCount" counts Tables.COMMENT.where(Tables.COMMENT.ARTICLE_ID.eq(Tables.ARTICLE.ID).and(Tables.COMMENT.DELETED_AT.isNull))
            "authorId" from Tables.ARTICLE.AUTHOR_ID
            "author" from (UserSchema.GRAPH using authorJoin)
            "source" from Tables.ARTICLE.EDITABLE_DATA
            "html" from Tables.ARTICLE.RENDERED_HTML
            "promotions" embed {
                "default" from (checkNotNull(promotionListTable.field("article_promotion_item_join")) using promotionListJoin mapNull { v: String? ->
                    v?.split(',')?.contains("default") ?: false
                })

                "lists" from (checkNotNull(promotionListTable.field("article_promotion_item_join")) using promotionListJoin mapNull { v: String? ->
                    v?.split(',')?.map { it }
                            ?: emptyList()
                })
            }
            "tags" from (checkNotNull(tagTable.field("tags_join")) using tagJoin mapNull { v: String? ->
                v?.split(',')?.map { it.toLong() }
                        ?: emptyList()
            })
            "topics" from (checkNotNull(topicTable.field("topics_join")) using topicJoin mapNull { v: String? ->
                v?.split(',')?.map { it.toLong() }
                        ?: emptyList()
            })
            "pinned" from Tables.ARTICLE.PINNED
            "isEdited" from Tables.ARTICLE.IS_EDITED
            "hidden" by { user: Long?, hidden: Boolean? ->
                if (user == null)
                    nil()
                else
                    (if (hidden != null) const(hidden) else jooq(DSL.field(Tables.ARTICLE_HIDE.USER_ID.isNotNull))) using StoredJoin(Tables.ARTICLE_HIDE, joinType(hidden), Tables.ARTICLE_HIDE.ARTICLE_ID.eq(Tables.ARTICLE.ID), Tables.ARTICLE_HIDE.USER_ID.eq(user))
            }
        }
    }
}
