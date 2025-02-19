package com.skolopendra.yacht.entity

import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.jooq.tables.Article
import org.jooq.Field
import org.jooq.SortField
import org.jooq.SortOrder
import org.jooq.SortOrder.ASC
import org.jooq.SortOrder.DESC

fun Article.isPublished() = PUBLICATION_STAGE.eq(Publication.Stage.PUBLISHED.ordinal)

fun <T> SortField<T>.nulls(sortOrder: SortOrder) =
    if (sortOrder == ASC) nullsFirst() else nullsLast()

fun <T> Field<T>.nullSort(sortOrder: SortOrder) = sort(sortOrder).nulls(sortOrder)

fun getSortOrder(asc: Boolean) = ASC.takeIf { asc } ?: DESC
