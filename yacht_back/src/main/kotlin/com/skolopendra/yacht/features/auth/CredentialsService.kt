package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.AccountOrigin
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserRepository
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.Instant

@Service
class CredentialsService(
        private val repository: CredentialsRepository,
        private val passwordEncoder: PasswordEncoder,
        private val refreshTokenRepository: RefreshTokenRepository,
        private val userRepository: UserRepository
) {
    fun login(origin: AccountOrigin, subject: String, password: String?): User? {
        val serviceId = if (subject.contains('@')) {
            subject.trim().lowercase()
        } else {
            subject
        }

        val found = repository.findFirstByOriginAndServiceId(origin, serviceId) ?: return null
        val user = found.user
        if (found.password == null)
            return user
        if (password == null)
            throw BadCredentialsException("A password is required")
        if (!passwordEncoder.matches(password, found.password))
            throw BadCredentialsException("Passwords do not match")
        return user
    }

    fun socialLogin(principal: SocialAuthenticationPrincipal): User? {
        return login(principal.origin, principal.serviceId, null)
    }
}
