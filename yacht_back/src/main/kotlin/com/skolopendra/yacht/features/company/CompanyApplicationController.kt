package com.skolopendra.yacht.features.company

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.annotations.CompanyAccount
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserId
import com.skolopendra.yacht.features.user.UserController
import com.skolopendra.yacht.jooq.Tables
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*
import javax.persistence.EntityNotFoundException

@RestController
@Secured(Roles.CHIEF_EDITOR)
@RequestMapping("/companies/applications")
class CompanyApplicationController(
        private val reviewService: CompanyReviewService,
        private val applicationRepository: CompanyApplicationRepositoryCustom
) {
    companion object {
        val META = selectTree { +"id"; +"createdAt"; +"updatedAt" }
        val SHORT = selectTree {
            "meta"(META)
            "application" {
                +"status"
            }
            "company" {
                "meta" { +"id" }
            }
        }
        val PREVIEW = SHORT with {
            "application" {
                +"message"
                +"rejectionReason"
            }
            "company"(UserController.PREVIEW)
        }
    }

    data class ApplyRequest(
            val message: String
    )

    // should create review application for company
    // can only be called if you are owner of company
    // can only be called if there is no application for this company that is under review
    @PostMapping
    @CompanyAccount
    @Secured(Roles.USER)
    fun apply(@RequestBody request: ApplyRequest) {
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        reviewService.apply(currentUser(), request.message)
    }

    // should return a list of your applications
    @GetMapping("me")
    @CompanyAccount
    @Secured(Roles.USER)
    fun me(@RequestParam(defaultValue = "0") page: Int): PageResponse<GraphResult> {
        val userId = currentUserId()
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        val graph = applicationRepository.graph(userId).apply { query.addConditions(Tables.COMPANY_APPLICATION.COMPANY_ID.eq(userId)) }
        return graph.fetchPage(PREVIEW, PageRequest.of(page, 10)).response()
    }

    // should return a single application
    // can only be called by submitter or admin or TODO: company reviewer
    @GetMapping("{id}")
    fun get(@PathVariable id: Long): GraphResult {
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        val graph = applicationRepository.graph(currentUserId()).apply { query.addConditions(Tables.COMPANY_APPLICATION.COMPANY_ID.eq(id)) }
        return graph.fetchSingle(PREVIEW)
    }

    // should return a paginated list of all applications
    // can only be called by admin or TODO: company reviewer
    @GetMapping
    fun getAll(@RequestParam(defaultValue = "0") page: Int): PageResponse<GraphResult> {
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        val graph = applicationRepository.graph(currentUserId())
        return graph.fetchPage(PREVIEW, PageRequest.of(page, 10)).response()
    }

    // should mark the application as being reviewed
    // can only be called if application is waiting for review
    // can only be called by admin or TODO: company reviewer
    @PostMapping("{id}/start")
    fun startReview(@PathVariable id: Long) {
        reviewService.start(id)
    }

    // should mark the application as accepted
    // can only be called if application is waiting for review or being reviewed
    // can only be called by admin or TODO: company reviewer
    @PostMapping("{id}/accept")
    fun accept(@PathVariable id: Long) {
        reviewService.accept(id)
    }

    data class RejectRequest(
            val reason: String
    )

    // should mark the application as rejected
    // can only be called if application is waiting for review or being reviewed
    // can only be called by admin or TODO: company reviewer
    @PostMapping("{id}/reject")
    fun reject(@PathVariable id: Long, @RequestBody request: RejectRequest) {
        reviewService.reject(id, request.reason)
    }
}
