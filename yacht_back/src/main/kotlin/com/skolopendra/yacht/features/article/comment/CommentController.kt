package com.skolopendra.yacht.features.article.comment

import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.yacht.access.annotations.Owner
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.Html
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.features.user.UserController
import com.skolopendra.yacht.jooq.Tables
import org.hibernate.validator.constraints.Length
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*
import javax.persistence.EntityManager
import javax.validation.Valid

@RestController
@RequestMapping("/comments/{id}")
class CommentController(
        val commentService: CommentService,
        private val commentSchema: CommentSchema
) {
    companion object {
        val BASE = selectTree {
            "meta" { +"id"; +"createdAt"; +"updatedAt"; +"deletedAt" }
            "votes" { +"up"; +"down"; +"you" }
            "owner"(UserController.SHORT)
            +"html"
            +"watch"
        }
        val IN_ARTICLE = BASE with {
            "parent" {
                "meta" { +"id" }
            }
        }
        val IN_USER_PAGE = BASE with {
            "parent" {
                "meta" { +"id"; +"createdAt"; +"updatedAt" }
                "owner" {
                    "meta" { +"id"; +"createdAt"; +"updatedAt" }
                    "info" {
                        +"firstName"
                        +"lastName"
                        +"picture"
                        +"username"
                        +"bio"
                        "company" { +"isCompany"; +"confirmed"; +"name" }
                    }
                }
            }
            "context" {
                "meta" { +"id"; +"createdAt"; +"updatedAt" }
                +"title"
            }
        }
    }

    data class Source(
            @get:Length(max = 4096)
            val source: String
    )

    @GetMapping
    fun getComment(@PathVariable id: Long): GraphResult {
        return commentSchema.graph(currentUserIdOrNull()).apply { query.addConditions(Tables.COMMENT.ID.eq(id)) }.fetchSingle(IN_USER_PAGE)
    }

    @Secured(Roles.CHIEF_EDITOR)
    @Owner
    @GetMapping("source")
    fun getSource(@PathVariable("id") comment: Comment): Source {
        return Source(comment.editableData)
    }

    @Secured(Roles.CHIEF_EDITOR)
    @Owner
    @PutMapping("source")
    fun updateSource(@PathVariable("id") comment: Comment, @Valid @RequestBody request: Source): Html {
        commentService.editComment(comment, request.source)

        return Html(comment.renderedHtml)
    }

    /**
     * Delete a comment
     */
    @Secured(Roles.CHIEF_EDITOR)
    @Owner
    @DeleteMapping
    fun delete(@PathVariable("id") comment: Comment) {
        commentService.deleteComment(comment)
    }

    @PostMapping("watch")
    fun watch(@PathVariable("id") comment: Comment) {
        commentService.watch(currentUser(), comment)
    }

    @DeleteMapping("watch")
    fun unwatch(@PathVariable("id") comment: Comment) {
        commentService.unwatch(currentUser(), comment)
    }
}