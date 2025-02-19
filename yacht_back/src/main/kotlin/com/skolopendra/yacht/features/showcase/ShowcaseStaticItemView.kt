package com.skolopendra.yacht.features.showcase

import com.skolopendra.yacht.features.user.User
import javax.persistence.*

@Entity
@Table(name = "showcase_static_item_view")
class ShowcaseStaticItemView(
        @EmbeddedId
        val id: ShowcaseStaticItemViewId,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("userId")
        val user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("itemId")
        val item: ShowcaseStaticItem
) {
    constructor(user: User, item: ShowcaseStaticItem) : this(ShowcaseStaticItemViewId(user.id, item.id), user, item)
}
