package com.skolopendra.yacht.service.social

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("spring.social.facebook")
data class FacebookConfiguration(
        val appId: String,
        val appSecret: String
)