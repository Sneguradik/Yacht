package com.skolopendra.yacht.features.user

import com.skolopendra.yacht.configuration.YachtConfiguration
import com.skolopendra.yacht.service.EmailTemplate
import com.skolopendra.yacht.service.MailService
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.Instant
import java.util.*
import javax.transaction.Transactional

@Service
class UserRecoveryService(
    private val userRepository: UserRepository,
    private val userService: UserService,
    private val userRecoveryRepository: UserRecoveryRepository,
    private val mailService: MailService,
    private val yachtConf: YachtConfiguration
) {
    fun checkRecovery(email: String, hash: String): UserRecovery {
        val user = userRepository.findFirstByEmail(email)
            ?: throw IllegalStateException("There's no such recovery request")

        val recovery = userRecoveryRepository.findByUserAndUsedIsFalse(user)
        if (recovery != null && recovery.hash == hash) {
            if (recovery.time.before(Timestamp(System.currentTimeMillis() + yachtConf.mail.lifeTimeMs))) {
                return recovery
            } else {
                throw IllegalStateException("Token is out of date")
            }
        } else {
            throw IllegalStateException("There's no such recovery request")
        }
    }

    fun useRecovery(hash: String, email: String, password: String) {
        val recovery = this.checkRecovery(email, hash)

        recovery.used = true
        userRecoveryRepository.save(recovery)

        if (recovery.user != null) {
            userService.changePassword(recovery.user, password)
        } else {
            throw IllegalStateException("There's no such user")
        }
    }

    @Transactional
    fun createRecovery(email: String): UserRecovery {
        val user = userRepository.findFirstByEmail(email)

        // Yes, i know. Possible not a good decision.
        val alphabet: List<Char> = ('a'..'z') + ('A'..'Z') + ('0'..'9')
        val randomString: String = List(64) { alphabet.random() }.joinToString("")

        if (user?.email == null)
            throw IllegalStateException("There's no such email")

        val lastRecovery = userRecoveryRepository.findFirstByUserOrderByUsedAt(user)
        if (lastRecovery?.usedAt != null) {
            val lastTime = lastRecovery.usedAt?.toInstant() ?: throw NoSuchElementException()
            val currentTime = Instant.now()

            if (currentTime.isBefore(lastTime.plusMillis(yachtConf.mail.delay.toLong())) && currentTime.isAfter(lastTime))
                throw IllegalStateException("Try your request later")
        }

        val userRecovery = userRecoveryRepository.findByUserAndUsedIsFalse(user)
        if (userRecovery != null) {
            userRecovery.used = true
            userRecovery.usedAt = Timestamp(System.currentTimeMillis())
            userRecoveryRepository.save(userRecovery)
        }

        val userRecoveryNew = userRecoveryRepository.save(
            UserRecovery(
                hash = randomString,
                user = user,
                used = false
            )
        )

        val url = "${yachtConf.baseUrl}/recovery?code=${randomString}&email=${user.email}"

        mailService.sendMailTemplate(EmailTemplate(user.username, user.email!!, url))

        return userRecoveryNew

    }
}
