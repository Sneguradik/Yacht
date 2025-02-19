package com.skolopendra.yacht.service.social

import com.fasterxml.jackson.annotation.JsonProperty
import com.skolopendra.yacht.AccountOrigin
import com.skolopendra.yacht.features.auth.SocialAuthenticationPrincipal
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.codec.Hex
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.net.URI
import java.net.URL
import java.security.MessageDigest

@Service
class VkService(
    val configuration: VkConfiguration
) : ISocialAuthenticationService<VkService.VkAuth> {
    data class UsersGetResponse(
        val response: List<InternalResponse>?,
        val error: InternalError?
    ) {
        data class InternalResponse(
            val id: String,
            @JsonProperty("first_name")
            val firstName: String,
            @JsonProperty("last_name")
            val lastName: String,
            @JsonProperty("photo_200")
            val photo200: String
        )

        data class InternalError(
            @JsonProperty("error_code")
            val errorCode: Int,
            @JsonProperty("error_msg")
            val errorMsg: String
        )
    }

    private val digest = MessageDigest.getInstance("MD5")

    fun checkSignature(expire: Int, mid: String, secret: String, sid: String, sig: String) {
        if (expire < (System.currentTimeMillis() / 1000)) {
            throw BadCredentialsException("Session has expired: $expire, ${System.currentTimeMillis() / 1000}")
        }
        digest.reset()
        val bytes = digest.digest(
            "expire=${expire}mid=${mid}secret=${secret}sid=$sid${configuration.secret}".toByteArray(Charsets.UTF_8)
        )
        val calculatedSignature = String(Hex.encode(bytes))
        if (calculatedSignature != sig) {
            throw BadCredentialsException("Signature does not match")
        }
    }

    fun getUserInformation(serviceId: String): UsersGetResponse.InternalResponse {
        val restTemplate = RestTemplate()
        val uri =
            URI("https://api.vk.com/method/users.get?v=5.101&user_ids=$serviceId&fields=photo_200&access_token=${configuration.accessToken}")
        val response = restTemplate.getForEntity(uri, UsersGetResponse::class.java).body
            ?: throw Exception("Could not access VK api")
        if (response.response == null) {
            throw java.lang.Exception("VK api returned error " + response.error.toString())
        }
        return response.response[0]
    }

    data class VkAuth(
        val expire: Int,
        val mid: String,
        val secret: String,
        val sid: String,
        val sig: String
    )

    override fun getPrincipal(data: VkAuth): SocialAuthenticationPrincipal {
        checkSignature(data.expire, data.mid, data.secret, data.sid, data.sig)
        return SocialAuthenticationPrincipal(AccountOrigin.VK, data.mid, null)
    }

    override fun getInfo(principal: SocialAuthenticationPrincipal): ISocialAuthenticationService.UserInfo {
        val info = getUserInformation(principal.serviceId)
        return ISocialAuthenticationService.UserInfo(
            firstName = info.firstName,
            lastName = info.lastName,
            pictureUrl = URL(info.photo200)
        )
    }
}
