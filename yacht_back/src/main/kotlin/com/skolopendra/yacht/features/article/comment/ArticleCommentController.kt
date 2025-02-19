package com.skolopendra.yacht.features.article.comment

import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserId
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.getReference
import com.skolopendra.yacht.jooq.Tables
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import javax.persistence.EntityManager
import javax.validation.Valid
import javax.validation.constraints.Size

@RestController
@RequestMapping("/articles/{id}/comments")
class ArticleCommentController(
        private val commentService: CommentService,
        private val entityManager: EntityManager,
        private val commentSchema: CommentSchema
) {
    @GetMapping
    fun get(@PathVariable id: Long): List<GraphResult> {
        return commentSchema.graph(currentUserIdOrNull()).apply { query.addConditions(Tables.COMMENT.ARTICLE_ID.eq(id)) }.fetch(CommentController.IN_ARTICLE)
    }

    data class PostCommentRequest(
            @get:Size(max = 1000)
            val content: String
    )

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun post(@PathVariable id: Long, @Valid @RequestBody request: PostCommentRequest): GraphResult {
        val comment = commentService.postComment(entityManager.getReference(id), null, currentUser(), request.content)
        return commentSchema.graph(currentUserId()).apply { query.addConditions(Tables.COMMENT.ID.eq(comment.id)) }.fetchSingle(CommentController.IN_ARTICLE)
    }

    @PostMapping("{parent}/reply")
    @ResponseStatus(HttpStatus.CREATED)
    fun postReply(@PathVariable id: Long, @PathVariable parent: Long, @Valid @RequestBody request: PostCommentRequest): GraphResult {
        val comment = commentService.postComment(entityManager.getReference(id), parent, currentUser(), request.content)
        return commentSchema.graph(currentUserId()).apply { query.addConditions(Tables.COMMENT.ID.eq(comment.id)) }.fetchSingle(CommentController.IN_ARTICLE)
    }
}