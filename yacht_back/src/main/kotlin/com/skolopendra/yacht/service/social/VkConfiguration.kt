package com.skolopendra.yacht.service.social

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("yacht.external.vk")
data class VkConfiguration(
    val secret: String,
    val accessToken: String
)
