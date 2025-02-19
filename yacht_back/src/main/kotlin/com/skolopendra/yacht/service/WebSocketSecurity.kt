package com.skolopendra.yacht.service

import com.skolopendra.lib.auth.RawJwtAuthentication
import com.skolopendra.yacht.features.auth.JwtService
import com.skolopendra.yacht.features.auth.getUser
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jws
import io.jsonwebtoken.Jwt
import org.slf4j.LoggerFactory
import org.springframework.messaging.Message
import org.springframework.messaging.simp.stomp.StompCommand
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.stereotype.Service

@Service("webSocketSecurity")
class WebSocketSecurity(
        private val jwtService: JwtService
) {

    private val tokenPrefix = "Bearer "

    /**
     * Check user's permission to access the specified message.
     *
     * @param authentication user's authentication (ignored)
     * @param message        message
     *
     * @return `true` if access is granted, `false` otherwise
     */
    @Suppress("unused")
    fun checkAccess(authentication: Authentication?, message: Message<*>): Boolean {
        val stompHeaderAccessor = StompHeaderAccessor.wrap(message)
        val topic = stompHeaderAccessor.destination
        val token = stompHeaderAccessor
                .toNativeHeaderMap()["Authorization"]
                ?.get(0)

        return if (token == null) {
            false
        } else {
            jwtService.getParser().parseClaimsJws(token.substring(tokenPrefix.length))
            true
        }
    }

}
