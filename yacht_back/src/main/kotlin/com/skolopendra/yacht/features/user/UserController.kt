package com.skolopendra.yacht.features.user

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.SelectTreeNode
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.lib.i18n.Locale
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.getSortOrder
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.article.ArticleRepository
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserId
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemStatService
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemType
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.RankingService
import com.skolopendra.yacht.service.SearchService
import org.jooq.JoinType
import org.jooq.impl.DSL
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import java.sql.Timestamp
import javax.persistence.EntityNotFoundException

@Validated
@RestController
@RequestMapping("/users")
class UserController(
        private val searchService: SearchService,
        private val userRepository: UserGraph,
        private val users: UserRepository,
        private val authorHideRepository: AuthorHideRepository,
        private val articles: ArticleRepository,
        private val userService: UserService,
        private val rankingService: RankingService,
        private val showcaseStaticItemStatService: ShowcaseStaticItemStatService
) {
    companion object {
        val META = selectTree { +"id"; +"createdAt"; +"updatedAt" }
        val SHORT = selectTree {
            "meta"(META)
            "info" {
                +"firstName"
                +"lastName"
                +"picture"
                +"username"
                +"bio"
                "company" { +"isCompany"; +"confirmed"; +"name" }
            }
        }
        val PREVIEW = SHORT with {
            "subscribers" {
                +"count"
                +"you"
            }
            +"rating"
            +"postCount"
            +"banned"
            +"hidden"
            +"pinned"
            +"roles"
        }
        val PROFILE = PREVIEW with {
            "profile" {
                +"cover"
                +"fullDescription"
            }
            "contacts" {
                +"email"
                +"phone"
                +"phoneAlt"
                +"websiteUrl"
                +"geolocation"
                +"instagram"
                +"vk"
                +"facebook"
                +"twitter"
                +"youtube"
                +"linkedIn"
                +"telegram"
            }
        }
    }

    @GetMapping
    fun get(
            @RequestParam(defaultValue = "0") page: Int,
            @RequestParam(name = "sub", required = false) sub: Boolean?,
            @RequestParam(name = "company", defaultValue = "false") company: Boolean,
            @RequestParam(name = "memberOf", required = false) memberOf: Long?,
            @RequestParam(name = "query", required = false) searchQuery: String?,
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
        val graph = userRepository.get(userId, sub, hidden.value)
        if (banned.value != null)
            graph.apply { query.addConditions(Tables.USER.IS_BANNED.eq(banned.value)) }
        graph.apply { query.addConditions(Tables.USER.IS_COMPANY.eq(company), DSL.not(Tables.USER.IS_COMPANY.isTrue.and(Tables.USER.COMPANY_CONFIRMED.isTrue.not()))) }
        if (memberOf != null)
            graph.apply { query.addJoin(Tables.COMPANY_MEMBERSHIP, JoinType.LEFT_SEMI_JOIN, Tables.COMPANY_MEMBERSHIP.COMPANY_ID.eq(memberOf), Tables.COMPANY_MEMBERSHIP.USER_ID.eq(Tables.USER.ID)) }
        if (searchQuery != null)
            searchService.userSearchQuery(graph.query, searchQuery)
        else {
            // TODO: Перенести в конфиг для того чтобы не заниматься умножениями ._.
            val days = ((rankingService.getDays() ?: 1F) * 86400000).toLong()
            val before = if (ratingBefore != null) Timestamp(ratingBefore) else Timestamp((System.currentTimeMillis() + days))
            userRepository.order(graph, order, getSortOrder(asc), locale, company, if (ratingAfter != null) Timestamp(ratingAfter) else null, before)
        }

        when(order) {
            UserOrder.NAME -> {
                if (locale != Locale.ALL) {
                    val regexLanguagePattern = if (locale == Locale.ENGLISH) {
                        "^[A-Za-z0-9(){},.:;$#!?+\"-]*$"
                    } else {
                        "(?i)(.*(?:[а-я|А-Я]).*)"
                    }

                    if (company) {
                        graph.where(DSL.replace(Tables.USER.COMPANY_NAME, DSL.inline(" "), DSL.inline("")).likeRegex(regexLanguagePattern))
                    } else {
                        graph.where(DSL.replace(Tables.USER.FIRST_NAME, DSL.inline(" "), DSL.inline("")).likeRegex(regexLanguagePattern))
                    }
                }
            }

            else -> {}
        }

        return graph.fetchPage(PREVIEW, pageable).response()
    }

    /**
     * Returns data about user by ID
     */
    @GetMapping("id{userId:\\d+}")
    fun byId(@PathVariable userId: Long): GraphResult {
        users.findFirstByIdAndIsDeletedIsFalse(userId) ?: throw EntityNotFoundException("User not found")
        return userRepository.get(currentUserIdOrNull(), null, null).apply { query.addConditions(Tables.USER.ID.eq(userId)) }
            .fetchSingle(profileGraphSelect())
    }

    /**
     * Returns data about user by username
     */
    @GetMapping("{username}")
    fun byUsername(@PathVariable username: String): GraphResult {
        users.findFirstByUsernameIgnoreCaseAndIsDeletedIsFalse(username) ?: throw EntityNotFoundException("User not found")
        return userRepository.get(currentUserIdOrNull(), null, null)
            .apply { query.addConditions(Tables.USER.USERNAME.likeIgnoreCase(username)) }
            .fetchSingle(profileGraphSelect())
    }

    fun profileGraphSelect(): SelectTreeNode =
            if (SecurityContextHolder.getContext().authentication.authorities.any { it.authority == Roles.SUPERUSER || it.authority == Roles.CHIEF_EDITOR })
                PrivateUserController.FULL_GRAPH
            else
                PROFILE

    @PostMapping("{id}/hide")
    fun authorHide(@PathVariable("id") author: User) {
        if(author.isDeleted)
            throw EntityNotFoundException("User not found")
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        authorHideRepository.save(AuthorHide(currentUser(), author))
    }

    @Transactional
    @DeleteMapping("{id}/hide")
    fun authorShow(@PathVariable("id") author: User) {
        if(author.isDeleted)
            throw EntityNotFoundException("User not found")
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        authorHideRepository.deleteByUserAndAuthor(currentUser(), author)
    }

    @PostMapping("{id}/subscribe")
    fun userSubscribe(@PathVariable("id") user: User) {
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        if (currentUserId() == user.id) throw AccessDeniedException("cannot subscribe on own account")
        userService.userSubscribe(currentUser(), user)
        showcaseStaticItemStatService.upsertStats(user.id, itemType = ShowcaseStaticItemType.AUTHOR, currentSubscribersCount = userService.getCountOfSubscribers(user), currentPostsCount = articles.countByAuthorAndPublicationStage(user, Publication.Stage.PUBLISHED))

    }

    @DeleteMapping("{id}/subscribe")
    fun userUnsubscribe(@PathVariable("id") user: User) {
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        userService.userUnsubscribe(currentUser(), user)
        showcaseStaticItemStatService.upsertStats(user.id, itemType = ShowcaseStaticItemType.AUTHOR, currentSubscribersCount = userService.getCountOfSubscribers(user), currentPostsCount = articles.countByAuthorAndPublicationStage(user, Publication.Stage.PUBLISHED))

    }
}
