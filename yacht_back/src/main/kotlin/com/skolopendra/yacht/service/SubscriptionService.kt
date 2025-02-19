package com.skolopendra.yacht.service

import com.skolopendra.yacht.event.UserSubscribedEvent
import com.skolopendra.yacht.features.topic.Topic
import com.skolopendra.yacht.features.topic.TopicSubscription
import com.skolopendra.yacht.features.topic.TopicSubscriptionRepository
import com.skolopendra.yacht.features.user.AuthorSubscription
import com.skolopendra.yacht.features.user.AuthorSubscriptionRepository
import com.skolopendra.yacht.features.user.User
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SubscriptionService(
        val topicSubscriptionRepository: TopicSubscriptionRepository,
        val authorSubscriptionRepository: AuthorSubscriptionRepository,
        val eventPublisher: ApplicationEventPublisher
) {
    fun topicSubscribe(user: User, topic: Topic) {
        topicSubscriptionRepository.save(TopicSubscription(user, topic))
    }

    fun userSubscribe(user: User, target: User) {
        authorSubscriptionRepository.save(AuthorSubscription(user, target))
        eventPublisher.publishEvent(UserSubscribedEvent(target, user))
    }

    @Transactional
    fun topicUnsubscribe(user: User, topic: Topic) {
        topicSubscriptionRepository.deleteByUserAndTopic(user, topic)
    }

    @Transactional
    fun userUnsubscribe(user: User, target: User) {
        authorSubscriptionRepository.deleteByUserAndAuthor(user, target)
    }
}
