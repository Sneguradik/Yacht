package com.skolopendra.yacht.features.showcase

import java.io.Serializable
import java.util.*
import javax.persistence.Embeddable

@Embeddable
class ShowcaseStaticItemViewId(
        var userId: Long,
        var itemId: Long
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other === null) return false
        if (other !is ShowcaseStaticItemViewId) return false
        return itemId == other.itemId && userId == other.userId
    }

    override fun hashCode(): Int {
        return Objects.hash(userId, itemId)
    }
}