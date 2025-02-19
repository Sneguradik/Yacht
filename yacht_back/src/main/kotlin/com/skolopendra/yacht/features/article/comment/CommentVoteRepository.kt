package com.skolopendra.yacht.features.article.comment

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CommentVoteRepository : JpaRepository<CommentVote, Long> {

    fun deleteByUserAndComment(user: User, comment: Comment): Long
}