package com.skolopendra.yacht.features.event

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.response
import com.skolopendra.yacht.controller.common.Count
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/companies/{id}/events")
class CompanyEventController(
        private val service: EventService
) {
    @GetMapping
    fun getPage(
            @PathVariable("id") company: Long,
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(defaultValue = "published") stages: Set<Publication.Stage>,
            @RequestParam(required = false) types: Set<Event.Type>?,
            @RequestParam(required = false) seen: Boolean?,
            @RequestParam(required = false) bookmark: Boolean?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam(required = false) before: Long?,
            @RequestParam(required = false) after: Long?
    ): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        return service.list(currentUserIdOrNull(), company, stages, types, seen, bookmark, hidden, before, after).fetchPage(EventController.PREVIEW, pageable).response()
    }

    @GetMapping("count")
    fun getCount(
            @PathVariable("id") company: Long,
            @RequestParam(defaultValue = "published") stages: Set<Publication.Stage>,
            @RequestParam(required = false) types: Set<Event.Type>?,
            @RequestParam(required = false) seen: Boolean?,
            @RequestParam(required = false) bookmark: Boolean?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam(required = false) before: Long?,
            @RequestParam(required = false) after: Long?
    ): Count {
        return Count(service.count(currentUserIdOrNull(), company, stages, types, seen, bookmark, hidden, before, after).fetchSingle().value1())
    }
}