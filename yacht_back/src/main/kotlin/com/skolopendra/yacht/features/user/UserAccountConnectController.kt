package com.skolopendra.yacht.features.user

import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.service.social.FacebookService
import com.skolopendra.yacht.service.social.GoogleService
import com.skolopendra.yacht.service.social.TgService
import com.skolopendra.yacht.service.social.VkService
import org.apache.commons.codec.binary.Hex
import org.apache.commons.codec.digest.DigestUtils
import org.apache.commons.codec.digest.HmacAlgorithms
import org.apache.commons.codec.digest.HmacUtils
import org.apache.tomcat.util.buf.ByteBufferUtils
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.MessageDigest
import java.util.stream.Collectors
import javax.annotation.PostConstruct
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec


@RestController
@RequestMapping("/users/me/connect")
class UserAccountConnectController(
    private val googleService: GoogleService,
    private val facebookService: FacebookService,
    private val vkService: VkService,
    private val tgService: TgService,
    private val service: UserAccountConnectService
) {
    @PostMapping("google")
    fun google(@RequestBody data: GoogleService.GoogleAuth) {
        service.connectSocialAccount(currentUser(), googleService.getPrincipal(data))
    }

    @PostMapping("facebook")
    fun facebook(@RequestBody data: FacebookService.FacebookAuth) {
        service.connectSocialAccount(currentUser(), facebookService.getPrincipal(data))
    }

    @PostMapping("vk")
    fun vk(@RequestBody data: VkService.VkAuth) {
        service.connectSocialAccount(currentUser(), vkService.getPrincipal(data))
    }

    @PostMapping("tg")
    fun tg(@RequestBody data: Map<String, Any>) {
        service.connectSocialAccount(currentUser(), tgService.getPrincipal(data.toMutableMap()))
    }

    @PostConstruct
    fun init() {
        val accountInfo = mapOf(
            "auth_date" to 1700120126,
            "first_name" to "Denis",
            "id" to 583905014,
            "photo_url" to "https://t.me/i/userpic/320/4o_sUaG8BbLTwvzF1j1Ltc9Fku4QERvq3Hm1w9PGV2o.jpg",
            "username" to "JUSTAMAZNGUY"
        )

        val botToken = "6452153119:AAGU1Q7Jhco-groBL5xZnewrUf1PJawXJ6o"

        val str = accountInfo.entries.stream()
            .sorted { a, b -> a.key.compareTo(b.key) }
            .map { kvp -> kvp.key + "=" + kvp.value }
            .collect(Collectors.joining("\n"))

        val secret = DigestUtils.sha256(botToken)
        val hex = HmacUtils(HmacAlgorithms.HMAC_SHA_256, secret).hmacHex(str)

        println(str)
        println(hex)
        println(hex == "55aaa25aba6807259e0df9fbd2076e102557f3fb55792de0b55a2a30f4b95709")

    }

}
