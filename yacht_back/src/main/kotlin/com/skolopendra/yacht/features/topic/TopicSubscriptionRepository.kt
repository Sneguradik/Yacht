package com.skolopendra.yacht.features.topic

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface TopicSubscriptionRepository : JpaRepository<TopicSubscription, UUID> {
    fun deleteByUserAndTopic(user: User, topic: Topic): Long
    fun countByTopic(topic: Topic): Long
    fun findAllByTopicIn(topics: List<Topic>): List<TopicSubscription>
    fun findAllByUser(user: User): List<TopicSubscription>
}
