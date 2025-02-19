package com.skolopendra.yacht.configuration

import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {

    companion object {
        const val TOPIC_PREFIX = "/topic"
        const val TOPIC_USER_PREFIX = "/queue/reply"
        private const val APP_DESTINATION_PREFIX = "/yacht"
        private const val ENDPOINT_PREFIX = "/ws"
    }

    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        config.enableSimpleBroker(TOPIC_PREFIX, "/queue", "/user")
        config.setApplicationDestinationPrefixes(APP_DESTINATION_PREFIX)
//        config.setUserDestinationPrefix(TOPIC_USER_PREFIX)
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry.addEndpoint(ENDPOINT_PREFIX).setAllowedOrigins("*")
        registry.addEndpoint(ENDPOINT_PREFIX).setAllowedOrigins("*").withSockJS()
    }

}
