package com.skolopendra.yacht.features.user

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.skolopendra.yacht.dataobjects.TokenDto
import com.skolopendra.yacht.features.auth.JwtService
import com.skolopendra.yacht.service.social.FacebookService
import com.skolopendra.yacht.service.social.GoogleService
import com.skolopendra.yacht.service.social.TgService
import com.skolopendra.yacht.service.social.VkService
import com.skolopendra.yacht.util.TrimCase
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import javax.validation.Valid
import javax.validation.constraints.Email
import javax.validation.constraints.NotNull
import javax.validation.constraints.Size

@Validated
@RestController
@RequestMapping("/users/register")
class UserRegistrationController(
    private val userRegistrationService: UserRegistrationService,
    private val jwtService: JwtService,
    private val facebookService: FacebookService,
    private val vkService: VkService,
    private val tgService: TgService,
    private val googleService: GoogleService
) {
    data class RegisterRequest(
        @get:NotNull
        @get:Size(min = 2, max = 12)
        val firstName: String,

        @get:NotNull
        @get:Size(min = 2, max = 12)
        val lastName: String,

        @get:javax.validation.constraints.Pattern(regexp = "^((?!^id\\d))\\w{3,24}\$")
        val username: String?,

        @JsonDeserialize(using = TrimCase::class)
        @get:NotNull
        @get:Email
        val email: String,

        @get:NotNull
        @get:Size(min = 8, max = 128)
        val password: String
    )

    @PostMapping("social/google")
    fun google(@RequestBody data: GoogleService.GoogleAuth): TokenDto {
        return jwtService.getTokenDto(userRegistrationService.socialRegister(googleService.getPrincipal(data)))
    }

    @PostMapping("social/vk")
    fun vk(@RequestBody data: VkService.VkAuth): TokenDto {
        return jwtService.getTokenDto(userRegistrationService.socialRegister(vkService.getPrincipal(data)))
    }

    @PostMapping("social/tg")
    fun tg(@RequestBody data: Map<String, Any>): TokenDto {
        return jwtService.getTokenDto(userRegistrationService.socialRegister(tgService.getPrincipal(data.toMutableMap())))
    }

    @PostMapping("social/facebook")
    fun facebook(@RequestBody data: FacebookService.FacebookAuth): TokenDto {
        return jwtService.getTokenDto(userRegistrationService.socialRegister(facebookService.getPrincipal(data)))
    }

    /**
     * Register using name, username and password
     */
    @ResponseBody
    @PostMapping
    fun classicRegister(@Valid @RequestBody request: RegisterRequest): TokenDto {
        // TODO: Proper email normalization
        val normalizedEmail = request.email.trim().lowercase()
        val user = userRegistrationService.classicRegister(
            request.firstName.trim(),
            request.lastName.trim(),
            request.username,
            normalizedEmail,
            request.password
        )
        return jwtService.getTokenDto(user)
    }
}
