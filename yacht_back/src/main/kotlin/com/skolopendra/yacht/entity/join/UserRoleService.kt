package com.skolopendra.yacht.entity.join

import com.skolopendra.yacht.entity.access.Role
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserRepository
import org.springframework.stereotype.Service

@Service
class UserRoleService(
        private val userRoleRepository: UserRoleRepository,
        private val userRepository: UserRepository
) {
    fun findUsersByRoles(roles: List<String>): List<User> {
        val users = userRoleRepository.findAllByIdRoleNameIn(roles).map { it.id.userId }
        return userRepository.findByIdIn(users)
    }

    fun existByUserAndRole(user: User, role: Role): Boolean = userRoleRepository.existsByUserAndRole(user, role)
}
