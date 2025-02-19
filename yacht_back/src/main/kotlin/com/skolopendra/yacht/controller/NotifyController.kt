package com.skolopendra.yacht.controller

import com.skolopendra.yacht.configuration.WebSocketConfig.Companion.TOPIC_USER_PREFIX
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class NotifyController(
        private val simpMessagingTemplate: SimpMessagingTemplate
) {

    data class HelloMessage(
            var name: String
    )

    @PostMapping("notify")
    fun markRead(@RequestBody message: HelloMessage) {
        simpMessagingTemplate.convertAndSendToUser(message.name, TOPIC_USER_PREFIX, message)
        println(message)
    }

}
