package com.skolopendra.yacht.service.social

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier
import com.google.api.client.googleapis.auth.oauth2.GooglePublicKeysManager
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport
import com.google.api.client.googleapis.util.Utils
import com.skolopendra.yacht.AccountOrigin
import com.skolopendra.yacht.features.auth.SocialAuthenticationPrincipal
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.stereotype.Service
import java.net.URL

@Service
class GoogleService : ISocialAuthenticationService<GoogleService.GoogleAuth> {
    private final val pkManager =
        GooglePublicKeysManager.Builder(GoogleNetHttpTransport.newTrustedTransport(), Utils.getDefaultJsonFactory())
            .build()!!
    val tokenVerifier = GoogleIdTokenVerifier.Builder(pkManager).build()!!

    fun verifyIdToken(idToken: String): GoogleIdToken? {
        return tokenVerifier.verify(idToken)
    }

    data class GoogleAuth(
        val idToken: String
    )

    override fun getPrincipal(data: GoogleAuth): SocialAuthenticationPrincipal {
        val idToken = try {
            verifyIdToken(data.idToken) ?: throw BadCredentialsException("ID token verification failed")
        } catch (e: Exception) {
            throw IllegalArgumentException("Could not process ID token")
        }
        return SocialAuthenticationPrincipal(AccountOrigin.GOOGLE, idToken.payload.subject, idToken)
    }

    override fun getInfo(principal: SocialAuthenticationPrincipal): ISocialAuthenticationService.UserInfo {
        // idToken already contains both name and profile picture of user
        val token = principal.serviceLoginData as GoogleIdToken
        return ISocialAuthenticationService.UserInfo(
            firstName = token.payload["given_name"] as String,
            lastName = token.payload["family_name"] as String,
            pictureUrl = URL(token.payload["picture"] as String)
        )
    }
}
