package com.skolopendra.yacht.features.article

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.i18n.Locale
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.Count
import com.skolopendra.yacht.entity.getSortOrder
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.auth.currentUserHasAnyRole
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.features.user.UserService
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.SearchService
import org.jooq.impl.DSL
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

enum class ArticleOrder {
    TIME,
    TITLE,
    VIEWS,
    COMMENTS,
    RATING;
}

@RestController
@RequestMapping("/feed")
class FeedController(
        private val schemaService: ArticleSchemaService,
        private val searchService: SearchService,
        private val userService: UserService,
        private val feedService: FeedArticleService
) {
    @GetMapping("count")
    fun count(
//            @RequestParam("page", defaultValue = "0") page: Int,
            @RequestParam("seen", required = false) seen: Boolean?,
            @RequestParam("sub", required = false) sub: Set<SubscriptionFilter>?,
            @RequestParam("stage", defaultValue = "PUBLISHED") stages: Set<Publication.Stage>,
//            @RequestParam("order", defaultValue = "time") order: ArticleOrder,
            @RequestParam("list", required = false) list: String?,
            @RequestParam("bookmark", required = false) bookmark: Boolean?,
            @RequestParam("query", required = false) searchQuery: String?,
//            @RequestParam("asc", defaultValue = "false") asc: Boolean,
            @RequestParam("after", required = false) after: Long?,
            @RequestParam("before", required = false) before: Long?,
//            @RequestParam("views-after", required = false) viewsAfter: Long?,
//            @RequestParam("comments-after", required = false) commentsAfter: Long?,
            @RequestParam("topic", required = false) topic: Long?,
            @RequestParam("tag", required = false) tag: Long?,
            @RequestParam("author", required = false) author: Long?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam("company", required = false) company: Boolean?,
            @RequestParam("bookmarked", required = false) bookmarked: Long?,
            @RequestParam("after-last-online", required = false, defaultValue = "false") afterLastOnline: Boolean
//            @RequestParam("locale", defaultValue = "RUSSIAN") locale: Locale
    ): Count {
        val userId = currentUserIdOrNull()

        val graph = schemaService.graph(userId, null)
        val query = graph.query

        // val query = dsl.selectOne().from(Tables.ARTICLE).query

        schemaService.setup(graph) {
            if (after != null)
                after(after)
            else {
                if(userId != null) {
                    val user = userService.getUserByIdOrNull(userId)
                    if (afterLastOnline && user != null && before == null) {
                        after(user.lastLogin)
                    }
                }
            }
            if (before != null)
                before(before)
            if (topic != null)
                withTopic(topic)
            if (tag != null)
                withTag(tag)
            if (userId != null)
                filterHidden(userId, hidden)
            if (author != null)
                withAuthor(author)
            if (list != null)
                inList(list)
            withStage(stages, userId,
                    userId != null && currentUserHasAnyRole(Roles.SUPERUSER, Roles.CHIEF_EDITOR),
                    userId != null && currentUserHasAnyRole(Roles.SUPERUSER, Roles.CHIEF_EDITOR))
            if (seen != null && userId != null)
                wasSeen(userId, seen)
            if (sub != null && userId != null)
                filterSubscription(userId, sub)
            if (searchQuery != null)
                searchService.articleSearchQuery(query, searchQuery)
            if (company != null)
                withCompany(company)
            if (bookmark != null && (userId !== null || bookmarked !== null)) {
                val bookmarkUserId = bookmarked ?: userId

                if (bookmarkUserId != null) {
                    bookmarkedBy(bookmarkUserId, bookmark)
                }
            }
        }

        return Count(graph.fetchCount())
    }

    /**
     * A single endpoint to retrieve feed from
     * TODO: Rewrite
     */
    @GetMapping
    fun universalFeed(
            @RequestParam("page", defaultValue = "0") page: Int,
            @RequestParam("seen", required = false) seen: Boolean?,
            @RequestParam("sub", required = false) sub: Set<SubscriptionFilter>?,
            @RequestParam("stage", defaultValue = "PUBLISHED") stages: Set<Publication.Stage>,
            @RequestParam("order", defaultValue = "time") order: ArticleOrder,
            @RequestParam("list", required = false) list: String?,
            @RequestParam("bookmark", required = false) bookmark: Boolean?,
            @RequestParam("query", required = false) searchQuery: String?,
            @RequestParam("asc", defaultValue = "false") asc: Boolean,
            @RequestParam("after", required = false) after: Long?,
            @RequestParam("before", required = false) before: Long?,
            @RequestParam("views-after", required = false) viewsAfter: Long?,
            @RequestParam("comments-after", required = false) commentsAfter: Long?,
            @RequestParam("topic", required = false) topic: Long?,
            @RequestParam("tag", required = false) tag: Long?,
            @RequestParam("author", required = false) author: Long?,
            @RequestParam("hidden", defaultValue = "exclude") hidden: TriStateFilter,
            @RequestParam("locale", defaultValue = "ALL") locale: Locale,
            @RequestParam("company", required = false) company: Boolean?,
            @RequestParam("rating-after", required = false) ratingAfter: Long?,
            @RequestParam("rating-before", required = false) ratingBefore: Long?,
            @RequestParam("bookmarked", required = false) bookmarked: Long?,
            @RequestParam("pinned", required = false) pinned: Boolean?
    ): PageResponse<GraphResult> {
        val userId = currentUserIdOrNull()
        val pageable = PageRequest.of(page, 10)

        val graph = schemaService.graph(userId)
        val query = graph.query

        schemaService.setup(graph) {
            if (after != null)
                after(after)
            if (before != null)
                before(before)
            if (topic != null)
                withTopic(topic)
            if (tag != null)
                withTag(tag)
            if (userId != null)
                filterHidden(userId, hidden)
            if (author != null)
                withAuthor(author)
            if (list != null)
                inList(list)
            if (company != null)
                withCompany(company)
            withStage(stages, userId,
                    userId != null && currentUserHasAnyRole(Roles.SUPERUSER, Roles.CHIEF_EDITOR),
                    userId != null && currentUserHasAnyRole(Roles.SUPERUSER, Roles.CHIEF_EDITOR))
            if (seen != null && userId != null)
                wasSeen(userId, seen)
            if (sub != null && userId != null)
                filterSubscription(userId, sub)
            if (searchQuery != null)
                searchService.articleSearchQuery(query, searchQuery)
            else
                order(order, getSortOrder(asc), locale, userId, viewsAfter, commentsAfter, ratingAfter, ratingBefore, pinned, stages) // ratingAfter max
            if (bookmark != null && (userId !== null || bookmarked !== null)) {
                val bookmarkUserId = bookmarked ?: userId

                if (bookmarkUserId != null) {
                    bookmarkedBy(bookmarkUserId, bookmark)
                }
            }
        }

        when (order) {
            ArticleOrder.TITLE -> {
                if (locale != Locale.ALL) {
                    val regexLanguagePattern = if (locale == Locale.ENGLISH) {
                        "^[A-Za-z0-9(){},.:;$#!?+\"-]*$"
                    } else {
                        "(?i)(.*(?:[а-я|А-Я]).*)"
                    }
                    graph.where(DSL.replace(Tables.ARTICLE.TITLE, DSL.inline(" "), DSL.inline("")).likeRegex(regexLanguagePattern))
                }
            }

            else -> {}
        }
        return graph.fetchPage(ArticleController.PREVIEW, pageable).response()
    }

    @GetMapping("count-unread")
    fun getCountUnread(
        @RequestParam(required = false, defaultValue = "NONE") filter: FeedUnreadFilter?,
        @RequestParam(required = false) author: Long?
    ): Count = Count(count = feedService.getUnreadCount(filter!!, author))
}
