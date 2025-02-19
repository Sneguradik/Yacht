package com.skolopendra.yacht.features.job

import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.lib.graph.StoredJoin
import com.skolopendra.lib.graph.Graph
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.entity.nullSort
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.topic.TopicOrder
import com.skolopendra.yacht.features.user.UserSchema
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.util.joinType
import org.jooq.*
import org.jooq.impl.DSL
import org.springframework.stereotype.Repository

@Repository
class JobRepositoryImpl(
        val dsl: DSLContext
) : JobRepositoryCustom {
    companion object {
        val GRAPH = (Graph on Tables.JOB) {
            val u = Tables.JOB
            val companyJoin = StoredJoin(Tables.USER, JoinType.JOIN, Tables.USER.ID.eq(Tables.JOB.COMPANY_ID))
            val viewsJoin = StoredJoin(Tables.JOB_NON_UNIQUE_VIEW, JoinType.LEFT_OUTER_JOIN, Tables.JOB_NON_UNIQUE_VIEW.JOB_ID.eq(Tables.JOB.ID))
            "meta" embed {
                "id" from u.ID
                "createdAt" from u.CREATED_AT
                "updatedAt" from u.UPDATED_AT
            }
            "info" embed {
                "publicationStage" from (u.PUBLICATION_STAGE enum Publication.Stage.values())
                "publishedAt" from u.PUBLISHED_AT
                "name" from u.NAME
                "minSalary" from u.MIN_SALARY
                "maxSalary" from u.MAX_SALARY
                "currency" from (u.CURRENCY enum Job.Currency.values())
                "type" from (u.TYPE enum Job.Type.values())
                "place" from (u.PLACE enum Job.Place.values())
                "city" from u.CITY
                "recruiterName" from u.RECRUITER_NAME
                "email" from u.EMAIL
            }
            "body" embed {
                "tasks" from u.TASKS
                "workConditions" from u.WORK_CONDITIONS
                "requirements" from u.REQUIREMENTS
                "image" from u.IMAGE
            }
            "company" from (UserSchema.GRAPH using companyJoin)
            "bookmarks" embed {
                "count" counts Tables.JOB_BOOKMARK.where(Tables.JOB_BOOKMARK.JOB_ID.eq(Tables.JOB.ID))
                "you" by { user: Long? ->
                    if (user == null) nil() else
                        jooq(DSL.field(Tables.JOB_BOOKMARK.ID.isNotNull)) using StoredJoin(Tables.JOB_BOOKMARK, JoinType.LEFT_OUTER_JOIN, Tables.JOB_BOOKMARK.JOB_ID.eq(Tables.JOB.ID), Tables.JOB_BOOKMARK.USER_ID.eq(user))
                }
            }
            "views" embed {
                "count"  from (Tables.JOB_NON_UNIQUE_VIEW.VIEWS_COUNT using viewsJoin mapNull { views: Int? -> views ?: 0})
                "you" by { user: Long? ->
                    if (user == null) nil() else
                        jooq(DSL.field(Tables.JOB_VIEW.ID.isNotNull)) using StoredJoin(Tables.JOB_VIEW, JoinType.LEFT_OUTER_JOIN, Tables.JOB_VIEW.JOB_ID.eq(Tables.JOB.ID), Tables.JOB_VIEW.USER_ID.eq(user))
                }
            }
            "hidden" by { user: Long?, hidden: Boolean? ->
                if (user == null)
                    nil()
                else
                    (if (hidden != null) const(hidden) else jooq(DSL.field(Tables.JOB_HIDE.USER_ID.isNotNull))) using StoredJoin(Tables.JOB_HIDE, joinType(hidden), Tables.JOB_HIDE.JOB_ID.eq(Tables.JOB.ID), Tables.JOB_HIDE.USER_ID.eq(user))
            }
        }
    }

    override fun graph(forUser: Long?, hidden: Boolean?): GraphQuery =
            GRAPH.create(dsl, mapOf("user" to forUser, "hidden" to hidden))

    override fun count(): SelectQuery<Record1<Int>> =
            dsl.selectCount().from(Tables.JOB).query

    override fun <T : Record> applyQuery(
            query: SelectQuery<T>,
            canReview: Boolean,
            forUser: Long?,
            company: Long?,
            stages: Set<Publication.Stage>,
            seen: Boolean?,
            bookmark: Boolean?,
            hidden: TriStateFilter,
            order: JobOrder,
            direction: SortOrder
    ) {
        query.apply {
            when (hidden) {
                TriStateFilter.INCLUDE -> Unit
                else -> {
                    query.addJoin(
                            Tables.JOB_HIDE,
                            joinType(hidden.value),
                            Tables.JOB_HIDE.JOB_ID.eq(Tables.JOB.ID),
                            Tables.JOB_HIDE.USER_ID.eq(forUser))
                }
            }

            when (order) {
                JobOrder.NAME -> {
                    query.addOrderBy(Tables.JOB.NAME.nullSort(direction))
                }

                JobOrder.LAST_POST_TIME -> {
                    query.addOrderBy(Tables.JOB.PUBLISHED_AT.nullSort(direction))
                }


                JobOrder.VIEWS -> {
                    val viewCount = DSL
                            .select(Tables.JOB_NON_UNIQUE_VIEW.VIEWS_COUNT)
                            .from(Tables.JOB_NON_UNIQUE_VIEW)
                            .where(Tables.JOB_NON_UNIQUE_VIEW.JOB_ID.eq(Tables.JOB.ID))
                            .asField<Int>()
                    query.addSelect(viewCount)
                    query.addOrderBy(viewCount.nullSort(direction))
                }

                JobOrder.BOOKMARKS -> {
                    val bookmarkCount = DSL
                            .select(DSL.count())
                            .from(Tables.JOB_BOOKMARK)
                            .where(Tables.JOB_BOOKMARK.JOB_ID.eq(Tables.JOB.ID))
                            .asField<Long>()
                    query.addSelect(bookmarkCount)
                    query.addOrderBy(bookmarkCount.nullSort(direction))
                }
            }

            if (company != null)
                addConditions(Tables.JOB.COMPANY_ID.eq(company))

            if (seen != null) {
                requireNotNull(forUser)
                addJoin(Tables.JOB_VIEW, if (seen) JoinType.LEFT_SEMI_JOIN else JoinType.LEFT_ANTI_JOIN, Tables.JOB_VIEW.JOB_ID.eq(Tables.JOB.ID), Tables.JOB_VIEW.USER_ID.eq(forUser))
            }
            if (bookmark != null) {
                requireNotNull(forUser)
                addJoin(Tables.JOB_BOOKMARK, if (bookmark) JoinType.LEFT_SEMI_JOIN else JoinType.LEFT_ANTI_JOIN, Tables.JOB_BOOKMARK.JOB_ID.eq(Tables.JOB.ID), Tables.JOB_BOOKMARK.USER_ID.eq(forUser))
            }

            val isOwner = if (forUser != null) Tables.JOB.COMPANY_ID.eq(forUser) else DSL.falseCondition()
            val variants = stages.map {
                DSL.and(Tables.JOB.PUBLICATION_STAGE.eq(it.ordinal), *when (it) {
                    Publication.Stage.PUBLISHED -> emptyArray()
                    Publication.Stage.REVIEWING,
                    Publication.Stage.BLOCKED -> if (canReview) emptyArray<Condition>() else arrayOf(isOwner)
                    Publication.Stage.DRAFT -> if (canReview) emptyArray<Condition>() else arrayOf(isOwner)
                })
            }.toTypedArray()
            addConditions(DSL.or(*variants))
        }
    }
}
