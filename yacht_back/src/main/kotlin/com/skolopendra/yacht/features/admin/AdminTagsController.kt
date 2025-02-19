package com.skolopendra.yacht.features.admin

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.i18n.Locale
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.features.tag.TagAdmin
import com.skolopendra.yacht.features.tag.TagOrder
import com.skolopendra.yacht.features.tag.TagRepositoryCustom
import com.skolopendra.yacht.features.tag.TagsController.Companion.ADMIN
import com.skolopendra.yacht.features.tag.TagsService
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.SearchService
import org.jooq.JoinType
import org.jooq.SortOrder
import org.jooq.impl.DSL
import org.jooq.impl.DSL.inline
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.annotation.Secured
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.sql.Timestamp

@Validated
@RestController
@Secured(Roles.SUPERUSER)
@RequestMapping("administration/tags")
class AdminTagsController(
    private val tagsService: TagsService,
    private val tagRepositoryCustom: TagRepositoryCustom,
    private val searchService: SearchService
) {
    @GetMapping
    fun getAdmin(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam("after", required = false) after: Long?,
        @RequestParam("before", required = false) before: Long?,
        @RequestParam("order", defaultValue = "frequency") order: TagOrder,
        @RequestParam("asc", defaultValue = "false") asc: Boolean,
        @RequestParam("locale", defaultValue = "ALL") locale: Locale
    ): PageResponse<GraphResult> {
        val graph = tagRepositoryCustom.graph(null)
        if (after != null)
            graph.apply { query.addConditions(Tables.TAG.CREATED_AT.ge(Timestamp(after).toLocalDateTime())) }
        if (before != null)
            graph.apply { query.addConditions(Tables.TAG.CREATED_AT.le(Timestamp(before).toLocalDateTime())) }

        val sortOrder = if (asc) SortOrder.ASC else SortOrder.DESC

        when (order) {
            TagOrder.NAME -> {
                graph.query.addOrderBy(Tables.TAG.CONTENT.collate(locale.collation).sort(sortOrder).nullsLast())

                when {
                    locale != Locale.ALL -> {
                        val regexLanguagePattern = if (locale == Locale.ENGLISH) {
                            "^[A-Za-z0-9(){},.:;$#!?+\"-]*$"
                        } else {
                            "(?i)(.*(?:[а-я|А-Я]).*)"
                        }

                        graph.where(
                            DSL.replace(Tables.TAG.CONTENT, inline(" "), inline(""))
                                .likeRegex(regexLanguagePattern)
                        )
                    }
                }
            }

            TagOrder.VIEWS -> {
                val select = DSL
                    .select(
                        Tables.TAG_VIEW.TAG_ID.`as`("id"),
                        DSL.count().`as`("count")
                    )
                    .from(Tables.TAG_VIEW)
                    .groupBy(Tables.TAG_VIEW.TAG_ID)
                    .asTable()
                val countField = select.field("count", Int::class.java)
                graph.query.addJoin(
                    select,
                    JoinType.LEFT_OUTER_JOIN,
                    Tables.TAG.ID.eq(select.field("id", Long::class.java))
                )
                graph.query.addOrderBy(countField?.sort(sortOrder)?.apply { if (asc) nullsFirst() else nullsLast() })
            }

            TagOrder.POST_COUNT -> {
                val select = DSL
                    .select(
                        Tables.ARTICLE_TAG.TAG_ID.`as`("id"),
                        DSL.count().`as`("count")
                    )
                    .from(Tables.ARTICLE_TAG)
                    .innerJoin(Tables.ARTICLE)
                    .on(
                        Tables.ARTICLE_TAG.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                        Tables.ARTICLE.isPublished()
                    )
                    .groupBy(Tables.ARTICLE_TAG.TAG_ID)
                    .asTable()
                val countField = select.field("count", Int::class.java)
                graph.query.addJoin(
                    select,
                    JoinType.LEFT_OUTER_JOIN,
                    Tables.TAG.ID.eq(select.field("id", Long::class.java))
                )
                graph.query.addOrderBy(countField?.sort(sortOrder)?.apply { if (asc) nullsFirst() else nullsLast() })
            }

            TagOrder.RECENT_POSTS -> {
                val select = DSL
                    .select(
                        Tables.ARTICLE_TAG.TAG_ID,
                        DSL.count().`as`("count")
                    )
                    .from(Tables.ARTICLE_TAG)
                    .innerJoin(Tables.ARTICLE)
                    .on(
                        Tables.ARTICLE_TAG.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                        Tables.ARTICLE.isPublished()
                    )
                    .groupBy(Tables.ARTICLE_TAG.TAG_ID)
                val countField = select.field("count", Int::class.java)
                graph.query.addJoin(
                    select,
                    JoinType.LEFT_OUTER_JOIN,
                    Tables.TAG.ID.eq(select.field(Tables.ARTICLE_TAG.TAG_ID))
                )
                graph.query.addOrderBy(countField?.sort(sortOrder)?.apply { if (asc) nullsFirst() else nullsLast() })
            }

            TagOrder.FREQUENCY -> graph.apply { query.addOrderBy(DSL.field("frequency").desc().nullsLast()) }
            else -> {}
        }

        return graph.fetchPage(ADMIN, PageRequest.of(page, 10)).response()
    }

    @GetMapping("stats")
    fun getAdminStats(
        @RequestParam("after", required = false) after: Long?,
        @RequestParam("before", required = false) before: Long?
    ): TagAdmin {
        return tagsService.getStats(Timestamp(after ?: 0), Timestamp(before ?: System.currentTimeMillis()))
    }

}
