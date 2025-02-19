package com.skolopendra.yacht.service.seed

import com.skolopendra.yacht.features.user.UserRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class GroupSeed(
        val userRepository: UserRepository
) {
    @Transactional
    fun run() {
        val adminUser = userRepository.findFirstByEmail("admin@yachtsmanjournal.com")
        if (adminUser != null) {
            adminUser.isPinned = true
            userRepository.save(adminUser)
        }
    }
}