package com.skolopendra.yacht.features.admin

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.i18n.Locale
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.getSortOrder
import com.skolopendra.yacht.features.user.*
import com.skolopendra.yacht.features.user.PrivateUserController.Companion.FULL_GRAPH
import com.skolopendra.yacht.jooq.Tables
import org.jooq.JoinType
import org.jooq.impl.DSL
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.annotation.Secured
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import java.sql.Timestamp

@Validated
@RestController
@Secured(Roles.SUPERUSER)
@RequestMapping("administration/users")
class AdminUserController(
        private val userRepository: UserGraph,
        private val userService: UserService,
        private val userManagementService: UserManagementService
) {
    @GetMapping
    fun getAdmin(
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam("role", required = false) role: String?,
            @RequestParam(defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam(defaultValue = "exclude") banned: TriStateFilter,
            @RequestParam(name = "company", defaultValue = "false") company: Boolean,
            @RequestParam(name = "sub", required = false) sub: Boolean?,
            @RequestParam(name = "memberOf", required = false) memberOf: Long?,
            @RequestParam("order", defaultValue = "name") order: UserOrder,
            @RequestParam("locale", defaultValue = "ALL") locale: Locale,
            @RequestParam("asc", defaultValue = "false") asc: Boolean,
            @RequestParam("rating-after", required = false) ratingAfter: Long?,
            @RequestParam("rating-before", required = false) ratingBefore: Long?,
            @RequestParam("all-admins", defaultValue = "true") allAdmins: Boolean
    ): PageResponse<GraphResult> {

        val pageable = PageRequest.of(page, 10)
        val graph = userRepository.get(null, null, hidden.value)

        if (!allAdmins) {
            graph.apply { query.addConditions(Tables.USER.IS_COMPANY.eq(company)) }
        }

        if (banned.value != null)
            graph.apply { query.addConditions(Tables.USER.IS_BANNED.eq(banned.value)) }

        if (role != null)
            graph.apply { query.addJoin(Tables.USER_ROLE, JoinType.LEFT_SEMI_JOIN, Tables.USER_ROLE.ROLE_NAME.eq(role), Tables.USER_ROLE.USER_ID.eq(Tables.USER.ID)) }

        if (memberOf != null)
            graph.apply { query.addJoin(Tables.COMPANY_MEMBERSHIP, JoinType.LEFT_SEMI_JOIN, Tables.COMPANY_MEMBERSHIP.COMPANY_ID.eq(memberOf), Tables.COMPANY_MEMBERSHIP.USER_ID.eq(Tables.USER.ID)) }

        userRepository.order(graph, order, getSortOrder(asc), locale, company, if (ratingAfter != null) Timestamp(ratingAfter) else null, if (ratingBefore != null) Timestamp(ratingBefore) else null, admin = true, allAdmins = allAdmins)

        when (order) {
            UserOrder.NAME -> {
                if (locale != Locale.ALL) {
                    val regexLanguagePattern = if (locale == Locale.ENGLISH) {
                        "^[A-Za-z0-9(){},.:;$#!?+\"-]*$"
                    } else {
                        "(?i)(.*(?:[а-я|А-Я]).*)"
                    }

                    if (!allAdmins) {
                        if (company) {
                            graph.where(DSL.replace(Tables.USER.COMPANY_NAME, DSL.inline(" "), DSL.inline("")).likeRegex(regexLanguagePattern))
                        } else {
                            graph.where(DSL.replace(Tables.USER.FIRST_NAME, DSL.inline(" "), DSL.inline("")).likeRegex(regexLanguagePattern))
                        }
                    } else {
                        graph.where(DSL.replace(UserGraph.namesOfUserAndCompanies().field("users", String::class.java), DSL.inline(" "), DSL.inline("")).likeRegex(regexLanguagePattern))
                    }
                }
            }

            else -> {}
        }

        return graph.fetchPage(FULL_GRAPH, pageable).response()
    }

    @GetMapping("stats")
    fun getActivities(
            @RequestParam("after", required = false) after: Long?,
            @RequestParam("before", required = false) before: Long?
    ): AdminSchema {
        return userService.getUserActivities(Timestamp(after ?: 0), Timestamp(before ?: System.currentTimeMillis()))
    }

    @PostMapping("{id}/pin")
    fun fixUser(@PathVariable("id") user: User) = userManagementService.pin(user)

    @DeleteMapping("{id}/pin")
    fun unfixUser(@PathVariable("id") user: User) = userManagementService.unpin(user)
}
