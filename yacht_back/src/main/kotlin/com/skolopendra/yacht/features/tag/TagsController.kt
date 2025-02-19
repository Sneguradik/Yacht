package com.skolopendra.yacht.features.tag

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.assertedFind
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.features.auth.currentUserOrNull
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemStatService
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemType
import com.skolopendra.yacht.features.showcase.StaticShowcaseService
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.SearchService
import com.skolopendra.yacht.util.joinType
import org.jooq.JoinType
import org.jooq.SortOrder
import org.jooq.impl.DSL
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.validation.Valid
import javax.validation.constraints.Pattern
import javax.validation.constraints.Size
import kotlin.NoSuchElementException

@Validated
@RestController
@RequestMapping("/tags")
class TagsController(
        private val tagsService: TagsService,
        private val tagRepository: TagRepository,
        private val tagRepositoryCustom: TagRepositoryCustom,
        private val searchService: SearchService,
        private val tagNonUniqueViewService: TagNonUniqueViewService,
        private val tagShowcaseService: TagShowcaseService,
        private val showcaseStaticItemStatService: ShowcaseStaticItemStatService,
        private val showcaseService: StaticShowcaseService

) {
    companion object {
        val SHORT = selectTree {
            "meta" { +"id"; +"createdAt"; +"updatedAt" }
            +"content"
        }
        val PREVIEW = SHORT with {
            +"postCount"
            "views" { +"count" }
        }
        val ADMIN = SHORT with {
            +"frequency"
        }
    }

    // should return all existing tags
    @GetMapping
    fun getAll(
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam("query", required = false) searchQuery: String?,
            @RequestParam("order", defaultValue = "name") order: TagOrder,
            @RequestParam("asc", defaultValue = "false") asc: Boolean,
            @RequestParam("seen", required = false) seen: Boolean?
    ): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        val userId = currentUserIdOrNull()
        val graph = tagRepositoryCustom.graph(userId)

        graph.query.addConditions(DSL.exists(DSL.selectOne().from(Tables.ARTICLE_TAG.innerJoin(Tables.ARTICLE).on(Tables.ARTICLE_TAG.TAG_ID.eq(Tables.TAG.ID), Tables.ARTICLE_TAG.ARTICLE_ID.eq(Tables.ARTICLE.ID), Tables.ARTICLE.PUBLICATION_STAGE.eq(2)))))

        if (seen != null && userId != null) {
            graph.query.apply {
                addJoin(
                        Tables.TAG_VIEW,
                        joinType(seen),
                        Tables.TAG_VIEW.TAG_ID.eq(Tables.TAG.ID),
                        Tables.TAG_VIEW.USER_ID.eq(userId)
                )
            }
        }

        val sortOrder = if (asc) SortOrder.ASC else SortOrder.DESC

        if (searchQuery != null)
            searchService.tagSearchQuery(graph.query, searchQuery)
        else {
            //  TODO: Frequency?
            when (order) {
                TagOrder.NAME -> graph.query.addOrderBy(Tables.TAG.CONTENT.sort(sortOrder))
                TagOrder.VIEWS -> {
                    val select = DSL
                            .select(
                                    Tables.TAG_VIEW.TAG_ID.`as`("id"),
                                    DSL.count().`as`("count"))
                            .from(Tables.TAG_VIEW)
                            .groupBy(Tables.TAG_VIEW.TAG_ID)
                            .asTable()
                    val countField = select.field("count", Int::class.java)
                    graph.query.addJoin(select, JoinType.LEFT_OUTER_JOIN, Tables.TAG.ID.eq(select.field("id", Long::class.java)))
                    graph.query.addOrderBy(countField?.sort(sortOrder)?.apply { if (asc) nullsFirst() else nullsLast() })
                }
                TagOrder.POST_COUNT -> {
                    val select = DSL
                            .select(
                                    Tables.ARTICLE_TAG.TAG_ID.`as`("id"),
                                    DSL.count().`as`("count"))
                            .from(Tables.ARTICLE_TAG)
                            .innerJoin(Tables.ARTICLE)
                            .on(
                                    Tables.ARTICLE_TAG.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                                    Tables.ARTICLE.isPublished())
                            .groupBy(Tables.ARTICLE_TAG.TAG_ID)
                            .asTable()
                    val countField = select.field("count", Int::class.java)
                    graph.query.addJoin(select, JoinType.LEFT_OUTER_JOIN, Tables.TAG.ID.eq(select.field("id", Long::class.java)))
                    graph.query.addOrderBy(countField?.sort(sortOrder)?.apply { if (asc) nullsFirst() else nullsLast() })
                }
                TagOrder.RECENT_POSTS -> {
                    val select = DSL
                            .select(
                                    Tables.ARTICLE_TAG.TAG_ID,
                                    DSL.count().`as`("count"))
                            .from(Tables.ARTICLE_TAG)
                            .innerJoin(Tables.ARTICLE)
                            .on(
                                    Tables.ARTICLE_TAG.ARTICLE_ID.eq(Tables.ARTICLE.ID),
                                    Tables.ARTICLE.isPublished())
                            .groupBy(Tables.ARTICLE_TAG.TAG_ID)
                    val countField = select.field("count", Int::class.java)
                    graph.query.addJoin(select, JoinType.LEFT_OUTER_JOIN, Tables.TAG.ID.eq(select.field(Tables.ARTICLE_TAG.TAG_ID)))
                    graph.query.addOrderBy(countField?.sort(sortOrder)?.apply { if (asc) nullsFirst() else nullsLast() })
                }
                TagOrder.RECENT_VIEWS -> {
                    require(userId != null)
                    graph.query.addJoin(Tables.TAG_VIEW, JoinType.LEFT_OUTER_JOIN, Tables.TAG_VIEW.TAG_ID.eq(Tables.TAG.ID), Tables.TAG_VIEW.USER_ID.eq(userId))
                    graph.query.addOrderBy(Tables.TAG_VIEW.UPDATED_AT.sort(sortOrder).apply { if (asc) nullsFirst() else nullsLast() })
                }

                else -> {}
            }
        }
        return graph.fetchPage(PREVIEW, pageable).response()
    }

    data class TagContent(
            @get:Size(max = 100)
            val content: String
    )

    data class CreateTagResponse(
            val id: Long
    )

    /**
     * Retrieve a tag by ID
     */
    @GetMapping("{id:\\d+}")
    fun get(@PathVariable id: Long): GraphResult {

        val result =  tagRepositoryCustom.graph(currentUserIdOrNull()).apply { query.addConditions(Tables.TAG.ID.eq(id)) }.fetchSingle(PREVIEW)
        tagNonUniqueViewService.markViewed(id)
        val viewsCountByTag = tagNonUniqueViewService.countByTag(id)
        showcaseStaticItemStatService.upsertStats(
                id,
                itemType = ShowcaseStaticItemType.TAG,
                currentViewsCount = viewsCountByTag
        )

        return result
    }

    @GetMapping("({ids})")
    fun getMany(@Valid @PathVariable @Size(max = 20) ids: List<Long>): List<GraphResult> {
        return tagRepositoryCustom.graph(currentUserIdOrNull()).apply { query.addConditions(Tables.TAG.ID.`in`(ids)) }.fetch(PREVIEW)
    }

    /**
     * Retrieve tag content by ID
     */
    @GetMapping("{id}", params = ["content"])
    fun get(@PathVariable id: Long, @RequestParam content: Any): TagContent {
        val tagContent = TagContent(tagRepository.assertedFind(id).content)
        tagNonUniqueViewService.markViewed(id)
        tagShowcaseService.upsertShowcaseTagStats(id)
        return tagContent
    }

    /**
     * Retrieve a tag by content
     */
    @GetMapping(params = ["content"])
    fun getOne(@RequestParam content: String): GraphResult {
        val normalized = content.replace(Regex("\\s+"), "").lowercase(Locale.ROOT)
        val tagContent = tagRepositoryCustom.graph(currentUserIdOrNull()).apply { query.addConditions(Tables.TAG.CONTENT.eq(normalized)) }.fetchSingle(PREVIEW)
        val tag = tagsService.getOneByContent(content)
        tagNonUniqueViewService.markViewed(tag.id)
        tagShowcaseService.upsertShowcaseTagStats(tag.id)
        return tagContent
    }

    data class TagId(val id: Long)

    /**
     * Retrieve tag ID by content
     */
    @GetMapping(params = ["content", "id"])
    fun getId(@RequestParam content: String): TagId {
        val normalized = content.replace(Regex("\\s+"), "").lowercase(Locale.ROOT)
        return TagId(tagRepository.findByContent(normalized)?.id
                ?: throw NoSuchElementException())
    }

    /**
     * Create the tag
     * Response: Tag ID
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun post(@Valid @RequestBody request: TagContent): CreateTagResponse {
        return CreateTagResponse(
                id = tagsService.createTag(request.content)
        )
    }

    /**
     * Delete the tag
     */
    @Secured(Roles.CHIEF_EDITOR)
    @DeleteMapping("{id}")
    fun delete(@PathVariable id: Long) {
        val showcaseItem = showcaseService.getItemByItemIdAndType(id, ShowcaseStaticItemType.TAG)
        if (showcaseItem != null) {
            showcaseService.withdraw(showcaseItem)
        }
        tagsService.remove(id)
    }

    @PostMapping("{id}/view")
    fun view(
            @PathVariable("id") tag: Tag,
            @Valid @Pattern(regexp = "^[0-9a-f]{32}$") @RequestParam("f", required = false) fingerprint: String?) {
        val user = currentUserOrNull()
        if (user != null) tagsService.markViewed(tag, user, null)
        else {
            require(fingerprint != null)
            tagsService.markViewed(tag, null, fingerprint)
        }
    }
}
