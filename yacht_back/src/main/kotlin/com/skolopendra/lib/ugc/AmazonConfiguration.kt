package com.skolopendra.lib.ugc

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("yacht.amazon")
data class AmazonConfiguration(
        val s3: S3 = S3()
) {
    data class S3(
            val region: String = "",
            val bucket: String = ""
    )
}