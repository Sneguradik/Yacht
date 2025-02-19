package com.skolopendra.yacht.entity.join

import com.skolopendra.yacht.entity.access.Role
import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRoleRepository : JpaRepository<UserRole, UserRoleId> {
    fun existsByUserAndRole(user: User, role: Role): Boolean
    fun findAllByIdRoleNameIn(roles: List<String>): List<UserRole>
}
