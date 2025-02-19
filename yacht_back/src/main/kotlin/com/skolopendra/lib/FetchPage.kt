package com.skolopendra.lib

import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.SelectQuery
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable

fun <R : Record, T> DSLContext.fetchPageInto(query: SelectQuery<R>, type: Class<T>, pageable: Pageable): Page<T> {
    val count = fetchCount(query).toLong()
    query.addOffset(pageable.offset)
    query.addLimit(pageable.pageSize)
    return PageImpl(query.fetchInto(type), pageable, count)
}

fun <T> Page<T>.response(): PageResponse<T> =
        PageResponse(this)

fun <T, X> Page<T>.response(transform: (item: T) -> X): PageResponse<X> =
        PageResponse(this, transform)
