package com.skolopendra.yacht.service

import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.yacht.entity.NotifyGroup
import org.jooq.Record
import org.jooq.Record1
import org.jooq.SelectQuery

interface NotificationRepositoryCustom {
    fun graph(forUser: Long? = null, hidden: Boolean?): GraphQuery
    fun count(): SelectQuery<Record1<Int>>
    fun <T : Record> applyQuery(
            query: SelectQuery<T>,
            forUser: Long? = null,
            order: NotifyGroup?,
            hidden: TriStateFilter
    )
}
