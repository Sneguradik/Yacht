package com.skolopendra.yacht.features.event

import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.yacht.entity.publication.Publication
import org.jooq.Record
import org.jooq.Record1
import org.jooq.SelectQuery

interface EventRepositoryCustom {
    fun graph(forUser: Long? = null, hidden: Boolean? = false): GraphQuery
    fun count(): SelectQuery<Record1<Int>>
    fun <T : Record> applyQuery(
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
    )
}
