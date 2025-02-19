package com.skolopendra.yacht.service.social

import com.skolopendra.yacht.AccountOrigin
import com.skolopendra.yacht.features.auth.SocialAuthenticationPrincipal
import org.apache.commons.codec.digest.DigestUtils
import org.apache.commons.codec.digest.HmacAlgorithms
import org.apache.commons.codec.digest.HmacUtils
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.stereotype.Service
import java.net.URL
import java.util.stream.Collectors

@Service
class TgService(
    private val configuration: TgConfiguration
) : ISocialAuthenticationService<MutableMap<String, Any>> {

    data class TgInfo(
        val firstName: String,
        val lastName: String,
        val pictureUrl: URL?
    )

    override fun getPrincipal(data: MutableMap<String, Any>): SocialAuthenticationPrincipal {
        val hash = data.getValue("hash").toString()
        data.remove("hash")
        val str = data.entries.stream()
            .sorted { a, b -> a.key.compareTo(b.key) }
            .map { kvp -> kvp.key + "=" + kvp.value }
            .collect(Collectors.joining("\n"))

        val secret = DigestUtils.sha256(configuration.token)
        val hex = HmacUtils(HmacAlgorithms.HMAC_SHA_256, secret).hmacHex(str)

        if (hex != hash) {
            throw BadCredentialsException("Signature does not match")
        }

        val username = data.getValue("username").toString()
        return SocialAuthenticationPrincipal(AccountOrigin.TG, data.getValue("id").toString(), TgInfo(
            firstName = data["first_name"]?.toString() ?: username,
            lastName = data["last_name"]?.toString() ?: username,
            pictureUrl = data["photo_url"]?.let { URL(it.toString()) }
        ))
    }

    override fun getInfo(principal: SocialAuthenticationPrincipal): ISocialAuthenticationService.UserInfo {
        val (firstName, lastName, pictureUrl) = principal.serviceLoginData as TgInfo
        return ISocialAuthenticationService.UserInfo(firstName, lastName, pictureUrl)
    }
}
