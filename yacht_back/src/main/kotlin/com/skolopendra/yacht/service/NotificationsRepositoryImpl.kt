package com.skolopendra.yacht.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.Graph
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.lib.graph.StoredJoin
import com.skolopendra.yacht.entity.Notify
import com.skolopendra.yacht.entity.NotifyGroup
import com.skolopendra.yacht.entity.nullSort
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.util.joinType
import org.jooq.*
import org.jooq.impl.DSL
import org.springframework.stereotype.Repository

@Repository
class NotificationsRepositoryImpl(
        val dsl: DSLContext,
        val objectMapper: ObjectMapper
) : NotificationRepositoryCustom {
    companion object {
        val GRAPH = (Graph on Tables.NOTIFICATION) {
            val u = Tables.NOTIFICATION
            "id" from u.ID
            "createdAt" from u.CREATED_AT
            "type" from u.TYPE
            "body" from u.BODY_JSON
            "isRead" from u.IS_READ
            "hidden" by { user: Long?, hidden: Boolean? ->
                if (user == null)
                    nil()
                else
                    (if (hidden != null) const(hidden) else jooq(DSL.field(Tables.USER_NOTIFY_SETTINGS.USER_ID.isNotNull))) using StoredJoin(
                            Tables.USER_NOTIFY_SETTINGS,
                            joinType(hidden),
                            Tables.USER_NOTIFY_SETTINGS.USER_ID.eq(Tables.NOTIFICATION.USER_ID),
                            Tables.USER_NOTIFY_SETTINGS.TYPE.eq(Tables.NOTIFICATION.TYPE))
            }
        }
    }

    override fun graph(forUser: Long?, hidden: Boolean?): GraphQuery =
            GRAPH.create(dsl, mapOf("user" to forUser, "hidden" to hidden))

    override fun count(): SelectQuery<Record1<Int>> =
            dsl.selectCount().from(Tables.NOTIFICATION).query

    override fun <T : Record> applyQuery(
            query: SelectQuery<T>,
            forUser: Long?,
            order: NotifyGroup?,
            hidden: TriStateFilter) {
        query.apply {
            query.addOrderBy(Tables.NOTIFICATION.CREATED_AT.nullSort(SortOrder.DESC))

            if (forUser != null) query.addConditions(Tables.NOTIFICATION.USER_ID.eq(forUser))

            when (hidden) {
                TriStateFilter.INCLUDE -> Unit
                else -> {
                    query.addJoin(
                            Tables.USER_NOTIFY_SETTINGS,
                            joinType(hidden.value),
                            Tables.USER_NOTIFY_SETTINGS.USER_ID.eq(Tables.NOTIFICATION.USER_ID),
                            Tables.USER_NOTIFY_SETTINGS.TYPE.eq(Tables.NOTIFICATION.TYPE),
                            Tables.USER_NOTIFY_SETTINGS.ACTIVE.isTrue
                    )
                }
            }

            if (order != null) {
                when (order) {
                    NotifyGroup.UNREAD -> query.addConditions(Tables.NOTIFICATION.IS_READ.isFalse)
                    NotifyGroup.SYSTEM_GROUP -> query.addConditions(Tables.NOTIFICATION.TYPE.`in`(Notify.systemTypesString))
                    NotifyGroup.COMMENTS_GROUP -> query.addConditions(Tables.NOTIFICATION.TYPE.`in`(Notify.commentsTypesString))
                    NotifyGroup.PUBLICATIONS_GROUP -> query.addConditions(Tables.NOTIFICATION.TYPE.`in`(Notify.notTypesString))
                    else -> {}
                }
            }
        }
    }
}
