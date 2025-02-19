package com.skolopendra.yacht.features.user

import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.access.Role
import com.skolopendra.yacht.features.auth.currentUser
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*
import javax.persistence.EntityNotFoundException

@RestController
@RequestMapping("/users/{id}")
@Secured(Roles.CHIEF_EDITOR, Roles.SUPERUSER)
class UserManagementController(
        val service: UserManagementService
) {
    fun isPinned(user: User) {
        if(user.isDeleted)
            throw EntityNotFoundException("User not found")
        if (user.isPinned) throw IllegalArgumentException("User is pinned and can't be edited")
    }

    // TODO: User.isPinned to Annotation
    @PostMapping("ban")
    fun ban(@PathVariable("id") user: User) {
        if(user.isDeleted)
            throw EntityNotFoundException("User not found")
        isPinned(user)
        service.ban(user)
    }

    @DeleteMapping("ban")
    fun unban(@PathVariable("id") user: User) {
        if(user.isDeleted)
            throw EntityNotFoundException("User not found")
        isPinned(user)
        service.unban(user)
    }

    @PostMapping("roles/{role}")
    fun addRole(@PathVariable("id") user: User, @PathVariable("role") role: Role) {
        if(user.isDeleted)
            throw EntityNotFoundException("User not found")
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        service.verifyRoleAccess(currentUser(), user, role)
        isPinned(user)
        service.addRole(user, role)
    }

    @DeleteMapping("roles/{role}")
    fun removeRole(@PathVariable("id") user: User, @PathVariable("role") role: Role) {
        if(user.isDeleted)
            throw EntityNotFoundException("User not found")
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        service.verifyRoleAccess(currentUser(), user, role)
        isPinned(user)
        service.removeRole(user, role)
    }

    @DeleteMapping
    fun deleteUser(@PathVariable("id") user: User) {
        if(user.isDeleted)
            throw EntityNotFoundException("User not found")
        isPinned(user)
        service.deleteUser(user)
    }

    @PostMapping("company")
    fun setCompany(@PathVariable("id") user: User) {
        if(user.isDeleted)
            throw EntityNotFoundException("User not found")
        isPinned(user)
        service.setCompany(user, true)
    }

    @DeleteMapping("company")
    fun setPersonal(@PathVariable("id") user: User) {
        if(user.isDeleted)
            throw EntityNotFoundException("User not found")
        isPinned(user)
        service.setCompany(user, false)
    }
}
