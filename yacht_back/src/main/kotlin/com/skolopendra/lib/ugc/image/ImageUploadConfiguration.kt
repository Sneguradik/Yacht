package com.skolopendra.lib.ugc.image

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary

@Configuration
class ImageUploadConfiguration {
    @Autowired
    lateinit var contentConfiguration: ContentConfiguration

    @Primary
    @Bean
    fun getImageStorage(): ImageStorage {
        return when (contentConfiguration.uploadDestination) {
            "local" -> LocalImageStorage()
            "s3" -> S3ImageStorage()
            else -> throw IllegalArgumentException("Unknown upload destination: ${contentConfiguration.uploadDestination}")
        }
    }
}