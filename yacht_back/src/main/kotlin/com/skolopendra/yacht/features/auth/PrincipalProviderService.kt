package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.features.user.UserRepository
import io.jsonwebtoken.Claims
import org.springframework.stereotype.Service

@Service
class PrincipalProviderService(
        val userRepository: UserRepository
) {

    fun resolve(claims: Claims): Any {
        return AuthenticatedUser(claims.subject.toLong(), userRepository)
    }
}