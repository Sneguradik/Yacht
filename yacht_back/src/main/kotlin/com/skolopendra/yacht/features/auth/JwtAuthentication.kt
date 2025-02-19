package com.skolopendra.yacht.features.auth

import io.jsonwebtoken.Claims
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.GrantedAuthority

class JwtAuthentication(
        private val principal: Any,
        private val jwtClaims: Claims,
        authorities: Collection<GrantedAuthority>
) : AbstractAuthenticationToken(authorities) {
    override fun getCredentials() = jwtClaims

    override fun getPrincipal() = principal

    override fun isAuthenticated() = true
}