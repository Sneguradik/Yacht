package com.skolopendra.yacht.features.article

import java.io.Serializable
import java.util.*
import javax.persistence.Embeddable

@Embeddable
class JobHideId(
        var userId: Long,
        var jobId: Long
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other === null) return false
        if (other !is JobHideId) return false
        return jobId == other.jobId && userId == other.userId
    }

    override fun hashCode(): Int {
        return Objects.hash(userId, jobId)
    }
}