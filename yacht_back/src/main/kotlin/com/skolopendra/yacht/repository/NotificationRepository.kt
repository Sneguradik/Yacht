package com.skolopendra.yacht.repository

import com.skolopendra.yacht.entity.Notification
import com.skolopendra.yacht.features.user.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface NotificationRepository : JpaRepository<Notification, Long> {
    fun countByUserAndReadIsFalseAndTypeIn(user: User, type: List<String>): Long
    fun findAllByUserAndReadIsFalseAndTypeInOrderByReadAscCreatedAtDesc(user: User, type: List<String>, pageable: Pageable): Page<Notification>
    fun findAllByUserAndTypeInOrderByReadAscCreatedAtDesc(user: User, type: List<String>, pageable: Pageable): Page<Notification>
}
