package com.skolopendra.yacht.features.showcase

import com.skolopendra.yacht.configuration.YachtConfiguration
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.article.Article
import com.skolopendra.yacht.features.article.ArticleNonUniqueViewRepository
import com.skolopendra.yacht.features.article.ArticleRepository
import com.skolopendra.yacht.features.article.ArticleViewRepository
import com.skolopendra.yacht.features.event.Event
import com.skolopendra.yacht.features.job.Job
import com.skolopendra.yacht.features.tag.Tag
import com.skolopendra.yacht.features.tag.TagNonUniqueViewService
import com.skolopendra.yacht.features.topic.Topic
import com.skolopendra.yacht.features.user.AuthorSubscriptionRepository
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.time.Instant
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

@Service
class StaticShowcaseCreationService(
        val items: ShowcaseStaticItemRepository,
        val articleViews: ArticleViewRepository,
        val authorSubscriptions: AuthorSubscriptionRepository,
        val articleNonUniqueViewRepository: ArticleNonUniqueViewRepository,
        val showcaseStaticItemStatService: ShowcaseStaticItemStatService,
        val articles: ArticleRepository,
        val config: YachtConfiguration,
        val dsl: DSLContext,
        val tagNonUniqueViewService: TagNonUniqueViewService
) {

    @Transactional
    fun fromArticle(article: Article): ShowcaseStaticItem {

        val exist = items.findFirstByItemIdAndItemType(article.id, ShowcaseStaticItemType.ARTICLE)

        val item = if (exist == null) {
            items.save(ShowcaseStaticItem().apply {
                info.cover = article.cover
                info.title = article.title ?: ""
                info.subtitle = article.topics.firstOrNull()?.topic?.name ?: ""
                info.ensureOptions().apply {
                    viewCount = articleNonUniqueViewRepository.findFirstByArticle(article)?.viewsCount
                            ?: 0//articleViews.countByArticle(article).toInt()
                }
                info.url = "${config.baseUrl}/${config.url.articles}/${article.id}"
                itemId = article.id
                itemType = ShowcaseStaticItemType.ARTICLE
            })
        } else {
            items.save(exist.apply {
                publicationStage = Publication.Stage.PUBLISHED
                publishedAt = Timestamp.from(Instant.now())
            })
        }

        showcaseStaticItemStatService.upsertStats(
                itemId = article.id,
                itemType = ShowcaseStaticItemType.ARTICLE,
                currentViewsCount = articleNonUniqueViewRepository.findFirstByArticle(article)?.viewsCount?.toLong() ?: 0L
        )

        return item
    }

    fun fromAuthor(author: User): ShowcaseStaticItem {
        val exist = items.findFirstByItemIdAndItemType(author.id, ShowcaseStaticItemType.AUTHOR)

        val item = if (exist == null) {
            items.save(ShowcaseStaticItem().apply {

                info.cover = author.profileCoverUrl
                val company = author.company.isCompany && (author.company.isConfirmed == true)

                info.title = if (company)
                    author.company.name ?: ""
                else
                    "${author.firstName} ${author.lastName}"

                info.ensureOptions().apply {
                    subCount = authorSubscriptions.countByAuthor(author).toInt()
                    postCount = articles.countByAuthorAndPublicationStage(author, Publication.Stage.PUBLISHED).toInt()
                }
                info.url = "${config.baseUrl}/${if (company) config.url.companies else config.url.users}/${author.id}"
                itemId = author.id
                itemType = ShowcaseStaticItemType.AUTHOR
            })
        } else {
            items.save(exist.apply {
                publicationStage = Publication.Stage.PUBLISHED
                publishedAt = Timestamp.from(Instant.now())
            })
        }

        showcaseStaticItemStatService.upsertStats(
                itemId = author.id,
                itemType = ShowcaseStaticItemType.AUTHOR,
                currentPostsCount = articles.countByAuthorAndPublicationStage(author, Publication.Stage.PUBLISHED).toLong(), currentSubscribersCount = authorSubscriptions.countByAuthor(author).toLong()
        )

        return item
    }

    fun fromTag(tag: Tag): ShowcaseStaticItem {
        val viewsCount = tagNonUniqueViewService.countByTag(tag.id)

        val postsCount = dsl
                .selectCount()
                .from(Tables.ARTICLE_TAG)
                .innerJoin(Tables.ARTICLE)
                .on(Tables.ARTICLE.ID.eq(Tables.ARTICLE_TAG.ARTICLE_ID), Tables.ARTICLE.isPublished())
                .where(Tables.ARTICLE_TAG.TAG_ID.eq(tag.id))
                .fetchOne()?.value1() ?: 0

        val exist = items.findFirstByItemIdAndItemType(tag.id, ShowcaseStaticItemType.TAG)

        val item = if (exist == null) {
            items.save(ShowcaseStaticItem().apply {
                info.title = tag.content
                info.ensureOptions().apply {
                    this.viewCount = viewsCount.toInt()
                    this.postCount = postsCount
                }
                info.url = "${config.baseUrl}/${config.url.tags}/${tag.id}"
                itemId = tag.id
                itemType = ShowcaseStaticItemType.TAG
            })
        } else {
            items.save(exist.apply {
                publicationStage = Publication.Stage.PUBLISHED
                publishedAt = Timestamp.from(Instant.now())
                info.ensureOptions().apply {
                    this.viewCount = viewsCount.toInt()
                    this.postCount = postsCount
                }
            })
        }

        showcaseStaticItemStatService.upsertStats(
                itemId = tag.id,
                itemType = ShowcaseStaticItemType.TAG,
                currentViewsCount = viewsCount.toLong(),
                currentPostsCount = postsCount.toLong()
        )

        return item
    }

    fun fromTopic(topic: Topic): ShowcaseStaticItem {

        val postsCount = dsl
                .selectCount()
                .from(Tables.ARTICLE_TOPIC)
                .innerJoin(Tables.ARTICLE)
                .on(Tables.ARTICLE.ID.eq(Tables.ARTICLE_TOPIC.ARTICLE_ID), Tables.ARTICLE.isPublished())
                .where(Tables.ARTICLE_TOPIC.TOPIC_ID.eq(topic.id))
                .fetchOne()?.value1() ?: 0

        val subsCount = dsl
                .selectCount()
                .from(Tables.TOPIC_SUBSCRIPTION)
                .where(Tables.TOPIC_SUBSCRIPTION.TOPIC_ID.eq(topic.id))
                .fetchOne()?.value1() ?: 0

        val exist = items.findFirstByItemIdAndItemType(topic.id, ShowcaseStaticItemType.TOPIC)

        val item = if (exist == null) {
            items.save(ShowcaseStaticItem().apply {
                info.cover = topic.profileCoverUrl
                info.title = topic.name
                info.ensureOptions().apply {
                    this.postCount = postsCount
                    this.subCount = subsCount
                }
                info.url = "${config.baseUrl}/${config.url.topics}/${topic.id}"
                itemId = topic.id
                itemType = ShowcaseStaticItemType.TOPIC
            })
        } else {
            items.save(exist.apply {
                publicationStage = Publication.Stage.PUBLISHED
                publishedAt = Timestamp.from(Instant.now())
                info.ensureOptions().apply {
                    this.postCount = postsCount
                    this.subCount = subsCount
                }
            })
        }

        showcaseStaticItemStatService.upsertStats(
                itemId = topic.id,
                itemType = ShowcaseStaticItemType.TOPIC,
                currentPostsCount = postsCount.toLong(),
                currentSubscribersCount = subsCount.toLong()
        )

        return item
    }

    fun fromJob(job: Job): ShowcaseStaticItem {

        val exist = items.findFirstByItemIdAndItemType(job.id, ShowcaseStaticItemType.JOB)

        val item = if (exist == null) {
            items.save(ShowcaseStaticItem().apply {
                info.cover = job.body?.image
                info.title = job.info?.name ?: ""
                info.subtitle = job.company.company.name ?: ""
                info.url = "${config.baseUrl}/${config.url.jobs}/${job.id}"
                itemId = job.id
                itemType = ShowcaseStaticItemType.JOB
            })
        } else {
            items.save(exist.apply {
                publicationStage = Publication.Stage.PUBLISHED
                publishedAt = Timestamp.from(Instant.now())
            })
        }

        showcaseStaticItemStatService.upsertStats(
                itemId = job.id,
                itemType = ShowcaseStaticItemType.JOB
        )

        return item
    }

    fun fromEvent(event: Event): ShowcaseStaticItem {

        val exist = items.findFirstByItemIdAndItemType(event.id, ShowcaseStaticItemType.EVENT)

        val item = if (exist == null) {
            items.save(ShowcaseStaticItem().apply {
                info.title = event.info?.name ?: ""
                info.subtitle = event.company.company.name ?: ""
                info.url = "${config.baseUrl}/${config.url.events}/${event.id}"
                itemId = event.id
                itemType = ShowcaseStaticItemType.EVENT
            })
        } else {
            items.save(exist.apply {
                publicationStage = Publication.Stage.PUBLISHED
                publishedAt = Timestamp.from(Instant.now())
            })
        }

        showcaseStaticItemStatService.upsertStats(
                itemId = event.id,
                itemType = ShowcaseStaticItemType.EVENT
        )

        return item
    }

    fun create(): ShowcaseStaticItem = items.save(ShowcaseStaticItem())
}
