package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.article.comment.Comment
import com.skolopendra.yacht.features.tag.ArticleTag
import com.skolopendra.yacht.features.topic.ArticleTopic
import com.skolopendra.yacht.features.user.User
import org.springframework.security.access.AccessDeniedException
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "article")
class Article(
        author: User,

        @Basic(optional = true)
        var title: String? = null,

        /**
         * true if article is published and should be visible to users,
         * false if it is still being edited by author (a draft)
         */
        var publicationStage: Stage = Stage.DRAFT,

        /**
         * Date when the article was first published
         */
        var publishedAt: Timestamp? = null,

        /**
         * HTML that will be shown to user
         */
        @Column(nullable = true, columnDefinition = "TEXT")
        @Basic(fetch = FetchType.LAZY)
        var renderedHtml: String? = null,

        /**
         * Plain text summary of the article, will be shown on the front page
         */
        @Column(columnDefinition = "TEXT")
        @Basic(fetch = FetchType.LAZY)
        var summary: String = "",

        /**
         * The image that will be displayed below preview text
         */
        @Column
        var cover: String? = null,

        /**
         * Data required to store the article in editable format that will be rendered into HTML
         */
        @Column(columnDefinition = "TEXT")
        @Basic(fetch = FetchType.LAZY)
        var editableData: String = "",

        /**
         * Contains only text, without tags or markup, used for searching
         */
        @Column(nullable = true, columnDefinition = "TEXT")
        @Basic(fetch = FetchType.LAZY)
        var renderedTextOnly: String? = null,

        @OneToOne(cascade = [CascadeType.ALL], fetch = FetchType.LAZY, mappedBy = "article", orphanRemoval = true, optional = false)
        val stats: ArticleStats? = null,

        @OneToMany(cascade = [CascadeType.ALL], fetch = FetchType.LAZY, mappedBy = "article", orphanRemoval = true)
        val views: Set<ArticleView> = emptySet(),

        @OneToOne(cascade = [CascadeType.ALL], fetch = FetchType.LAZY, mappedBy = "article", orphanRemoval = true)
        val nonUniqueViews: ArticleNonUniqueView? = null,

        @OneToMany(cascade = [CascadeType.ALL], fetch = FetchType.LAZY, mappedBy = "article", orphanRemoval = true)
        var comments: MutableList<Comment> = mutableListOf(),

        @OneToMany(cascade = [CascadeType.ALL], fetch = FetchType.LAZY, mappedBy = "article", orphanRemoval = true)
        var bookmarks: MutableList<Bookmark> = mutableListOf(),

        @OneToMany(cascade = [CascadeType.ALL], fetch = FetchType.LAZY, mappedBy = "article", orphanRemoval = true)
        val votes: Set<ArticleVote> = emptySet(),

        @OneToMany(mappedBy = "article", fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
        @OrderBy("rank")
        var topics: MutableList<ArticleTopic> = mutableListOf(),

        @OneToMany(mappedBy = "article", fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
        @OrderBy("rank")
        var tags: MutableList<ArticleTag> = mutableListOf(),

        @Column
        @Basic(fetch = FetchType.LAZY)
        var pinned: Boolean? = false,

        @Column
        @Basic(fetch = FetchType.LAZY)
        var isEdited: Boolean? = false
) : Publication(author = author) {
    fun notBlocked() {
        if (publicationStage == Stage.BLOCKED)
            throw AccessDeniedException("Blocked publication")
    }
}
