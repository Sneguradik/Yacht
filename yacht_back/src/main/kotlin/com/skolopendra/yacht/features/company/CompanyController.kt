package com.skolopendra.yacht.features.company

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.i18n.Locale
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.annotations.CompanyAccount
import com.skolopendra.yacht.entity.getSortOrder
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserId
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemStatService
import com.skolopendra.yacht.features.user.*
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.SearchService
import org.jooq.impl.DSL
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.AccessDeniedException
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.sql.Timestamp
import javax.persistence.EntityNotFoundException

@RestController
@RequestMapping("/companies")
class CompanyController(
        private val companyService: CompanyService,
        private val companyRepository: UserGraph,
        private val searchService: SearchService,
        private val authorHideRepository: AuthorHideRepository,
        private val users: UserRepository
) {
    companion object {
        val PREVIEW = UserController.PREVIEW with {
            +"jobCount"
            +"eventCount"
        }
        val PROFILE = UserController.PROFILE with {
            +"jobCount"
            +"eventCount"
        }
    }

    // should return full company data if user has one
    // should throw if user has no company
    @GetMapping("me")
    @CompanyAccount
    fun userCompany(): GraphResult {
        val userId = currentUserId()
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        return companyRepository.get(userId, null).apply { query.addConditions(Tables.USER.ID.eq(userId)) }.fetchSingle(PROFILE)
    }

    // should create company for user if there isn't one
    // should throw if user already has company
    /*@PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create() {
        companyService.create(currentUser())
    }*/

    // should return public company data if one with id exists
    // should throw if it doesn't exist
    @GetMapping("{id}")
    fun get(@PathVariable id: Long): GraphResult {
        users.findFirstByIdAndIsDeletedIsFalse(id) ?: throw EntityNotFoundException("User not found")
        return companyRepository.get(currentUserIdOrNull(), null, null).apply { query.addConditions(Tables.USER.ID.eq(id)) }.fetchSingle(PROFILE)
    }

    // should return all existing companies
    @GetMapping
    fun getPage(
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam("sub", required = false) sub: Boolean?,
            @RequestParam("query", required = false) searchQuery: String?,
            @RequestParam("order", defaultValue = "name") order: UserOrder,
            @RequestParam("locale", defaultValue = "ALL") locale: Locale,
            @RequestParam("asc", defaultValue = "false") asc: Boolean,
            @RequestParam(defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam(defaultValue = "exclude") banned: TriStateFilter,
            @RequestParam("rating-after", required = false) ratingAfter: Long?,
            @RequestParam("rating-before", required = false) ratingBefore: Long?
    ): PageResponse<GraphResult> {
        val userId = currentUserIdOrNull()
        val pageable = PageRequest.of(page, 10)
        val graph = companyRepository.get(userId, sub, hidden.value)
        if (banned.value != null)
            graph.apply { query.addConditions(Tables.USER.IS_BANNED.eq(banned.value)) }
        graph.query.addConditions(Tables.USER.IS_COMPANY.isTrue, Tables.USER.COMPANY_CONFIRMED.isTrue)
        if (searchQuery != null)
            searchService.companySearchQuery(graph.query, searchQuery)
        else
            companyRepository.order(graph, order, getSortOrder(asc), locale, true, if (ratingAfter != null) Timestamp(ratingAfter) else null, if (ratingBefore != null) Timestamp(ratingBefore) else null)

        when (order) {
            UserOrder.NAME -> {
                if (locale != Locale.ALL) {
                    val regexLanguagePattern = if (locale == Locale.ENGLISH) {
                        "^[A-Za-z0-9(){},.:;$#!?+\"-]*$"
                    } else {
                        "(?i)(.*(?:[а-я|А-Я]).*)"
                    }

                    graph.where(DSL.replace(Tables.USER.COMPANY_NAME, DSL.inline(" "), DSL.inline("")).likeRegex(regexLanguagePattern))
                }
            }

            else -> {}
        }

        return graph.fetchPage(PREVIEW, pageable).response()
    }

    @PostMapping("{id}/hide")
    fun authorHide(@PathVariable("id") author: User) {
        if(author.isDeleted)
            throw EntityNotFoundException("User not found")
        authorHideRepository.save(AuthorHide(currentUser(), author))
    }

    @Transactional
    @DeleteMapping("{id}/hide")
    fun authorShow(@PathVariable("id") author: User) {
        if (author.isDeleted)
            throw EntityNotFoundException("User not found")
        authorHideRepository.deleteByUserAndAuthor(currentUser(), author)
    }

    @PostMapping("{id}/subscribe")
    fun userSubscribe(@PathVariable("id") user: User) {
        if(user.isDeleted)
            throw EntityNotFoundException("User not found")
        if (currentUserId() == user.id) throw AccessDeniedException("cannot subscribe on own account")
        companyService.userSubscribe(currentUser(), user)
    }

    @DeleteMapping("{id}/subscribe")
    fun userUnsubscribe(@PathVariable("id") user: User) {
        if(user.isDeleted)
            throw EntityNotFoundException("User not found")
        companyService.userUnsubscribe(currentUser(), user)
    }
}
