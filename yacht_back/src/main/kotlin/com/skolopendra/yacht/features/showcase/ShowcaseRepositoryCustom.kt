package com.skolopendra.yacht.features.showcase

import com.fasterxml.jackson.databind.ObjectMapper
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.lib.graph.StoredJoin
import com.skolopendra.lib.graph.Graph
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.article.ArticleNonUniqueViewRepository
import com.skolopendra.yacht.features.article.ArticleRepository
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.jooq.JoinType
import org.jooq.impl.DSL
import org.springframework.stereotype.Repository

@Repository
class ShowcaseRepositoryCustom(
        private val dsl: DSLContext
) {
    companion object {
        private val GRAPH = (Graph on Tables.SHOWCASE_STATIC_ITEM) {
            val s = Tables.SHOWCASE_STATIC_ITEM
            val v = Tables.SHOWCASE_STATIC_ITEM_VIEW
            val t = Tables.SHOWCASE_STATIC_ITEM_STAT
            val viewsJoin = StoredJoin(t, JoinType.LEFT_OUTER_JOIN, Tables.SHOWCASE_STATIC_ITEM_STAT.ITEM_ID.eq(s.ID))

            "meta" embed {
                "id" from s.ID
                "createdAt" from s.CREATED_AT
                "updatedAt" from s.UPDATED_AT
            }
            "status" embed {
                "publicationStage" from s.PUBLICATION_STAGE
                "publishedAt" from s.PUBLISHED_AT
            }
            "info" embed {
                "duration" from s.DURATION
                "cover" from s.COVER
                "subtitle" from s.SUBTITLE
                "title" from s.TITLE
                "url" from s.URL
                "options" embed {
                    "postCount" from (Tables.SHOWCASE_STATIC_ITEM_STAT.POSTS_COUNT using viewsJoin  mapNull { views: Long? -> views ?: 0L})
                    "subCount" from (Tables.SHOWCASE_STATIC_ITEM_STAT.SUBSCRIBERS_COUNT using viewsJoin mapNull { views: Long? -> views ?: 0L})
                    "viewCount" from (Tables.SHOWCASE_STATIC_ITEM_STAT.VIEWS_COUNT using viewsJoin mapNull { views: Long? -> views ?: 0L})
                }
            }
            "views" embed {
                "count" counts (v.where(v.ITEM_ID.eq(s.ID)))
                "you" by { user: Long? ->
                    if (user == null) nil()
                    else DSL.field(v.ITEM_ID.isNotNull) using StoredJoin(v, JoinType.LEFT_OUTER_JOIN, v.ITEM_ID.eq(s.ID), v.USER_ID.eq(user))
                }
            }

        }
    }

    fun graph(forUser: Long?): GraphQuery =
            GRAPH.create(dsl, mapOf("user" to forUser))

    fun all(forUser: Long?): GraphQuery =
            graph(forUser).apply {
                query.addOrderBy(Tables.SHOWCASE_STATIC_ITEM.PUBLISHED_AT.desc())
            }

    fun public(forUser: Long?): GraphQuery =
            all(forUser).apply {
                query.addConditions(Tables.SHOWCASE_STATIC_ITEM.PUBLICATION_STAGE.eq(Publication.Stage.PUBLISHED.ordinal))
            }
}
