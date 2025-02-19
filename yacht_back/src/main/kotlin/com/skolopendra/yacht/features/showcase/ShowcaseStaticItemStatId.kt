package com.skolopendra.yacht.features.showcase

import java.io.Serializable
import java.util.*
import javax.persistence.Embeddable

@Embeddable
class ShowcaseStaticItemStatId(
        var itemId: Long,
        var itemType: ShowcaseStaticItemType
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other === null) return false
        if (other !is ShowcaseStaticItemStatId) return false
        return itemId == other.itemId && itemType == other.itemType
    }

    override fun hashCode(): Int {
        return Objects.hash(itemType, itemId)
    }
}