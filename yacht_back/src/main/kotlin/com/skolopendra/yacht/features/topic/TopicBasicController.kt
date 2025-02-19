package com.skolopendra.yacht.features.topic

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.i18n.Locale
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.getSortOrder
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemStatService
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemType
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.SearchService
import org.jooq.impl.DSL.*
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.annotation.Secured
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import javax.validation.Valid
import javax.validation.constraints.Size

@Validated
@RestController
@RequestMapping("/topics")
class TopicBasicController(
        private val service: TopicService,
        private val db: TopicGraph,
        private val searchService: SearchService,
        private val topicHideRepository: TopicHideRepository,
        private val showcaseStaticItemStatService: ShowcaseStaticItemStatService,
        private val topicShowcaseService: TopicShowcaseService
) {

    @GetMapping("{id:\\d+}")
    fun getOne(@PathVariable id: Long): GraphResult {
        topicShowcaseService.upsertTopiShowcaseStat(id)
        return db.get(currentUserIdOrNull(), null, null) { withId(id) }.fetchSingle(TopicSchema.FULL)
    }

    @GetMapping("({ids})")
    fun getMany(@Valid @PathVariable @Size(max = 20) ids: List<Long>): List<GraphResult> {
        return db.get(currentUserIdOrNull(), null, null) { withIds(ids) }.fetch(TopicSchema.FULL)
    }

    @GetMapping("url/{url}")
    fun getByUrl(@PathVariable url: String): GraphResult {
        val result =  db.get(currentUserIdOrNull(), null, null).apply { query.addConditions(Tables.TOPIC.URL.likeIgnoreCase(url)) }.fetchSingle(TopicSchema.FULL)
        val topic = service.getOneByUrl(url)
        topicShowcaseService.upsertTopiShowcaseStat(topic.id)
        return result
    }

    /**
     * List all existing topics with pagination
     */
    @GetMapping
    fun getPage(
            @RequestParam("page", defaultValue = "0") page: Int,
            @RequestParam("sub") sub: Boolean?,
            @RequestParam("query") searchQuery: String?,
            @RequestParam("order", defaultValue = "name") order: TopicOrder,
            @RequestParam("locale", defaultValue = "ALL") locale: Locale,
            @RequestParam("asc", defaultValue = "false") asc: Boolean,
            @RequestParam(defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam("rating-after", required = false) ratingAfter: Long?,
            @RequestParam("rating-before", required = false) ratingBefore: Long?
    ): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        val graph = db.get(currentUserIdOrNull(), sub, hidden.value)
        if (searchQuery != null)
            searchService.topicSearchQuery(graph.query, searchQuery)
        else {
            db.setup(graph) {
                order(order, getSortOrder(asc), locale, ratingAfter, ratingBefore)
            }
        }

        when (order) {
            TopicOrder.NAME -> {
                if (locale != Locale.ALL) {
                    val regexLanguagePattern = if (locale == Locale.ENGLISH) {
                        "^[A-Za-z0-9(){},.:;$#!?+\"-]*$"
                    } else {
                        "(?i)(.*(?:[а-я|А-Я]).*)"
                    }
                    graph.where(replace(Tables.TOPIC.NAME, inline(" "), inline("")).likeRegex(regexLanguagePattern))
                }
            }

            else -> {}
        }

        return graph.fetchPage(TopicSchema.PREVIEW, pageable).response()
    }

    /**
     * Patch topic info
     */
    @Secured(Roles.CHIEF_EDITOR)
    @PatchMapping("{id}")
    fun patch(@PathVariable id: Long, @RequestBody patch: Map<String, Any?>): GraphResult {
        service.patch(id, patch)
        return db.get(currentUserIdOrNull(), null) { withId(id) }.fetchSingle(TopicSchema.FULL)
    }

    @PostMapping("{id}/hide")
    fun topicHide(@PathVariable("id") topic: Topic) {
        topicHideRepository.save(TopicHide(currentUser(), topic))
    }

    @Transactional
    @DeleteMapping("{id}/hide")
    fun topicShow(@PathVariable("id") topic: Topic) {
        topicHideRepository.deleteByUserAndTopic(currentUser(), topic)
    }

    @PostMapping("{id}/subscribe")
    fun topicSubscribe(@PathVariable("id") topic: Topic) {
        service.topicSubscribe(currentUser(), topic)
        topicShowcaseService.upsertTopiShowcaseStat(topic.id)
    }

    @DeleteMapping("{id}/subscribe")
    fun topicUnsubscribe(@PathVariable("id") topic: Topic) {
        service.topicUnsubscribe(currentUser(), topic)
        topicShowcaseService.upsertTopiShowcaseStat(topic.id)
    }
}
