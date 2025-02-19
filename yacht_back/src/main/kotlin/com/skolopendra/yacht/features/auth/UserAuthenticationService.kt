package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.AccountOrigin
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserRegistrationService
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.Instant

@Service
class UserAuthenticationService(
    private val credentialsService: CredentialsService,
    private val userRegistrationService: UserRegistrationService
) {
    fun classicLogin(subject: String, password: String): User {
        return credentialsService.login(AccountOrigin.LOCAL, subject, password)
            ?: throw NoSuchElementException("User does not exist")
    }

    fun socialLogin(principal: SocialAuthenticationPrincipal): User {
        val foundUser = credentialsService.socialLogin(principal) ?: throw NoSuchElementException()
        if (foundUser.masterAccount != null)
            return foundUser.masterAccount!!
        return foundUser
    }

    fun logout() {
        val user = currentUserOrNull()
        if (user != null)
            userRegistrationService.saveUser(user.apply {
                lastLogin = Timestamp.from(Instant.now())
            })
    }
}
