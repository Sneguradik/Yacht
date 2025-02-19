package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.service.social.FacebookService
import com.skolopendra.yacht.service.social.GoogleService
import com.skolopendra.yacht.service.social.TgService
import com.skolopendra.yacht.service.social.VkService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth/check")
class SocialCheckController(
    private val googleService: GoogleService,
    private val vkService: VkService,
    private val tgService: TgService,
    private val facebookService: FacebookService,
    private val credentialsService: CredentialsService
) {
    private fun checkAccount(principal: SocialAuthenticationPrincipal): CheckResult {
        return CheckResult(this.credentialsService.socialLogin(principal) != null)
    }

    data class CheckResult(val exists: Boolean)

    @PostMapping("google")
    fun google(@RequestBody data: GoogleService.GoogleAuth): CheckResult {
        return checkAccount(googleService.getPrincipal(data))
    }

    @PostMapping("vk")
    fun vk(@RequestBody data: VkService.VkAuth): CheckResult {
        return checkAccount(vkService.getPrincipal(data))
    }

    @PostMapping("tg")
    fun tg(@RequestBody data: Map<String, Any>): CheckResult {
        return checkAccount(tgService.getPrincipal(data.toMutableMap()))
    }

    @PostMapping("facebook")
    fun facebook(@RequestBody data: FacebookService.FacebookAuth): CheckResult {
        return checkAccount(facebookService.getPrincipal(data))
    }
}
