package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.dataobjects.TokenDto
import com.skolopendra.yacht.service.social.FacebookService
import com.skolopendra.yacht.service.social.GoogleService
import com.skolopendra.yacht.service.social.TgService
import com.skolopendra.yacht.service.social.VkService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class UserAuthenticationController(
    private val facebookService: FacebookService,
    private val vkService: VkService,
    private val tgService: TgService,
    private val googleService: GoogleService,
    private val authenticationService: UserAuthenticationService,
    private val jwtService: JwtService
) {
    private fun socialLogin(principal: SocialAuthenticationPrincipal): TokenDto {
        val user = authenticationService.socialLogin(principal)
        return jwtService.getTokenDto(user)
    }

    @PutMapping("logout")
    fun logout() {
        authenticationService.logout()
    }

    @PostMapping("social/google")
    fun google(@RequestBody data: GoogleService.GoogleAuth): TokenDto {
        return socialLogin(googleService.getPrincipal(data))
    }

    @PostMapping("social/vk")
    fun vk(@RequestBody data: VkService.VkAuth): TokenDto {
        return socialLogin(vkService.getPrincipal(data))
    }

    @PostMapping("social/tg")
    fun tg(@RequestBody data: Map<String, Any>): TokenDto {
        return socialLogin(tgService.getPrincipal(data.toMutableMap()))
    }

    @PostMapping("social/facebook")
    fun facebook(@RequestBody data: FacebookService.FacebookAuth): TokenDto {
        return socialLogin(facebookService.getPrincipal(data))
    }

    data class ClassicAuth(
        /**
         * Either E-Mail or \@username
         */
        val subject: String,
        val password: String
    )

    @PostMapping("classic")
    fun classic(@RequestBody auth: ClassicAuth): TokenDto {
        val user = authenticationService.classicLogin(auth.subject, auth.password)
        return jwtService.getTokenDto(user)
    }

    data class WhoAmIResponse(
        val id: Long?
    )

    @GetMapping("whoami")
    fun whoami(): WhoAmIResponse {
        return WhoAmIResponse(currentUserIdOrNull())
    }
}
