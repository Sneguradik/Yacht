package com.skolopendra.yacht.service

import com.skolopendra.lib.MailConfiguration
import com.skolopendra.yacht.configuration.YachtConfiguration
import org.springframework.mail.MailSender
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service
import org.thymeleaf.context.Context
import org.thymeleaf.spring5.SpringTemplateEngine

data class EmailTemplate(
        val username: String?,
        val email: String,
        val url: String
)

@Service
class MailService(
        private val mailSender: MailSender,
        private val mailConfiguration: MailConfiguration,
        private val thymeleafTemplateEngine: SpringTemplateEngine,
        private val config: YachtConfiguration
) {
    fun sendMail(receiver: String, title: String, text: String) {
        val message = SimpleMailMessage()

        message.setFrom(mailConfiguration.configuration.username)
        message.setSubject(title)
        message.setText(text)
        message.setTo(receiver)

        mailSender.send(message)
    }

    fun sendMailTemplate(emailTemplate: EmailTemplate) {
        val thymeleafContext = Context()
        thymeleafContext.setVariable("username", emailTemplate.username)
        thymeleafContext.setVariable("email", emailTemplate.email)
        thymeleafContext.setVariable("url", emailTemplate.url)
        thymeleafContext.setVariable("baseUrl", config.baseUrl)

        val htmlBody = thymeleafTemplateEngine.process("mail-html-template-ru.html", thymeleafContext)

        val message = mailConfiguration.mailSender().createMimeMessage()

        val helper = MimeMessageHelper(message, true, "UTF-8")

        helper.setSubject("Восстановление пароля")
        helper.setFrom(mailConfiguration.configuration.username)
        helper.setTo(emailTemplate.email)
        helper.setText(this.textMessage(emailTemplate), htmlBody)

        mailConfiguration.mailSender().send(message)
    }

    fun textMessage(emailTemplate: EmailTemplate): String {
        return """
                Здравствуйте, ${emailTemplate.username}!
                
                Вы запросили восстановления пароля. Просто перейдите по 
                указанной ссылке, Вы войдете в Yachtsman Journal и сможете 
                изменить свой пароль: 
                ${emailTemplate.url}
                
                Если Вы не запрашивали изменение пароля, просто 
                проигнорируйте данное сообщение. Если Вы подозреваете, что 
                Ваш аккаунт взломан, пожалуйста, свяжитесь с нами 
                support@yachtsmanjournal.com.

                С уважением,
                Команда портала 
                Yachtsman Journal
                """
    }
}