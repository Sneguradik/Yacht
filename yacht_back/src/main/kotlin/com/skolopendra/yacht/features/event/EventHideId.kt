package com.skolopendra.yacht.features.article

import java.io.Serializable
import java.util.*
import javax.persistence.Embeddable

@Embeddable
class EventHideId(
        var userId: Long,
        var eventId: Long
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other === null) return false
        if (other !is EventHideId) return false
        return eventId == other.eventId && userId == other.userId
    }

    override fun hashCode(): Int {
        return Objects.hash(userId, eventId)
    }
}