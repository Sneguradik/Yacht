package com.skolopendra.yacht.service.social

import com.fasterxml.jackson.annotation.JsonProperty
import com.skolopendra.yacht.AccountOrigin
import com.skolopendra.yacht.features.auth.SocialAuthenticationPrincipal
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.social.facebook.web.SignedRequestDecoder
import org.springframework.social.facebook.web.SignedRequestException
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.net.URI
import java.net.URL

@Service
class FacebookService(
    val configuration: FacebookConfiguration
) : ISocialAuthenticationService<FacebookService.FacebookAuth> {
    class SignedRequest(
        val userId: String = "",
        val code: String = "",
        val issuedAt: Long = 0
    )

    data class GraphError(
        val message: String,
        val type: String,
        val code: Int
    ) {
        override fun toString(): String {
            return "$code $type: '$message'"
        }
    }

    data class GraphUserResponse(
        @JsonProperty("first_name")
        val firstName: String?,
        @JsonProperty("last_name")
        val lastName: String?,
        val id: String?,
        val error: GraphError?
    )

    data class GraphUserPictureResponse(
        val data: ProfilePictureSource?,
        val error: GraphError?
    ) {
        data class ProfilePictureSource(
            val url: String,
            @JsonProperty("is_silhouette")
            val isSilhouette: Boolean
        )
    }

    fun getSignedRequest(signedRequest: String): SignedRequest {
        val decoder = SignedRequestDecoder(configuration.appSecret)
        return decoder.decodeSignedRequest(signedRequest, SignedRequest::class.java)
    }

    data class UserNameDetails(
        val firstName: String,
        val lastName: String
    )

    fun getDetails(serviceId: String): UserNameDetails {
        val restTemplate = RestTemplate()
        val uri =
            URI("https://graph.facebook.com/$serviceId?access_token=${configuration.appId}%7C${configuration.appSecret}&fields=first_name,last_name")
        val response = restTemplate.getForEntity(uri, GraphUserResponse::class.java).body
            ?: throw Exception("Could not access FB api")
        if (response.firstName == null || response.lastName == null) {
            throw java.lang.Exception("FB api returned error " + response.error.toString())
        }
        return UserNameDetails(response.firstName, response.lastName)
    }

    fun getProfilePictureUrl(serviceId: String): String {
        val restTemplate = RestTemplate()
        val uri =
            URI("https://graph.facebook.com/v4.0/$serviceId/picture?height=200&width=200&redirect=false&type=square&access_token=${configuration.appId}%7C${configuration.appSecret}")
        val response = restTemplate.getForEntity(uri, GraphUserPictureResponse::class.java).body
            ?: throw Exception("Could not access FB api")
        if (response.data == null) {
            throw java.lang.Exception("FB api returned error " + response.error.toString())
        }
        return response.data.url
    }

    data class FacebookAuth(
        val signedRequest: String
    )

    override fun getPrincipal(data: FacebookAuth): SocialAuthenticationPrincipal {
        val signedRequest = try {
            getSignedRequest(data.signedRequest)
        } catch (e: SignedRequestException) {
            throw BadCredentialsException("Bad signed request")
        } catch (e: java.lang.Exception) {
            throw IllegalArgumentException("Could not process signed request")
        }
        return SocialAuthenticationPrincipal(AccountOrigin.FACEBOOK, signedRequest.userId, null)
    }

    override fun getInfo(principal: SocialAuthenticationPrincipal): ISocialAuthenticationService.UserInfo {
        require(principal.origin == AccountOrigin.FACEBOOK)
        val details = getDetails(principal.serviceId)
        return ISocialAuthenticationService.UserInfo(
            firstName = details.firstName,
            lastName = details.lastName,
            pictureUrl = URL(getProfilePictureUrl(principal.serviceId))
        )
    }
}
