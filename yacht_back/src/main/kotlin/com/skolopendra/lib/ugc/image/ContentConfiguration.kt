package com.skolopendra.lib.ugc.image

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("yacht.ugc.image")
data class ContentConfiguration(
    val uploadDestination: String = "local",
    val maxWidth: Int = 4096,
    val maxHeight: Int = 4096
)
