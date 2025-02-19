package com.skolopendra.yacht.features.article

import com.fasterxml.jackson.annotation.JsonIgnore
import javax.persistence.*
import javax.validation.constraints.Min
import javax.validation.constraints.NotNull

@Entity
class ArticleStats(
        @Id
        val id: Long = 0,

        @OneToOne(fetch = FetchType.LAZY)
        @MapsId
        @JsonIgnore
        val article: Article? = null,

        var views: Int = 0,
        var feedViews: Int = 0,
        var uniqueUsersCommenting: Int = 0,
        var comments: Int = 0,
        var score: Int = 0,
        var reactions: Int = 0,
        var bookmarks: Int = 0,
        var votesUp: Int = 0,
        var votesDown: Int = 0,
        var shares: Int = 0,

        var calculatedScore: Double = 0.0,

        @Column(name="non_unique_views")
        @Min(0)
        var nonUniqueViews: Int? = 0
)