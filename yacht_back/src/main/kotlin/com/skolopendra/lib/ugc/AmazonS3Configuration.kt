package com.skolopendra.lib.ugc

import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.AmazonS3ClientBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Lazy

@Configuration
class AmazonS3Configuration(
    val amazonConfiguration: AmazonConfiguration
) {
    @Lazy
    @Bean
    fun amazonS3Client(): AmazonS3 {
        return AmazonS3ClientBuilder
            .standard()
            .withEndpointConfiguration(
                AwsClientBuilder.EndpointConfiguration(
                    "hb.ru-msk.vkcs.cloud",
                    amazonConfiguration.s3.region
                )
            )
            .build()
    }
}
