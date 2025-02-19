package com.skolopendra.yacht.features.article.comment

import com.skolopendra.yacht.event.CommentPostedEvent
import com.skolopendra.yacht.features.article.Article
import com.skolopendra.yacht.features.user.User
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.time.Instant

@Service
class CommentService(
        private val commentRepository: CommentRepository,
        private val commentWatchRepository: CommentWatchRepository,
        private val eventPublisher: ApplicationEventPublisher,
        private val renderService: CommentRenderService
) {
    fun postComment(article: Article, parentId: Long?, author: User, content: String): Comment {
        val parent = if (parentId != null) {
            commentRepository.findById(parentId).orElseThrow { NoSuchElementException("Parent comment not found") }
        } else null
        val comment = commentRepository.save(Comment(
                author = author,
                editableData = content,
                renderedHtml = "",
                parentComment = parent,
                article = article
        ))
        renderService.render(comment, true)
        val savedComment = commentRepository.save(comment)
        eventPublisher.publishEvent(CommentPostedEvent(savedComment))
        return savedComment
    }

    fun editComment(comment: Comment, content: String) {
        comment.editableData = content
        renderService.render(comment, false)
        commentRepository.save(comment)
    }

    fun deleteComment(comment: Comment) {
        comment.deletedAt = Timestamp.from(Instant.now())
        commentRepository.save(comment)
    }

    fun count(user: User): Long {
        return commentRepository.countByAuthorAndDeletedAtIsNull(user)
    }

    fun watch(user: User, comment: Comment) {
        commentWatchRepository.save(CommentWatch(user, comment))
    }

    @Transactional
    fun unwatch(user: User, comment: Comment) {
        commentWatchRepository.deleteByUserAndComment(user, comment)
    }
}
