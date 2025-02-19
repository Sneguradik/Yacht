package com.skolopendra.yacht.configuration

import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer

@Configuration
class SocketSecurityConfig : AbstractSecurityWebSocketMessageBrokerConfigurer() {

    companion object {
        private const val AUTHENTICATOR = "@webSocketSecurity.checkAccess(authentication,message)"
    }

    override fun configureInbound(messages: MessageSecurityMetadataSourceRegistry) {
        messages
                .nullDestMatcher().access(AUTHENTICATOR)
                .simpDestMatchers("/**").access(AUTHENTICATOR)
                .simpSubscribeDestMatchers("**").access(AUTHENTICATOR)
                .anyMessage().denyAll()
    }

    override fun sameOriginDisabled(): Boolean {
        return true
    }

}
