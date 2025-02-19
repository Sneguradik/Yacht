package com.skolopendra.yacht.util

import com.skolopendra.yacht.jooq.Tables
import org.jooq.*
import org.jooq.impl.DSL

fun <X, R : Record, T : Record> fkEquals(fk: ForeignKey<R, T>): Condition {
    val fields = fk.fields as List<Field<X>>
    val keyFields = fk.key.fields as List<Field<X>>

    return DSL.and(fields.zip(keyFields).map { it.first.eq(it.second) })
}

fun joinType(filter: Boolean?): JoinType =
        when (filter) {
            null -> JoinType.LEFT_OUTER_JOIN
            true -> JoinType.LEFT_SEMI_JOIN
            false -> JoinType.LEFT_ANTI_JOIN
        }

fun <IdT>
        getSubscriptionJoinCondition(userIdRef: Field<Long>, userId: Long, idRefFrom: Field<IdT>, idRefTo: Field<IdT>): Condition {
    return DSL.and(
            idRefFrom.eq(idRefTo),
            userIdRef.eq(userId)
    )
}

fun isSubscribed(userIdRef: Field<Long>, filter: Boolean?, forUser: Long?): Field<Boolean> {
    return if (filter != null && forUser != null) {
        DSL.value(filter)
    } else {
        if (forUser != null)
            DSL.field(userIdRef.isNotNull)
        else
            DSL.castNull(Boolean::class.java)
    }
}

fun <SubR : Record, SubT : Table<SubR>, IdT, R : Record>
        withSubscription(subTable: SubT, idRefFrom: Field<IdT>, idRefTo: Field<IdT>, query: SelectQuery<R>, filter: Boolean?, forUser: Long?) {
    val userIdRef = subTable.getReferencesTo(Tables.USER).first().fields.first() as Field<Long>
    if (forUser != null)
        query.addJoin(subTable, joinType(filter), getSubscriptionJoinCondition(userIdRef, forUser, idRefFrom, idRefTo))
    query.addSelect(isSubscribed(userIdRef, filter, forUser))
}