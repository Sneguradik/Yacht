package com.skolopendra.yacht.features.advertisement

import com.skolopendra.lib.graph.GraphQuery
import org.jooq.Record
import org.jooq.Record1
import org.jooq.SelectQuery

interface AdvertisementRepositoryCustom {
    fun graph(): GraphQuery
    fun count(): SelectQuery<Record1<Int>>
    fun <T : Record> applyQuery(
            query: SelectQuery<T>,
            order: List<AdvertisementOrder>?,
            place: Advertisement.Place?
    )
}
