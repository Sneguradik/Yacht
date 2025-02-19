package com.skolopendra.yacht.features.showcase

import com.skolopendra.yacht.features.article.Article
import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*
import javax.validation.constraints.Min

@Entity
@Table(name = "showcase_static_item_stat")
class ShowcaseStaticItemStat (

        @EmbeddedId
        val id: ShowcaseStaticItemStatId,

        @ManyToOne(optional = false, fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
        @MapsId("itemId")
        val item: ShowcaseStaticItem,

        @Enumerated(EnumType.ORDINAL)
        @Column(name = "itemType", insertable = false, updatable = false)
        var itemType: ShowcaseStaticItemType
) {

        @Min(0)
        @Column(name = "views_count")
        var viewsCount: Long = 0

        @Min(0)
        @Column(name = "posts_count")
        var postsCount: Long = 0

        @Min(0)
        @Column(name = "subscribers_count")
        var subscribersCount: Long = 0

        @Column(name = "updated_at")
        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0)

        constructor(item: ShowcaseStaticItem, itemType: ShowcaseStaticItemType) : this(ShowcaseStaticItemStatId(item.id, itemType), item, itemType)
}

enum class ShowcaseStaticItemType {
        CUSTOM, ARTICLE, TOPIC, TAG, AUTHOR, COMPANY, EVENT, JOB
}
