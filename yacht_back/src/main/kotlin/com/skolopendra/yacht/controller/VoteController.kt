package com.skolopendra.yacht.controller

import com.skolopendra.yacht.features.article.Article
import com.skolopendra.yacht.features.article.comment.Comment
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserId
import com.skolopendra.yacht.service.VoteService
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.annotation.*

@RestController
class VoteController(
        private val voteService: VoteService
) {
    data class Vote(val value: Short)

    /**
     * Vote the article up or down
     */
    @PostMapping("/articles/{id}/vote")
    fun postArticleVote(@PathVariable("id") article: Article, @RequestBody vote: Vote) {
        require(vote.value == 1.toShort() || vote.value == (-1).toShort())
        if (currentUserId() == article.author.id) throw AccessDeniedException("cannot vote on your own posts")
        voteService.addArticleVote(currentUser(), article, vote.value)
    }

    /**
     * Remove your vote
     */
    @DeleteMapping("/articles/{id}/vote")
    fun deleteArticleVote(@PathVariable("id") article: Article) {
        voteService.removeArticleVote(currentUser(), article)
    }

    /**
     * Vote on a comment
     */
    @PostMapping("/comments/{id}/vote")
    fun postCommentVote(@PathVariable("id") comment: Comment, @RequestBody vote: Vote) {
        require(vote.value == 1.toShort() || vote.value == (-1).toShort())
        if (currentUserId() == comment.author.id) throw AccessDeniedException("cannot vote on your own posts")
        voteService.addCommentVote(currentUser(), comment, vote.value)
    }

    /**
     * Remove vote from comment
     */
    @DeleteMapping("/comments/{id}/vote")
    fun deleteCommentVote(@PathVariable("id") comment: Comment) {
        voteService.removeCommentVote(currentUser(), comment)
    }
}