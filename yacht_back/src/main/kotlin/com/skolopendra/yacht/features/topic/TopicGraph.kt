package com.skolopendra.yacht.features.topic

import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.lib.i18n.Locale
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.entity.nullSort
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.jooq.JoinType
import org.jooq.SortOrder
import org.jooq.impl.DSL
import org.springframework.stereotype.Component
import java.sql.Timestamp

@Component
class TopicGraph(
        val dsl: DSLContext
) {
    fun get(forUser: Long?, sub: Boolean? = null, hidden: Boolean? = false): GraphQuery =
            TopicSchema.GRAPH.create(dsl, mapOf("user" to forUser, "sub" to sub, "hidden" to hidden))

    fun get(forUser: Long?, sub: Boolean?, hidden: Boolean? = false, fn: BuildingContext.() -> Unit): GraphQuery {
        val result = get(forUser, sub, hidden)
        setup(result, fn)
        return result
    }

    fun setup(graphQuery: GraphQuery, fn: BuildingContext.() -> Unit) {
        BuildingContext(graphQuery).apply(fn)
    }

    // Query manipulation

    fun withId(graphQuery: GraphQuery, id: Long) {
        graphQuery.where(Tables.TOPIC.ID.eq(id))
    }

    fun withIds(graphQuery: GraphQuery, ids: List<Long>) {
        graphQuery.where(Tables.TOPIC.ID.`in`(ids))
    }

    fun order(graphQuery: GraphQuery, order: TopicOrder, direction: SortOrder = SortOrder.DESC, locale: Locale, ratingAfter: Timestamp?, ratingBefore: Timestamp?) {


        val defaultSort = Tables.TOPIC.NAME.collate(locale.collation)

        val query = graphQuery.query

        when (order) {
            TopicOrder.NAME -> query.addOrderBy(defaultSort.sort(direction))
            TopicOrder.LAST_POST_TIME -> {
                val lastPostTime = DSL.max(Tables.ARTICLE.PUBLISHED_AT).`as`("last_post_time")
                val lastPost = DSL
                        .select(
                                Tables.ARTICLE_TOPIC.TOPIC_ID,
                                lastPostTime)
                        .from(Tables.ARTICLE_TOPIC)
                        .innerJoin(Tables.ARTICLE)
                        .on(
                                Tables.ARTICLE_TOPIC.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                                Tables.ARTICLE.isPublished())
                        .groupBy(Tables.ARTICLE_TOPIC.TOPIC_ID)
                        .asTable()
                val lastPostTopic = lastPost.field(Tables.ARTICLE_TOPIC.TOPIC_ID)
                query.addJoin(lastPost, JoinType.LEFT_OUTER_JOIN, Tables.TOPIC.ID.eq(lastPostTopic))
                query.addOrderBy(lastPostTime.nullSort(direction), defaultSort)
            }
            TopicOrder.POST_COUNT -> {
                val postCount = DSL.count().`as`("post_count")
                val postCountTable = DSL
                        .select(
                                Tables.ARTICLE_TOPIC.TOPIC_ID,
                                postCount)
                        .from(Tables.ARTICLE_TOPIC)
                        .innerJoin(Tables.ARTICLE)
                        .on(
                                Tables.ARTICLE_TOPIC.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                                Tables.ARTICLE.isPublished(),
                                Tables.ARTICLE_TOPIC.RANK.eq(1)
                        )
                        .groupBy(Tables.ARTICLE_TOPIC.TOPIC_ID)
                        .asTable()
                query.addJoin(postCountTable, JoinType.JOIN, Tables.TOPIC.ID.eq(postCountTable.field(Tables.ARTICLE_TOPIC.TOPIC_ID)))
                query.addOrderBy(postCountTable.field(postCount)?.nullSort(direction), defaultSort)
            }
            TopicOrder.SUB_COUNT -> {
                // TODO: Subscriber count from graph
                val subCount = DSL
                        .select(DSL.count())
                        .from(Tables.TOPIC_SUBSCRIPTION)
                        .where(Tables.TOPIC_SUBSCRIPTION.TOPIC_ID.eq(Tables.TOPIC.ID))
                        .asField<Long>()
                query.addSelect(subCount)
                query.addOrderBy(subCount.nullSort(direction), defaultSort)
            }
            TopicOrder.RATING -> {
                val t = DSL.table("topic_rating_t(?, ?)", DSL.value(ratingAfter), DSL.value(ratingBefore)).`as`("rating")
                query.addJoin(t, DSL.field("rating.tid", Long::class.java).eq(Tables.TOPIC.ID), DSL.field("rating.count", Long::class.java).ne(0))
                query.addOrderBy(DSL.field("rating.score").nullSort(direction), defaultSort)
            }
        }
    }

    inner class BuildingContext(private val graphQuery: GraphQuery) {
        fun withId(id: Long) = this@TopicGraph.withId(graphQuery, id)

        fun withIds(ids: List<Long>) = this@TopicGraph.withIds(graphQuery, ids)

        fun order(order: TopicOrder, direction: SortOrder = SortOrder.DESC, locale: Locale, ratingAfter: Long?, ratingBefore: Long?) =
                this@TopicGraph.order(graphQuery, order, direction, locale, if (ratingAfter != null) Timestamp(ratingAfter) else null, if (ratingBefore != null) Timestamp(ratingBefore) else null)
    }
}
