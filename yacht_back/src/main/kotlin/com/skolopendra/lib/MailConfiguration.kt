package com.skolopendra.lib

import com.skolopendra.lib.ugc.mail.MailConfig
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.JavaMailSenderImpl
import java.util.*
import javax.security.auth.Subject

@Configuration
class MailConfiguration(
    val configuration: MailConfig
) {
    @Bean
    fun mailSender(): JavaMailSender {
        val properties = Properties()

        properties["mail.transport.protocol"] = "smtp"
        properties["mail.smtp.auth"] = "true"
        properties["mail.smtp.starttls.enable"] = "true"
        properties["mail.smtp.starttls.required"] = "true"
        properties["mail.smtp.ssl.enable"] = "true"

        val mailSender = JavaMailSenderImpl()

        mailSender.host = configuration.host
        mailSender.username = configuration.username
        mailSender.port = configuration.port
        mailSender.password = configuration.password
        mailSender.javaMailProperties = properties

        return mailSender
    }
}
