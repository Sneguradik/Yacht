package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.dataobjects.TokenDto
import com.skolopendra.yacht.features.user.User
import io.jsonwebtoken.JwtParser
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import org.springframework.stereotype.Service
import java.util.*

@Service
class JwtService(
        val configuration: JwtConfiguration,
        private val refreshTokenService: RefreshTokenService
) {
    private fun createAccessToken(user: User): String {
        val issuedAt = Date()
        val calendar = Calendar.getInstance()
        calendar.time = issuedAt
        calendar.add(Calendar.MINUTE, configuration.tokenLifetime)

        val roles = if (user.roles.any { it.id.roleName == Roles.BANNED_USER })
            listOf(Roles.BANNED_USER)
        else
            user.roles.map { it.id.roleName }

        return Jwts.builder()
                .addClaims(mapOf(
                        "sub" to user.id.toString(),
                        "first_name" to user.firstName,
                        "last_name" to user.lastName,
                        "rol" to roles
                ))
                .setIssuer(configuration.tokenIssuer)
                .setIssuedAt(issuedAt)
                .setExpiration(calendar.time)
                .signWith(SignatureAlgorithm.HS512, configuration.tokenSigningKey)
                .compact()
    }

    private fun createRefreshToken(user: User, currentRefreshToken: String? = null): String {
        val issuedAt = Date()
        val calendar = Calendar.getInstance()
        calendar.time = issuedAt
        calendar.add(Calendar.MINUTE, configuration.refreshTokenLifetime)
        val refreshToken = Jwts.builder()
                .addClaims(mapOf(
                        "sub" to user.id.toString(),
                        "rol" to listOf("REFRESH")
                ))
                .setIssuer(configuration.tokenIssuer)
                .setIssuedAt(issuedAt)
                .setId(UUID.randomUUID().toString())
                .setExpiration(calendar.time)
                .signWith(SignatureAlgorithm.HS512, configuration.tokenSigningKey)
                .compact()

        refreshTokenService.saveOrUpdateToken(refreshToken, user, currentRefreshToken)

        return refreshToken
    }

    fun getTokenDto(user: User, currentRefreshToken: String? = null): TokenDto {
        return TokenDto(
                access = createAccessToken(user),
                refresh = createRefreshToken(user, currentRefreshToken)
        )
    }

    fun getParser(): JwtParser =
            Jwts.parser()
                    .setSigningKey(configuration.tokenSigningKey)
                    .requireIssuer(configuration.tokenIssuer)
}
