package com.skolopendra.yacht.features.article.comment

import com.skolopendra.yacht.entity.vote.Vote
import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.SQLInsert
import javax.persistence.*

@Entity
@Table(
        name = "comment_vote",
        uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "comment_id"])]
)
@SQLInsert(sql = "INSERT INTO comment_vote (user_id, value, comment_id) VALUES (?, ?, ?) ON CONFLICT (user_id, comment_id) DO UPDATE SET value = EXCLUDED.value")
class CommentVote(
        value: Short,
        user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "comment_id")
        val comment: Comment
) : Vote(value = value, user = user)
