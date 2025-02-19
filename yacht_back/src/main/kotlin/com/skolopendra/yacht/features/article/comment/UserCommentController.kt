package com.skolopendra.yacht.features.article.comment

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.response
import com.skolopendra.yacht.controller.common.Count
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.jooq.JoinType
import org.jooq.impl.DSL
import org.jooq.impl.DSL.sum
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/users/{id}/comments", "/companies/{id}/comments")
class UserCommentController(
    val commentSchema: CommentSchema,
    private val dsl: DSLContext,
    val commentService: CommentService
) {
    @GetMapping
    fun get(
        @PathVariable id: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "RATING", required = false) order: CommentSortOrder
    ): PageResponse<GraphResult> {
        return commentSchema.graph(currentUserIdOrNull()).apply {
            query.addConditions(Tables.COMMENT.AUTHOR_ID.eq(id))
            when(order) {
                CommentSortOrder.CREATED -> query.addOrderBy(Tables.COMMENT.CREATED_AT.desc())
                CommentSortOrder.RATING-> {
                    val commentVote = Tables.COMMENT_VOTE
                    val rating = dsl.select(sum(commentVote.VALUE).`as`("score"), commentVote.COMMENT_ID.`as`("id"))
                        .from(Tables.COMMENT_VOTE)
                        .groupBy(Tables.COMMENT_VOTE.COMMENT_ID)
                        .orderBy(sum(commentVote.VALUE))
                        .asTable()
                        .`as`("rating")
                    query.addJoin(rating, JoinType.LEFT_OUTER_JOIN, DSL.field("rating.id", Long::class.java).eq(Tables.COMMENT.ID))
                    query.addOrderBy(DSL.field("rating.score", Long::class.java).asc())
                }
            }
        }.fetchPage(CommentController.IN_USER_PAGE, PageRequest.of(page, 10)).response()
    }

    @GetMapping("count")
    fun count(@PathVariable("id") user: User): Count {
        return Count(commentService.count(user))
    }
}