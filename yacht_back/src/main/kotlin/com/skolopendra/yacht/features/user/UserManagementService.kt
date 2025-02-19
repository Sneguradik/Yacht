package com.skolopendra.yacht.features.user

import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.access.Role
import com.skolopendra.yacht.entity.join.UserRole
import com.skolopendra.yacht.event.UserBannedEvent
import com.skolopendra.yacht.features.article.comment.CommentRepository
import com.skolopendra.yacht.repository.RoleRepository
import com.skolopendra.yacht.repository.UserNotifySettingsRepository
import org.hibernate.Hibernate
import org.springframework.context.ApplicationEventPublisher
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserManagementService(
        val users: UserRepository,
        val roles: RoleRepository,
        val eventPublisher: ApplicationEventPublisher,
        private val userNotifySettingsRepository: UserNotifySettingsRepository,
        private val commentRepository: CommentRepository
) {
    companion object {
        val ASSIGNABLE_ROLES = listOf(Roles.SALES, Roles.SUPERUSER, Roles.CHIEF_EDITOR, Roles.PRIVILEGED_USER)
    }

    @Transactional
    fun pin(user: User) {
        user.isPinned = true
    }

    @Transactional
    fun unpin(user: User) {
        user.isPinned = false
    }

    @Transactional
    fun ban(user: User) {
        user.isBanned = true
        user.roles.add(UserRole(user, roles.findFirstByName(Roles.BANNED_USER)!!))
        users.save(user)
        eventPublisher.publishEvent(UserBannedEvent(user, true))
    }

    @Transactional
    fun unban(user: User) {
        user.isBanned = false
        user.roles.removeIf { it.id.roleName == Roles.BANNED_USER }
        users.save(user)
        eventPublisher.publishEvent(UserBannedEvent(user, false))
    }

    @Transactional
    fun addRole(user: User, role: Role) {
        Hibernate.initialize(user.roles)

        if(user.roles.map { it.id.roleName }.contains(role.name))
            return
        user.roles.add(UserRole(user, role))
        users.save(user)
    }

    @Transactional
    fun removeRole(user: User, role: Role) {
        Hibernate.initialize(user.roles)
        user.roles.removeAll { it.id.roleName == role.name }
        users.save(user)
    }

    @Transactional
    fun verifyRoleAccess(user: User, target: User, role: Role) {
        if (!ASSIGNABLE_ROLES.contains(role.name))
            throw AccessDeniedException("Role is not assignable")

        val userWithRoles = users.findByIdWithRoles(user.id)!!
        val userPrecedence = userWithRoles.roles.map { Roles.ROLE_PRECEDENCE[it.id.roleName] ?: -100 }.max() ?: -100
        val rolePrecedence = Roles.ROLE_PRECEDENCE.getValue(role.name)
        if (userPrecedence < rolePrecedence)
            throw AccessDeniedException("Role too powerful for user")
        if (user.id != target.id) {
            val targetWithRoles = users.findByIdWithRoles(target.id)!!
            val targetPrecedence = targetWithRoles.roles.map { Roles.ROLE_PRECEDENCE[it.id.roleName] ?: -100 }.max()
                    ?: -100
            if (userPrecedence < targetPrecedence)
                throw AccessDeniedException("User too powerful")
        }
    }

    @Transactional
    fun deleteUser(user: User) {
        user.isDeleted = true
        user.isBanned = true
        user.roles.add(UserRole(user, roles.findFirstByName(Roles.BANNED_USER)!!))
        users.save(user)
    }

    fun setCompany(user: User, value: Boolean) {
        user.company.isCompany = value
        user.company.isConfirmed = value
        users.save(user)
    }
}
