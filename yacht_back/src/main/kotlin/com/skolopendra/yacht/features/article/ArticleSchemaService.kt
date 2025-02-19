package com.skolopendra.yacht.features.article

import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.lib.i18n.Locale
import com.skolopendra.yacht.entity.getSortOrder
import com.skolopendra.yacht.entity.nullSort
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.util.joinType
import org.jooq.Condition
import org.jooq.DSLContext
import org.jooq.JoinType
import org.jooq.SortOrder
import org.jooq.impl.DSL
import org.jooq.impl.DSL.select
import org.springframework.stereotype.Service
import java.sql.Timestamp

@Service
class ArticleSchemaService(
        val dsl: DSLContext
) {
    fun graph(forUser: Long?, hidden: Boolean? = false): GraphQuery =
            ArticleSchema.GRAPH.create(dsl, mapOf("user" to forUser, "hidden" to hidden))

    fun setup(graphQuery: GraphQuery, fn: SchemaSetupContext.() -> Unit) {
        SchemaSetupContext(graphQuery).apply(fn)
    }

    // Methods

    fun withId(graphQuery: GraphQuery, id: Long) =
            graphQuery.where(Tables.ARTICLE.ID.eq(id))

    fun withCompany(graphQuery: GraphQuery, company: Boolean) =
            graphQuery.where(Tables.USER.IS_COMPANY.eq(company))

    fun withAuthor(graphQuery: GraphQuery, author: Long) =
            graphQuery.where(Tables.ARTICLE.AUTHOR_ID.eq(author))

    fun after(graphQuery: GraphQuery, timestamp: Long) =
            graphQuery.where(Tables.ARTICLE.PUBLISHED_AT.ge(Timestamp(timestamp).toLocalDateTime()))

    fun after(graphQuery: GraphQuery, timestamp: Timestamp) =
        graphQuery.where(Tables.ARTICLE.PUBLISHED_AT.ge(timestamp.toLocalDateTime()))

    fun before(graphQuery: GraphQuery, timestamp: Long) =
            graphQuery.where(Tables.ARTICLE.PUBLISHED_AT.le(Timestamp(timestamp).toLocalDateTime()))

    fun withTopic(graphQuery: GraphQuery, topic: Long) =
            graphQuery.query.addJoin(
                    Tables.ARTICLE_TOPIC,
                    JoinType.LEFT_SEMI_JOIN,
                    Tables.ARTICLE_TOPIC.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                    Tables.ARTICLE_TOPIC.TOPIC_ID.eq(topic))

    fun withTag(graphQuery: GraphQuery, tag: Long) =
            graphQuery.query.addJoin(
                    Tables.ARTICLE_TAG,
                    JoinType.LEFT_SEMI_JOIN,
                    Tables.ARTICLE_TAG.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                    Tables.ARTICLE_TAG.TAG_ID.eq(tag))

    fun bookmarkedBy(graphQuery: GraphQuery, value: Boolean, user: Long) =
            graphQuery.query.addJoin(
                    Tables.BOOKMARK,
                    joinType(value),
                    Tables.BOOKMARK.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                    Tables.BOOKMARK.USER_ID.eq(user))

    fun inList(graphQuery: GraphQuery, list: String) =
            graphQuery.query.addJoin(
                    Tables.ARTICLE_PROMOTION_LIST_ITEM,
                    JoinType.LEFT_SEMI_JOIN,
                    Tables.ARTICLE_PROMOTION_LIST_ITEM.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                    Tables.ARTICLE_PROMOTION_LIST_ITEM.LIST_ID.eq(list))

    fun wasSeen(graphQuery: GraphQuery, user: Long, seen: Boolean?) {
        graphQuery.query.addJoin(
                Tables.ARTICLE_VIEW,
                joinType(seen),
                Tables.ARTICLE_VIEW.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                Tables.ARTICLE_VIEW.USER_ID.eq(user))

        graphQuery.query.addJoin(
                Tables.ARTICLE_NON_UNIQUE_VIEW,
                joinType(seen),
                Tables.ARTICLE_NON_UNIQUE_VIEW.ARTICLE_ID.eq(Tables.ARTICLE.ID))
    }

    fun withStage(graphQuery: GraphQuery, stage: Set<Publication.Stage>, user: Long?, canReview: Boolean, canPeekDraft: Boolean) {
        val isOwner = if (user != null) Tables.ARTICLE.AUTHOR_ID.eq(user) else DSL.falseCondition()
        val variants = stage.map {
            DSL.and(Tables.ARTICLE.PUBLICATION_STAGE.eq(it.ordinal), *when (it) {
                Publication.Stage.PUBLISHED -> emptyArray()
                Publication.Stage.REVIEWING,
                Publication.Stage.BLOCKED -> if (canReview) emptyArray<Condition>() else arrayOf(isOwner)
                Publication.Stage.DRAFT -> if (canPeekDraft) emptyArray<Condition>() else arrayOf(isOwner)
            })
        }.toTypedArray()
        graphQuery.query.addConditions(DSL.or(*variants))
    }

    fun filterSubscription(graphQuery: GraphQuery, user: Long, filters: Set<SubscriptionFilter>) {
        filters.map {
            when (it) {
                SubscriptionFilter.AUTHOR ->
                    DSL.exists(DSL.selectOne().from(Tables.AUTHOR_SUBSCRIPTION)
                            .where(
                                    Tables.AUTHOR_SUBSCRIPTION.USER_ID.eq(user),
                                    Tables.AUTHOR_SUBSCRIPTION.AUTHOR_ID.eq(Tables.ARTICLE.AUTHOR_ID)
                            ))
                SubscriptionFilter.TOPIC ->
                    DSL.exists(DSL.selectOne().from(Tables.ARTICLE_TOPIC
                            .innerJoin(Tables.TOPIC_SUBSCRIPTION)
                            .on(
                                    Tables.TOPIC_SUBSCRIPTION.TOPIC_ID.eq(Tables.ARTICLE_TOPIC.TOPIC_ID),
                                    Tables.TOPIC_SUBSCRIPTION.USER_ID.eq(user)
                            ))
                            .where(Tables.ARTICLE_TOPIC.ARTICLE_ID.eq(Tables.ARTICLE.ID)))
            }
        }.toTypedArray().let { DSL.or(*it) }.let { graphQuery.query.addConditions(it) }
    }

    fun filterHidden(graphQuery: GraphQuery, user: Long, value: TriStateFilter) =
            when (value) {
                TriStateFilter.INCLUDE -> Unit
                else -> {
                    val query = graphQuery.query
                    query.addJoin(
                            Tables.ARTICLE_HIDE,
                            joinType(value.value),
                            Tables.ARTICLE_HIDE.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                            Tables.ARTICLE_HIDE.USER_ID.eq(user))
                    query.addJoin(
                            Tables.AUTHOR_HIDE,
                            joinType(value.value),
                            Tables.AUTHOR_HIDE.AUTHOR_ID.eq(Tables.ARTICLE.AUTHOR_ID),
                            Tables.AUTHOR_HIDE.USER_ID.eq(user))
                    val topicHide = Tables.ARTICLE_TOPIC
                            .innerJoin(Tables.TOPIC_HIDE)
                            .on(
                                    Tables.ARTICLE_TOPIC.TOPIC_ID.eq(Tables.TOPIC_HIDE.TOPIC_ID),
//                                    Tables.ARTICLE_TOPIC.RANK.eq(DSL.value<Short>(0)),
                                    Tables.TOPIC_HIDE.USER_ID.eq(user))
                    query.addJoin(
                            topicHide,
                            joinType(value.value),
                            topicHide.field(Tables.ARTICLE_TOPIC.ARTICLE_ID)?.eq(Tables.ARTICLE.ID))
                }
            }

    fun order(graphQuery: GraphQuery, order: ArticleOrder, direction: SortOrder, locale: Locale, userId: Long?, viewsAfter: Long?, commentsAfter: Long?, ratingAfter: Timestamp?, ratingBefore: Timestamp?, pinned: Boolean?, stages: Set<Publication.Stage>) {
        val query = graphQuery.query
        val defaultSort = if (!stages.contains(Publication.Stage.DRAFT)) {
            if (pinned != null)
                arrayOf(Tables.ARTICLE.PINNED.sort(getSortOrder(!pinned)), Tables.ARTICLE.PUBLISHED_AT.nullSort(direction), Tables.ARTICLE.CREATED_AT.sort(direction))
            else
                arrayOf(Tables.ARTICLE.PUBLISHED_AT.nullSort(direction), Tables.ARTICLE.CREATED_AT.sort(direction))
        } else {
            if (pinned != null)
                arrayOf(Tables.ARTICLE.PINNED.sort(getSortOrder(!pinned)), Tables.ARTICLE.CREATED_AT.sort(direction))
            else
                arrayOf(Tables.ARTICLE.CREATED_AT.sort(direction))
        }

        when (order) {
            ArticleOrder.TIME -> query.addOrderBy(*defaultSort)
            ArticleOrder.RATING -> {
                val t = DSL.table("article_rating_t(?, ?)", DSL.value(ratingAfter), DSL.value(ratingBefore)).`as`("rating")
                query.addJoin(t, DSL.field("rating.aid", Long::class.java).eq(Tables.ARTICLE.ID))
                query.addOrderBy(DSL.field("rating.score").nullSort(direction), *defaultSort)
            }
            ArticleOrder.VIEWS -> {
                val count = DSL.count().`as`("view_count")
                val select = DSL
                        .select(Tables.ARTICLE_VIEW.ARTICLE_ID, count)
                        .from(Tables.ARTICLE_VIEW)
                        .where(*(if (viewsAfter != null)
                            arrayOf(Tables.ARTICLE_VIEW.CREATED_AT.ge(Timestamp(viewsAfter).toLocalDateTime())) else
                            emptyArray()))
                        .groupBy(Tables.ARTICLE_VIEW.ARTICLE_ID)
                        .asTable("view_count_after_t")
                query.addJoin(select, JoinType.LEFT_OUTER_JOIN, select.field(Tables.ARTICLE_VIEW.ARTICLE_ID)?.eq(Tables.ARTICLE.ID))
                query.addOrderBy(count.nullSort(direction), *defaultSort)
            }
            ArticleOrder.COMMENTS -> {
                val count = DSL.count().`as`("comment_count")
                val select = DSL
                        .select(Tables.COMMENT.ARTICLE_ID, count)
                        .from(Tables.COMMENT)
                        .where(*(if (viewsAfter != null)
                            arrayOf(Tables.COMMENT.CREATED_AT.ge(Timestamp(viewsAfter).toLocalDateTime())) else
                            emptyArray()))
                        .and(Tables.COMMENT.DELETED_AT.isNull)
                        .groupBy(Tables.COMMENT.ARTICLE_ID)
                        .asTable("comment_count_after_t")
                query.addJoin(select, JoinType.LEFT_OUTER_JOIN, select.field(Tables.COMMENT.ARTICLE_ID)?.eq(Tables.ARTICLE.ID))
                query.addOrderBy(count.nullSort(direction), *defaultSort)
            }
            ArticleOrder.TITLE -> {
                query.addOrderBy(Tables.ARTICLE.TITLE.collate(locale.collation).sort(direction).nullsLast(), *defaultSort)
            }
        }
    }

    // Setup

    inner class SchemaSetupContext(private val graphQuery: GraphQuery) {
        fun withId(id: Long) = this@ArticleSchemaService.withId(graphQuery, id)
        fun withCompany(company: Boolean) = this@ArticleSchemaService.withCompany(graphQuery, company)
        fun withAuthor(author: Long) = this@ArticleSchemaService.withAuthor(graphQuery, author)
        fun withTopic(topic: Long) = this@ArticleSchemaService.withTopic(graphQuery, topic)
        fun withTag(tag: Long) = this@ArticleSchemaService.withTag(graphQuery, tag)
        fun inList(list: String) = this@ArticleSchemaService.inList(graphQuery, list)
        fun after(timestamp: Long) = this@ArticleSchemaService.after(graphQuery, timestamp)
        fun after(timestamp: Timestamp) = this@ArticleSchemaService.after(graphQuery, timestamp)
        fun before(timestamp: Long) = this@ArticleSchemaService.before(graphQuery, timestamp)
        fun filterSubscription(user: Long, filters: Set<SubscriptionFilter>) =
                this@ArticleSchemaService.filterSubscription(graphQuery, user, filters)

        fun wasSeen(user: Long, seen: Boolean?) =
                this@ArticleSchemaService.wasSeen(graphQuery, user, seen)

        fun bookmarkedBy(user: Long, value: Boolean) =
                this@ArticleSchemaService.bookmarkedBy(graphQuery, user = user, value = value)

        fun withStage(stage: Set<Publication.Stage>, user: Long?, canReview: Boolean, canPeekDraft: Boolean) =
                this@ArticleSchemaService.withStage(graphQuery, stage, user, canReview, canPeekDraft)

        fun filterHidden(user: Long, value: TriStateFilter) = this@ArticleSchemaService.filterHidden(graphQuery, user, value)
        fun order(order: ArticleOrder, direction: SortOrder, locale: Locale, userId: Long?, viewsAfter: Long?, commentsAfter: Long?, ratingAfter: Long?, ratingBefore: Long?, pinned: Boolean?, stages: Set<Publication.Stage>) =
                this@ArticleSchemaService.order(graphQuery, order, direction, locale, userId, viewsAfter, commentsAfter, if (ratingAfter != null) Timestamp(ratingAfter) else null, if (ratingBefore != null) Timestamp(ratingBefore) else null, pinned, stages)
    }
}
