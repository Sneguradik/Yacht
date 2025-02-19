package com.skolopendra.yacht.entity.join

import java.io.Serializable
import java.util.*
import javax.persistence.Embeddable

@Embeddable
class UserRoleId(
        val userId: Long,
        val roleName: String
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other === null) return false
        if (other !is UserRoleId) return false
        return userId == other.userId && roleName == other.roleName
    }

    override fun hashCode(): Int {
        return Objects.hash(userId, roleName)
    }
}