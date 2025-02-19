package com.skolopendra.lib.error

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("yacht.error")
data class ErrorHandlerConfig(
        val sendFullMessage: Boolean,
        val log: Logging
) {
    data class Logging(
            val any: Boolean,
            val include: Set<String>,
            val exclude: Set<String>
    )
}