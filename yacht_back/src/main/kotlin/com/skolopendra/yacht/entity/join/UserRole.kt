package com.skolopendra.yacht.entity.join

import com.skolopendra.yacht.entity.access.Role
import com.skolopendra.yacht.features.user.User
import javax.persistence.*

@Entity
@Table(name = "user_role")
class UserRole(
        @ManyToOne
        @MapsId("userId")
        @JoinColumn(name = "user_id")
        val user: User?,

        @ManyToOne
        @MapsId("roleName")
        @JoinColumn(name = "role_name")
        val role: Role?,

        @EmbeddedId
        val id: UserRoleId
) {
    constructor(user: User, role: Role) : this(user, role, UserRoleId(user.id, role.name))
}
