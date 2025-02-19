package com.skolopendra.yacht.features.job

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.annotations.CompanyAccount
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.Count
import com.skolopendra.yacht.controller.common.CreateResponse
import com.skolopendra.yacht.entity.getSortOrder
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.article.JobHide
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.features.auth.currentUserOrNull
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserController
import com.skolopendra.yacht.jooq.Tables
import org.jooq.JoinType
import org.jooq.SortOrder
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/jobs")
class JobController(
        private val jobService: JobService,
        private val jobRepository: JobRepositoryCustom,
        private val jobHideRepository: JobHideRepository,
        private val jobNonUniqueViewService: JobNonUniqueViewService
) {
    companion object {
        val META = selectTree { +"id"; +"createdAt"; +"updatedAt" }
        val PREVIEW = selectTree {
            "meta"(META)
            "info" {
                +"publicationStage"
                +"publishedAt"
                +"name"
                +"minSalary"
                +"maxSalary"
                +"currency"
                +"type"
                +"place"
                +"city"
            }
            "company"(UserController.SHORT)
            "bookmarks" { +"count"; +"you" }
            "views" { +"count"; +"you" }
            +"hidden"
        }
        val FULL = PREVIEW with {
            "info" {
                +"recruiterName"
                +"email"
            }
            "body" {
                +"image"
                +"tasks"
                +"workConditions"
                +"requirements"
            }
        }
    }

    @GetMapping("{id}")
    fun getOne(@PathVariable id: Long): GraphResult {
        jobNonUniqueViewService.markViewed(id)
        return jobRepository.graph(currentUserIdOrNull(), null).apply { query.addConditions(Tables.JOB.ID.eq(id)) }.fetchSingle(FULL)
    }

    @GetMapping("{user}/bookmarks")
    fun getBookmarks(@PathVariable user: User, @RequestParam(defaultValue = "0") page: Int): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        return jobRepository.graph(user.id).apply {
            query.addJoin(Tables.JOB_BOOKMARK,
                    JoinType.LEFT_SEMI_JOIN,
                    Tables.JOB_BOOKMARK.JOB_ID.eq(Tables.JOB.ID),
                    Tables.JOB_BOOKMARK.USER_ID.eq(user.id))
        }.fetchPage(PREVIEW, pageable).response()
    }

    /**
     * List all existing jobs with pagination
     */
    @GetMapping
    fun getPage(
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(required = false) company: Long?,
            @RequestParam(defaultValue = "PUBLISHED") stages: Set<Publication.Stage>,
            @RequestParam(required = false) seen: Boolean?,
            @RequestParam(required = false) bookmark: Boolean?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam("order", defaultValue = "name") order: JobOrder,
            @RequestParam("asc", defaultValue = "false") asc: Boolean
    ): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        return jobService.list(currentUserIdOrNull(), company, stages, seen, bookmark, hidden, order, getSortOrder(asc)).fetchPage(PREVIEW, pageable).response()
    }

    @GetMapping("count")
    fun getCount(
            @RequestParam(required = false) company: Long?,
            @RequestParam(defaultValue = "PUBLISHED") stages: Set<Publication.Stage>,
            @RequestParam(required = false) seen: Boolean?,
            @RequestParam(required = false) bookmark: Boolean?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam("order", defaultValue = "name") order: JobOrder,
            @RequestParam("asc", defaultValue = "false") asc: Boolean
    ): Count {
        return Count(jobService.count(currentUserIdOrNull(), company, stages, seen, bookmark, hidden, order, getSortOrder(asc)).fetchSingle().value1())
    }

    /**
     * Creates a new job
     */
    @Secured(Roles.CHIEF_EDITOR)
    @CompanyAccount
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(): CreateResponse =
            CreateResponse(jobService.create(currentUser()).id)

    @PostMapping("{id}/bookmark")
    @ResponseStatus(HttpStatus.CREATED)
    fun bookmarkAdd(@PathVariable("id") job: Job) {
        jobService.bookmarkAdd(currentUser(), job)
    }

    @DeleteMapping("{id}/bookmark")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun bookmarkRemove(@PathVariable("id") job: Job) {
        jobService.bookmarkRemove(currentUser(), job)
    }

    @PostMapping("{id}/view")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun storeView(@PathVariable("id") job: Job, @RequestParam("f", required = false) fingerprint: Optional<String>) {
        val user = currentUserOrNull()
        if (user == null)
            require(fingerprint.isPresent)
        jobService.storeView(job, user, if (user != null) null else fingerprint.get())
    }

    @PostMapping("{id}/hide")
    fun articleHide(@PathVariable("id") job: Job) {
        jobHideRepository.save(JobHide(currentUser(), job))
    }

    @Transactional
    @DeleteMapping("{id}/hide")
    fun articleShow(@PathVariable("id") job: Job) {
        jobHideRepository.deleteByUserAndJob(currentUser(), job)
    }
}
