package com.skolopendra.lib.ugc.mail

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("spring.mail")
data class MailConfig(
    val host: String = "",
    val username: String = "",
    val port: Int = 465,
    val password: String = ""
)
