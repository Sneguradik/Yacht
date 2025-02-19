package com.skolopendra.yacht.features.user

import java.io.Serializable
import java.util.*
import javax.persistence.Embeddable

@Embeddable
class AuthorHideId(
        var userId: Long,
        var authorId: Long
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other === null) return false
        if (other !is AuthorHideId) return false
        return authorId == other.authorId && userId == other.userId
    }

    override fun hashCode(): Int {
        return Objects.hash(userId, authorId)
    }
}