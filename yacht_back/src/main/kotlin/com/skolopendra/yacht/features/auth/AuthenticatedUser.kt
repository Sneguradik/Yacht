package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.AnonymousAuthenticationToken
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import javax.persistence.EntityNotFoundException

fun Authentication.getUserOrNull(): AuthenticatedUser? {
    if (this is AnonymousAuthenticationToken) {
        return null
    }
    return principal as AuthenticatedUser
}

fun Authentication.getUser(): AuthenticatedUser {
    if (this is AnonymousAuthenticationToken)
        throw AccessDeniedException("Anonymous user")
    return principal as AuthenticatedUser
}

fun currentAuthentication(): Authentication = SecurityContextHolder.getContext().authentication

fun currentUser(): User {
    val user = currentAuthentication().getUser().user
    if (user.isDeleted)
        throw NoSuchElementException("User not found")
    return user
}

fun currentUserId(): Long = currentAuthentication().getUser().id

fun currentUserOrNull(): User? {
    val user = currentAuthentication().getUserOrNull()?.user
    if(user != null && user.isDeleted)
        throw NoSuchElementException("User not found")
    return user
 }

fun currentUserIdOrNull(): Long? = currentAuthentication().getUserOrNull()?.id

fun currentUserHasAnyRole(vararg roles: String) =
        SecurityContextHolder.getContext().authentication.authorities.any { roles.contains(it.authority) }

class AuthenticatedUser(
        val id: Long,
        private val userRepository: UserRepository
) {
    val user: User by lazy {
        val user = userRepository.getOne(id)
        if(user.isDeleted)
            throw NoSuchElementException("User not found")
        if (user.masterAccount != null || user.masterAccountId != null)
            throw BadCredentialsException("account is bound")
        user
    }
}
