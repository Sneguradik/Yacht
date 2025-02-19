package com.skolopendra.yacht.features.topic

import com.skolopendra.lib.ImageUploadService
import com.skolopendra.lib.ObjectPatcher
import com.skolopendra.yacht.assertedFind
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.features.article.ArticleRepository
import com.skolopendra.yacht.features.tag.ArticleTag
import com.skolopendra.yacht.features.tag.Tag
import com.skolopendra.yacht.features.tag.TagRepository
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.awt.image.BufferedImage
import javax.persistence.EntityManager
import javax.persistence.EntityNotFoundException
import javax.persistence.LockModeType
import javax.persistence.PersistenceContext
import javax.validation.Validator

@Service
class TopicService(
    private val validator: Validator,
    private val topicSubscriptionRepository: TopicSubscriptionRepository,
    private val tagRepository: TagRepository,
    private val articleTopicRepository: ArticleTopicRepository,
    private val articleRepository: ArticleRepository,
    private val dsl: DSLContext

) {
    @Autowired
    lateinit var topicRepository: TopicRepository

    @Autowired
    lateinit var imageUploadService: ImageUploadService

    @PersistenceContext
    lateinit var entityManager: EntityManager

    fun create(name: String, url: String?): Topic {
        return topicRepository.save(Topic(name = name, url = url))
    }

    @Transactional
    fun changeImage(id: Long, image: BufferedImage, owner: User): Topic {
        val topic = entityManager.getReference(Topic::class.java, id)
            ?: throw NoSuchElementException("Could not find topic with id $id")
        entityManager.lock(topic, LockModeType.PESSIMISTIC_WRITE)
        entityManager.refresh(topic)
        topic.image = imageUploadService.cropToCenterSquareAndUpload(200, image)
        return topicRepository.save(topic)
    }

    @Transactional
    fun deleteImage(id: Long, owner: User): Topic {
        val topic = entityManager.getReference(Topic::class.java, id)
            ?: throw NoSuchElementException("Could not find topic with id $id")
        entityManager.lock(topic, LockModeType.PESSIMISTIC_WRITE)
        entityManager.refresh(topic)
        topic.image = null
        return topicRepository.save(topic)
    }

    @Transactional
    fun changeTopicImage(id: Long, image: BufferedImage, owner: User): Topic {
        val topic = entityManager.getReference(Topic::class.java, id)
            ?: throw NoSuchElementException("Could not find topic with id $id")
        entityManager.lock(topic, LockModeType.PESSIMISTIC_WRITE)
        entityManager.refresh(topic)
        topic.profileCoverUrl = imageUploadService.resizeToFixedSize(700, 265, image)
        return topicRepository.save(topic)
    }

    @Transactional
    fun deleteTopicImage(id: Long, owner: User): Topic {
        val topic = entityManager.getReference(Topic::class.java, id)
            ?: throw NoSuchElementException("Could not find topic with id $id")
        entityManager.lock(topic, LockModeType.PESSIMISTIC_WRITE)
        entityManager.refresh(topic)
        topic.profileCoverUrl = null
        return topicRepository.save(topic)
    }

    fun patch(id: Long, patch: Map<String, Any?>): Topic {
        val topic = topicRepository.assertedFind(id)
        return topicRepository.save(ObjectPatcher(topic, validator).apply(patch))
    }

    fun delete(id: Long) {
        topicRepository.deleteById(id)
    }

    @Transactional
    fun advancedDelete(id: Long, tags: List<String>?, newTopic: Topic?) {

        val topic = topicRepository.findByIdOrNull(id) ?: throw EntityNotFoundException("Topic with $id not found")
        val oldArticleTopics = articleTopicRepository.findAllByTopic(topic)

        if (tags != null) {
            val newTags = tags.map {
                tagRepository.findByContent(it) ?: Tag(content = it)
            }
            oldArticleTopics.forEach { elem ->
                val article = elem.article
                newTags.forEach {
                    val counter = article.tags.size
                    if (!article.tags.map { tag -> tag.tag.content }.contains(it.content) && counter < 10) {
                        article.tags.add(ArticleTag(article = article, tag = it, rank = (counter + 1).toShort()))
                    }
                }
                elem.article = article
            }
        }

        if (newTopic != null) {
            oldArticleTopics.forEach { elem ->
                val article = elem.article
                val newArticleTopic = articleTopicRepository.findFirstByArticleAndTopic(article, newTopic) ?: ArticleTopic(article = article, topic = newTopic, rank = articleTopicRepository.findFirstByArticleAndTopic(article, topic)?.rank ?: throw NoSuchElementException("Could not find topic"))
                val oldTopicList = articleTopicRepository.findFirstByArticleAndTopic(article, topic = topic) ?: throw NoSuchElementException("Could not find topic")
                elem.article.topics.remove(oldTopicList)
                elem.topic.articles.minus(oldTopicList)
                elem.article.topics.add(newArticleTopic)
            }
        }
        articleTopicRepository.saveAll(oldArticleTopics)
        topicRepository.deleteById(id)
    }

    fun topicSubscribe(user: User, topic: Topic) {
        topicSubscriptionRepository.save(TopicSubscription(user, topic))
    }

    @Transactional
    fun topicUnsubscribe(user: User, topic: Topic) {
        topicSubscriptionRepository.deleteByUserAndTopic(user, topic)
    }

    fun getCountPublishedPerTopic(topicId: Long): Long {
        val postsCount = dsl
            .selectCount()
            .from(Tables.ARTICLE_TOPIC)
            .innerJoin(Tables.ARTICLE)
            .on(Tables.ARTICLE.ID.eq(Tables.ARTICLE_TOPIC.ARTICLE_ID), Tables.ARTICLE.isPublished())
            .where(Tables.ARTICLE_TOPIC.TOPIC_ID.eq(topicId))
            .fetchOne()?.value1() ?: 0

        return postsCount.toLong()
    }

    fun getOneByUrl(url: String?): Topic {
        return topicRepository.findFirstByUrl(url!!) ?: throw EntityNotFoundException("Topic with $url not found")
    }
}
