package com.skolopendra.yacht.features.auth

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("yacht.security.jwt")
data class JwtConfiguration(
        val tokenLifetime: Int,
        val refreshTokenLifetime: Int,
        val tokenIssuer: String,
        val tokenSigningKey: String
)