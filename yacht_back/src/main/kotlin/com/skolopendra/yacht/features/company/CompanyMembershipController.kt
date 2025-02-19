package com.skolopendra.yacht.features.company

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.annotations.Owner
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserController
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*
import javax.persistence.EntityNotFoundException

@RestController
@RequestMapping("/companies/{id}/members")
class CompanyMembershipController(
        val service: CompanyMembershipService
) {
    @GetMapping
    fun get(@PathVariable("id") company: User, @RequestParam("page", defaultValue = "0") page: Int): PageResponse<GraphResult> {
        if(company.isDeleted)
            throw EntityNotFoundException("User not found")
        return service.listMembersGraph(company, currentUserIdOrNull()).fetchPage(UserController.PREVIEW, PageRequest.of(page, 10)).response()
    }

    @Owner
    @PostMapping("{memberId}")
    fun add(@PathVariable("id") company: User, @PathVariable("memberId") member: User) {
        if(company.isDeleted)
            throw EntityNotFoundException("User not found")
        service.add(company, member)
    }

    @Owner
    @DeleteMapping("{memberId}")
    fun remove(@PathVariable("id") company: User, @PathVariable("memberId") member: User) {
        if(company.isDeleted)
            throw EntityNotFoundException("User not found")
        service.remove(company, member)
    }

    @DeleteMapping("self")
    fun leave(@PathVariable("id") company: User) {
        if(company.isDeleted)
            throw EntityNotFoundException("User not found")
        service.remove(company, currentUser())
    }
}
