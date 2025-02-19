package com.skolopendra.yacht.features.user

import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.lib.i18n.Locale
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.entity.nullSort
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.RankingService
import org.jooq.*
import org.jooq.impl.DSL
import org.jooq.impl.DSL.*
import org.springframework.stereotype.Repository
import java.sql.Timestamp

@Repository
class UserGraph(
        private val dsl: DSLContext,
        private val rankingService: RankingService
) {

    companion object {
        fun namesOfUserAndCompanies(): Table<Record2<Long, String>> = DSL
                    .select(DSL.field("id", Long::class.java), DSL.field("users", String::class.java))
                    .from(
                            DSL.select(
                                    Tables.USER.ID.`as`("id"),
                                    choose(Tables.USER.IS_COMPANY)
                                            .`when`(inline(true), Tables.USER.COMPANY_NAME)
                                            .otherwise(DSL.concat(Tables.USER.FIRST_NAME, `val`(" "), Tables.USER.LAST_NAME))
                                            .`as`("users")
                            )
                                    .from(Tables.USER)
                                    .asTable()
                    )
                    .asTable()
    }

    fun get(forUser: Long?, sub: Boolean? = null, hidden: Boolean? = false): GraphQuery =
            UserSchema.GRAPH.create(dsl, mapOf("user" to forUser, "sub" to sub, "hidden" to hidden)).apply { query.addConditions(Tables.USER.MASTER_ACCOUNT.isNull) }

    fun withId(graphQuery: GraphQuery, id: Long) {
        graphQuery.where(Tables.USER.ID.eq(id))
    }


    fun order(graphQuery: GraphQuery, order: UserOrder, direction: SortOrder = SortOrder.DESC, locale: Locale, company: Boolean, ratingAfter: Timestamp?, ratingBefore: Timestamp?, admin: Boolean = false, allAdmins: Boolean = false) {

        val users = namesOfUserAndCompanies()

        val defaultSort = if (admin) {
            if (allAdmins) {
                arrayOf(Tables.USER.COMPANY_NAME.collate(locale.collation), Tables.USER.USERNAME.collate(locale.collation), Tables.USER.ID).plus(arrayOf(Tables.USER.FIRST_NAME.collate(locale.collation), Tables.USER.LAST_NAME.collate(locale.collation), Tables.USER.USERNAME.collate(locale.collation), Tables.USER.ID))
            } else {
                if (company)
                    arrayOf(Tables.USER.COMPANY_NAME.collate(locale.collation), Tables.USER.USERNAME.collate(locale.collation), Tables.USER.ID)
                else
                    arrayOf(Tables.USER.FIRST_NAME.collate(locale.collation), Tables.USER.LAST_NAME.collate(locale.collation), Tables.USER.USERNAME.collate(locale.collation), Tables.USER.ID)
            }
        } else
            if (company)
                arrayOf(Tables.USER.COMPANY_NAME.collate(locale.collation), Tables.USER.USERNAME.collate(locale.collation), Tables.USER.ID)
            else
                arrayOf(Tables.USER.FIRST_NAME.collate(locale.collation), Tables.USER.LAST_NAME.collate(locale.collation), Tables.USER.USERNAME.collate(locale.collation), Tables.USER.ID)

        val query = graphQuery.query

        when (order) {
            UserOrder.NAME -> {
                if(!allAdmins) {
                    query.addOrderBy(*defaultSort.map { it.sort(direction) }.toTypedArray())
                } else {
                    val sortArray = arrayOf(users.field("users", String::class.java)?.collate(locale.collation), users.field("id", Long::class.java))
                    val currentUser = users.field("id", Long::class.java)
                    query.addJoin(users, JoinType.LEFT_OUTER_JOIN, Tables.USER.ID.eq(currentUser).and(Tables.USER.IS_DELETED.eq(false)))
                    query.addOrderBy(*sortArray.map { it?.sort(direction) }.toTypedArray())
                }
            }
            UserOrder.LAST_POST_TIME -> {
                val lastPostTime = DSL.max(Tables.ARTICLE.PUBLISHED_AT).`as`("last_post_time")
                val lastPost = DSL
                        .select(
                                Tables.USER.ID,
                                lastPostTime)
                        .from(Tables.USER)
                        .innerJoin(Tables.ARTICLE)
                        .on(Tables.ARTICLE.isPublished(), Tables.ARTICLE.AUTHOR_ID.eq(Tables.USER.ID))
                        .groupBy(Tables.USER.ID)
                        .asTable()
                val lastPostUser = lastPost.field(Tables.USER.ID)
                query.addJoin(lastPost, JoinType.LEFT_OUTER_JOIN, Tables.USER.ID.eq(lastPostUser).and(Tables.USER.IS_DELETED.eq(false)))
                query.addOrderBy(lastPostTime.nullSort(direction), *defaultSort)
            }
            UserOrder.POST_COUNT -> {
                val postCount = DSL.count().`as`("post_count")
                val postCountTable = DSL
                        .select(
                                Tables.USER.ID,
                                postCount)
                        .from(Tables.USER)
                        .innerJoin(Tables.ARTICLE)
                        .on(
                                Tables.USER.ID.eq(Tables.ARTICLE.AUTHOR_ID),
                                Tables.ARTICLE.isPublished())
                        .groupBy(Tables.USER.ID)
                        .asTable()
                query.addJoin(postCountTable, JoinType.LEFT_OUTER_JOIN, Tables.USER.ID.eq(postCountTable.field(Tables.USER.ID)).and(Tables.USER.IS_DELETED.eq(false)))
                query.addOrderBy(postCountTable.field(postCount)?.nullSort(direction), *defaultSort)
            }
            UserOrder.SUB_COUNT -> {
                // TODO: Subscriber count from graph
                val subCount = DSL
                        .select(DSL.count())
                        .from(Tables.AUTHOR_SUBSCRIPTION)
                        .where(Tables.AUTHOR_SUBSCRIPTION.AUTHOR_ID.eq(Tables.USER.ID).and(Tables.USER.IS_DELETED.eq(false)))
                        .asField<Long>()
                query.addSelect(subCount)
                query.addOrderBy(subCount.nullSort(direction), *defaultSort)
            }
            UserOrder.RATING -> {
                // TODO: Rating from graph
                // TODO: Вот тут надо предусмотреть время до и после по-умолчанию из конфига
                if (ratingAfter == null && ratingBefore == null) {
                    val rating = DSL
                            .select(Tables.USER_RATING.SCORE, Tables.USER_RATING.ID)
                            .from(Tables.USER_RATING)
                            .asTable()
                            .`as`("rating")

                    query.addJoin(rating, JoinType.RIGHT_OUTER_JOIN, DSL.field("rating.id", Long::class.java).eq(Tables.USER.ID).and(Tables.USER.IS_DELETED.eq(false)))
                }
                else {
                    val t = DSL.table("user_rating_t(?, ?)", DSL.value(ratingAfter), DSL.value(ratingBefore)).`as`("rating")
                    query.addJoin(t, JoinType.JOIN, DSL.field("rating.uid", Long::class.java).eq(Tables.USER.ID).and(Tables.USER.IS_DELETED.eq(false)))
                }
                query.addOrderBy(DSL.field("rating.score", Double::class.java).nullSort(direction), *defaultSort)
            }
        }
    }
}
