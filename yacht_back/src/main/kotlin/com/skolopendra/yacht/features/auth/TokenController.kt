package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.dataobjects.TokenDto
import com.skolopendra.yacht.features.user.UserRepository
import io.jsonwebtoken.ExpiredJwtException
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/token")
class TokenController(
        private val jwtService: JwtService,
        // FIXME: Repository injection in controller
        private val users: UserRepository,
        private val refreshTokenService: RefreshTokenService
) {
    data class RefreshRequest(
            val refreshToken: String
    )

    @PostMapping("/refresh")
    fun refresh(@RequestBody request: RefreshRequest): TokenDto {
        val userId = try {
            val jwt = jwtService.getParser().parseClaimsJws(request.refreshToken)
            require((jwt.body["rol"] as List<*>).any { it.toString() == "REFRESH" }) { "Not a refresh token" }
            jwt.body.subject.toLong()
        } catch (ex: ExpiredJwtException) {
            ex.claims.subject.toLong()
        }
        val foundUser = users.findById(userId)
        if (!foundUser.isPresent) {
            throw NoSuchElementException("User not found")
        }

        if (!refreshTokenService.existsByTokenAndUser(request.refreshToken, foundUser.get()))
            throw NoSuchElementException("Token not found for current user.")

        return jwtService.getTokenDto(foundUser.get(), request.refreshToken)
    }
}
