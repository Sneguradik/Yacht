package com.skolopendra.yacht.configuration

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("yacht")
data class YachtConfiguration(
        val baseUrl: String,
        val url: UrlPrefixes,
        val mail: Mail
) {
    data class UrlPrefixes(
            val articles: String,
            val companies: String,
            val users: String,
            val tags: String,
            val topics: String,
            val jobs: String,
            val events: String,
            val comments: String = "comment"
    )

    data class Mail (
        val lifeTimeMs: Int,
        val delay: Int
    )
}
