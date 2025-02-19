package com.skolopendra.yacht.features.topic

import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemStatService
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemType
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import javax.persistence.EntityNotFoundException

@Service
class TopicShowcaseService(
    private val topicRepository: TopicRepository,
    private val topicSubscription: TopicSubscriptionRepository,
    private val topicService: TopicService,
    private val showcaseStaticItemStatService: ShowcaseStaticItemStatService
) {

    fun countSubscribersByTopic(topicId: Long): Long {
        val topic = topicRepository.findByIdOrNull(topicId) ?: throw EntityNotFoundException("Topic with id not found")
        return topicSubscription.countByTopic(topic)
    }

    fun countPublicationsByTopic(topicId: Long): Long {
        return topicService.getCountPublishedPerTopic(topicId)
    }

    fun upsertTopiShowcaseStat(topicId: Long, postOffset: Long = 0, subsOffset: Long = 0) {
        showcaseStaticItemStatService.upsertStats(
            topicId,
            itemType = ShowcaseStaticItemType.TOPIC,
            currentSubscribersCount = countSubscribersByTopic(topicId) + subsOffset,
            currentPostsCount = countPublicationsByTopic(topicId) + postOffset
        )
    }
}