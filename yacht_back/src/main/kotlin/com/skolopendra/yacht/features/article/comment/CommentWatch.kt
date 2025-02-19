package com.skolopendra.yacht.features.article.comment

import com.skolopendra.yacht.features.user.User
import java.io.Serializable
import javax.persistence.*

@Embeddable
data class CommentWatchId(var userId: Long, var commentId: Long) : Serializable

@Entity
@Table(name = "comment_watch")
class CommentWatch(
        @EmbeddedId
        val id: CommentWatchId,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("userId")
        val user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("commentId")
        val comment: Comment
) {
    constructor(user: User, comment: Comment) : this(CommentWatchId(user.id, comment.id), user, comment)
}
