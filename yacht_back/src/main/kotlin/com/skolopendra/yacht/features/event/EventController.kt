package com.skolopendra.yacht.features.event

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.annotations.CompanyAccount
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.Count
import com.skolopendra.yacht.controller.common.CreateResponse
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.features.auth.currentUserOrNull
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserController
import com.skolopendra.yacht.jooq.Tables
import org.jooq.JoinType
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/events")
class EventController(
        private val eventService: EventService,
        private val eventRepository: EventRepositoryCustom,
        private val eventHideRepository: EventHideRepository,
        private val eventNonUniqueViewService: EventNonUniqueViewService
) {
    companion object {
        val META = selectTree { +"id"; +"createdAt"; +"updatedAt" }
        val PREVIEW = selectTree {
            "meta"(META)
            "info" {
                +"publicationStage"
                +"publishedAt"
                +"name"
                +"type"
                +"date"
                +"price"
                +"currency"
                +"city"
                +"announcement"
            }
            "company"(UserController.SHORT)
            "bookmarks" { +"count"; +"you" }
            "views" { +"count"; +"you" }
            +"hidden"
        }
        val FULL = PREVIEW with {
            "body" {
                +"source"
                +"html"
                +"address"
                +"registrationLink"
            }
        }
    }

    @GetMapping("{id}")
    fun getOne(@PathVariable id: Long): GraphResult {
        eventNonUniqueViewService.markViewed(id)
        return eventRepository.graph(currentUserIdOrNull(), null).apply { query.addConditions(Tables.EVENT.ID.eq(id)) }.fetchSingle(FULL)
    }

    /**
     * List all existing events with pagination
     */
    @GetMapping
    fun getPage(
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(required = false) company: Long?,
            @RequestParam(defaultValue = "PUBLISHED") stages: Set<Publication.Stage>,
            @RequestParam(required = false) types: Set<Event.Type>?,
            @RequestParam(required = false) seen: Boolean?,
            @RequestParam(required = false) bookmark: Boolean?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam(required = false) before: Long?,
            @RequestParam(required = false) after: Long?

    ): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        return eventService.list(currentUserIdOrNull(), company, stages, types, seen, bookmark, hidden, before, after).fetchPage(PREVIEW, pageable).response()
    }

    @GetMapping("count")
    fun getCount(
            @RequestParam(required = false) company: Long?,
            @RequestParam(defaultValue = "PUBLISHED") stages: Set<Publication.Stage>,
            @RequestParam(required = false) types: Set<Event.Type>?,
            @RequestParam(required = false) seen: Boolean?,
            @RequestParam(required = false) bookmark: Boolean?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam(required = false) before: Long?,
            @RequestParam(required = false) after: Long?
    ): Count {
        return Count(eventService.count(currentUserIdOrNull(), company, stages, types, seen, bookmark, hidden, before, after).fetchSingle().value1())
    }

    @GetMapping("{user}/bookmarks")
    fun getBookmarks(@PathVariable user: User, @RequestParam(defaultValue = "0") page: Int): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        return eventRepository.graph(user.id).apply {
            query.addJoin(Tables.EVENT_BOOKMARK,
                    JoinType.LEFT_SEMI_JOIN,
                    Tables.EVENT_BOOKMARK.EVENT_ID.eq(Tables.EVENT.ID),
                    Tables.EVENT_BOOKMARK.USER_ID.eq(user.id))
        }.fetchPage(PREVIEW, pageable).response()
    }

    /**
     * Creates a new event
     */
    @Secured(Roles.CHIEF_EDITOR)
    @CompanyAccount
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(): CreateResponse {
        return CreateResponse(eventService.create(currentUser()).id)
    }

    @PostMapping("{id}/bookmark")
    @ResponseStatus(HttpStatus.CREATED)
    fun bookmarkAdd(@PathVariable("id") event: Event) {
        eventService.bookmarkAdd(currentUser(), event)
    }

    @DeleteMapping("{id}/bookmark")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun bookmarkRemove(@PathVariable("id") event: Event) {
        eventService.bookmarkRemove(currentUser(), event)
    }

    @PostMapping("{id}/view")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun storeView(@PathVariable("id") event: Event, @RequestParam("f", required = false) fingerprint: Optional<String>) {
        val user = currentUserOrNull()
        if (user == null)
            require(fingerprint.isPresent)
        eventService.storeView(event, user, if (user != null) null else fingerprint.get())
    }

    @PostMapping("{id}/hide")
    fun articleHide(@PathVariable("id") event: Event) {
        eventHideRepository.save(EventHide(currentUser(), event))
    }

    @Transactional
    @DeleteMapping("{id}/hide")
    fun articleShow(@PathVariable("id") event: Event) {
        eventHideRepository.deleteByUserAndEvent(currentUser(), event)
    }

}
