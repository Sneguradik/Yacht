package com.skolopendra.yacht.features.auth

import com.skolopendra.lib.auth.RawJwtAuthentication
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Component

@Component
class JwtAuthenticationProvider(
        val jwtConfiguration: JwtConfiguration,
        val principalProviderService: PrincipalProviderService
) : AuthenticationProvider {
    override fun authenticate(authentication: Authentication?): Authentication? {
        val token = authentication as RawJwtAuthentication
        val jwtString = token.credentials
        val jws = try {
            Jwts.parser()
                    .setSigningKey(jwtConfiguration.tokenSigningKey)
                    .requireIssuer(jwtConfiguration.tokenIssuer)
                    .parseClaimsJws(jwtString)
        } catch (e: Exception) {
            return null
        }
        val claims = jws.body
        val principal = principalProviderService.resolve(claims)
        val authorities = getAuthorities(claims)
        return JwtAuthentication(principal, claims, authorities)
    }

    override fun supports(authentication: Class<*>): Boolean {
        return RawJwtAuthentication::class.java.isAssignableFrom(authentication)
    }

    fun getAuthorities(claims: Claims): Collection<GrantedAuthority> {
        return if (claims.containsKey("rol")) {
            claims.get("rol", List::class.java).map { SimpleGrantedAuthority(it.toString()) }
        } else {
            emptyList()
        }
    }
}