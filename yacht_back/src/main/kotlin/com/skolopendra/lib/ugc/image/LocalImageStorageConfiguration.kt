package com.skolopendra.lib.ugc.image

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("yacht.ugc.local-image-storage")
data class LocalImageStorageConfiguration(
        val filesystemPath: String,
        val urlPrefix: String
)