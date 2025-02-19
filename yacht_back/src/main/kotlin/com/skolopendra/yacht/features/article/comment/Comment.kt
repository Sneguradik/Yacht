package com.skolopendra.yacht.features.article.comment

import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.article.Article
import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "comment")
class Comment(
        author: User,

        /** Used for soft deletion */
        var deletedAt: Timestamp? = null,

        @ManyToOne(fetch = FetchType.LAZY)
        val article: Article,

        /**
         * Refers to the parent comment if this comment is a reply, is null if the comment is posted for article itself
         */
        @ManyToOne(optional = true, fetch = FetchType.LAZY)
        @JoinColumn(name = "parentCommentId")
        val parentComment: Comment?,

        /**
         * HTML that will be shown to user
         */
        @Column(columnDefinition = "TEXT")
        @Basic(fetch = FetchType.LAZY)
        var renderedHtml: String,

        /**
         * Data required to store the comment in editable format that will be rendered into HTML
         */
        @Column(columnDefinition = "TEXT")
        @Basic(fetch = FetchType.LAZY)
        var editableData: String,

        @OneToMany(cascade = [CascadeType.ALL], fetch = FetchType.LAZY, mappedBy = "comment", orphanRemoval = true)
        val votes: List<CommentVote> = emptyList()
) : Publication(author = author)
