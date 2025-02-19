package com.skolopendra.yacht.service

import com.skolopendra.yacht.features.article.Article
import com.skolopendra.yacht.features.article.ArticleVote
import com.skolopendra.yacht.features.article.ArticleVoteRepository
import com.skolopendra.yacht.features.article.comment.Comment
import com.skolopendra.yacht.features.article.comment.CommentVote
import com.skolopendra.yacht.features.article.comment.CommentVoteRepository
import com.skolopendra.yacht.features.user.User
import org.hibernate.exception.ConstraintViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class VoteService(
        private val articleVoteRepository: ArticleVoteRepository,
        private val commentVoteRepository: CommentVoteRepository
) {
    fun addArticleVote(user: User, article: Article, value: Short) {
        try {
            articleVoteRepository.save(ArticleVote(value, user, article))
        } catch (ex: ConstraintViolationException) {
        }
    }

    @Transactional
    fun removeArticleVote(user: User, article: Article) {
        articleVoteRepository.deleteByUserAndArticle(user, article)
    }

    fun addCommentVote(user: User, comment: Comment, value: Short) {
        try {
            commentVoteRepository.save(CommentVote(value, user, comment))
        } catch (ex: ConstraintViolationException) {
        }
    }

    @Transactional
    fun removeCommentVote(user: User, comment: Comment) {
        commentVoteRepository.deleteByUserAndComment(user, comment)
    }
}
