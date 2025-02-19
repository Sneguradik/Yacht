package com.skolopendra.yacht.features.event

import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.lib.graph.StoredJoin
import com.skolopendra.lib.graph.Graph
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.user.UserSchema
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.util.joinType
import org.jooq.*
import org.jooq.impl.DSL
import org.springframework.stereotype.Repository
import java.sql.Timestamp

@Repository
class EventRepositoryImpl(
        val dsl: DSLContext
) : EventRepositoryCustom {
    companion object {
        val GRAPH = (Graph on Tables.EVENT) {
            val u = Tables.EVENT
            val companyJoin = StoredJoin(Tables.USER, JoinType.JOIN, Tables.USER.ID.eq(Tables.EVENT.COMPANY_ID))
            val viewsJoin = StoredJoin(Tables.EVENT_NON_UNIQUE_VIEW, JoinType.LEFT_OUTER_JOIN, Tables.EVENT_NON_UNIQUE_VIEW.EVENT_ID.eq(Tables.EVENT.ID))

            "meta" embed {
                "id" from u.ID
                "createdAt" from u.CREATED_AT
                "updatedAt" from u.UPDATED_AT
            }
            "info" embed {
                "publicationStage" from (u.PUBLICATION_STAGE enum Publication.Stage.values())
                "publishedAt" from u.PUBLISHED_AT
                "name" from u.NAME
                "type" from (u.TYPE enum Event.Type.values())
                "date" from u.DATE
                "price" from u.PRICE
                "currency" from (u.CURRENCY enum Event.Currency.values())
                "city" from u.CITY
                "announcement" from u.ANNOUNCEMENT
            }
            "body" embed {
                "source" from u.BODY_SOURCE
                "html" from u.BODY_HTML
                "address" from u.ADDRESS
                "registrationLink" from u.REGISTRATION_LINK
            }
            "company" from (UserSchema.GRAPH using companyJoin)
            "bookmarks" embed {
                "count" counts Tables.EVENT_BOOKMARK.where(Tables.EVENT_BOOKMARK.EVENT_ID.eq(Tables.EVENT.ID))
                "you" by { user: Long? ->
                    if (user == null) nil() else
                        jooq(DSL.field(Tables.EVENT_BOOKMARK.ID.isNotNull)) using StoredJoin(Tables.EVENT_BOOKMARK, JoinType.LEFT_OUTER_JOIN, Tables.EVENT_BOOKMARK.EVENT_ID.eq(Tables.EVENT.ID), Tables.EVENT_BOOKMARK.USER_ID.eq(user))
                }
            }
            "views" embed {
                "count" from (Tables.EVENT_NON_UNIQUE_VIEW.VIEWS_COUNT using viewsJoin mapNull { views: Int? -> views ?: 0})
                "you" by { user: Long? ->
                    if (user == null) nil() else
                        jooq(DSL.field(Tables.EVENT_VIEW.ID.isNotNull)) using StoredJoin(Tables.EVENT_VIEW, JoinType.LEFT_OUTER_JOIN, Tables.EVENT_VIEW.EVENT_ID.eq(Tables.EVENT.ID), Tables.EVENT_VIEW.USER_ID.eq(user))
                }
            }
            "hidden" by { user: Long?, hidden: Boolean? ->
                if (user == null)
                    nil()
                else
                    (if (hidden != null) const(hidden) else jooq(DSL.field(Tables.EVENT_HIDE.USER_ID.isNotNull))) using StoredJoin(Tables.EVENT_HIDE, joinType(hidden), Tables.EVENT_HIDE.EVENT_ID.eq(Tables.EVENT.ID), Tables.EVENT_HIDE.USER_ID.eq(user))
            }
        }
    }

    override fun count(): SelectQuery<Record1<Int>> =
            dsl.selectCount().from(Tables.EVENT).query

    override fun graph(forUser: Long?, hidden: Boolean?): GraphQuery =
            GRAPH.create(dsl, mapOf("user" to forUser, "hidden" to hidden))

    override fun <T : Record> applyQuery(
            query: SelectQuery<T>,
            canReview: Boolean,
            forUser: Long?,
            company: Long?,
            stages: Set<Publication.Stage>,
            types: Set<Event.Type>?,
            seen: Boolean?,
            bookmark: Boolean?,
            hidden: TriStateFilter,
            before: Long?,
            after: Long?
    ) {
        query.apply {
            when (hidden) {
                TriStateFilter.INCLUDE -> Unit
                else -> {
                    query.addJoin(
                            Tables.EVENT_HIDE,
                            joinType(hidden.value),
                            Tables.EVENT_HIDE.EVENT_ID.eq(Tables.EVENT.ID),
                            Tables.EVENT_HIDE.USER_ID.eq(forUser))
                }
            }

            if (before != null)
                addConditions(Tables.EVENT.DATE.le(Timestamp(before).toLocalDateTime()))

            if (after != null)
                addConditions(Tables.EVENT.DATE.ge(Timestamp(after).toLocalDateTime()))

            if (company != null)
                addConditions(Tables.EVENT.COMPANY_ID.eq(company))

            if (seen != null) {
                requireNotNull(forUser)
                addJoin(Tables.EVENT_VIEW, if (seen) JoinType.LEFT_SEMI_JOIN else JoinType.LEFT_ANTI_JOIN, Tables.EVENT_VIEW.EVENT_ID.eq(Tables.EVENT.ID), Tables.EVENT_VIEW.USER_ID.eq(forUser))
            }
            if (bookmark != null) {
                requireNotNull(forUser)
                addJoin(Tables.EVENT_BOOKMARK, if (bookmark) JoinType.LEFT_SEMI_JOIN else JoinType.LEFT_ANTI_JOIN, Tables.EVENT_BOOKMARK.EVENT_ID.eq(Tables.EVENT.ID), Tables.EVENT_BOOKMARK.USER_ID.eq(forUser))
            }

            val isOwner = if (forUser != null) Tables.EVENT.COMPANY_ID.eq(forUser) else DSL.falseCondition()
            val variants = stages.map {
                DSL.and(Tables.EVENT.PUBLICATION_STAGE.eq(it.ordinal), *when (it) {
                    Publication.Stage.PUBLISHED -> emptyArray()
                    Publication.Stage.REVIEWING,
                    Publication.Stage.BLOCKED -> if (canReview) emptyArray<Condition>() else arrayOf(isOwner)
                    Publication.Stage.DRAFT -> if (canReview) emptyArray<Condition>() else arrayOf(isOwner)
                })
            }.toTypedArray()
            addConditions(DSL.or(*variants))

            if (types != null) {
                addConditions(Tables.EVENT.TYPE.`in`(types.map { it.ordinal }))
            }
        }
    }
}
