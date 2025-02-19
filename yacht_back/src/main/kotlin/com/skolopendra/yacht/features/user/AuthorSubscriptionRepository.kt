package com.skolopendra.yacht.features.user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface AuthorSubscriptionRepository : JpaRepository<AuthorSubscription, UUID> {
    fun deleteByUserAndAuthor(user: User, author: User): Long
    fun countByAuthor(author: User): Long
    fun findAllByUser(user: User): List<AuthorSubscription>
}
