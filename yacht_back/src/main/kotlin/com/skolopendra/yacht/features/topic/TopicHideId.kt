package com.skolopendra.yacht.features.topic

import java.io.Serializable
import java.util.*
import javax.persistence.Embeddable

@Embeddable
class TopicHideId(
        var userId: Long,
        var topicId: Long
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other === null) return false
        if (other !is TopicHideId) return false
        return topicId == other.topicId && userId == other.userId
    }

    override fun hashCode(): Int {
        return Objects.hash(userId, topicId)
    }
}