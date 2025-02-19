package com.skolopendra.yacht.features.job

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.response
import com.skolopendra.yacht.controller.common.Count
import com.skolopendra.yacht.entity.getSortOrder
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import org.jooq.SortOrder
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/companies/{id}/jobs")
class CompanyJobController(
        private val service: JobService
) {
    @GetMapping
    fun getPage(
            @PathVariable("id") company: Long,
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(defaultValue = "PUBLISHED") stages: Set<Publication.Stage>,
            @RequestParam(required = false) seen: Boolean?,
            @RequestParam(required = false) bookmark: Boolean?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam("order", defaultValue = "name") order: JobOrder,
            @RequestParam("asc", defaultValue = "false") asc: Boolean
    ): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        return service.list(currentUserIdOrNull(), company, stages, seen, bookmark, hidden, order, getSortOrder(asc)).fetchPage(JobController.PREVIEW, pageable).response()
    }

    @GetMapping("count")
    fun getCount(
            @PathVariable("id") company: Long,
            @RequestParam(defaultValue = "PUBLISHED") stages: Set<Publication.Stage>,
            @RequestParam(required = false) seen: Boolean?,
            @RequestParam(required = false) bookmark: Boolean?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam("order", defaultValue = "name") order: JobOrder,
            @RequestParam("asc", defaultValue = "false") asc: Boolean
    ): Count {
        return Count(service.count(currentUserIdOrNull(), company, stages, seen, bookmark, hidden, order, getSortOrder(asc)).fetchSingle().value1())
    }
}