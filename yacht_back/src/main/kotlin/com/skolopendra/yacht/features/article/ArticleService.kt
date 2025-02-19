package com.skolopendra.yacht.features.article

import com.skolopendra.lib.ImageUploadService
import com.skolopendra.yacht.assertedFind
import com.skolopendra.yacht.entity.isPublished
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.article.comment.Comment
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemStatService
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemType
import com.skolopendra.yacht.features.showcase.StaticShowcaseService
import com.skolopendra.yacht.features.tag.ArticleTag
import com.skolopendra.yacht.features.tag.TagNonUniqueViewService
import com.skolopendra.yacht.features.tag.TagRepository
import com.skolopendra.yacht.features.tag.TagShowcaseService
import com.skolopendra.yacht.features.topic.*
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.PostRenderService
import org.imgscalr.Scalr
import org.jooq.DSLContext
import org.springframework.data.repository.findByIdOrNull
import org.springframework.orm.jpa.JpaSystemException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.sql.Timestamp
import javax.imageio.ImageIO
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext
import javax.validation.Valid
import javax.validation.constraints.NotNull
import kotlin.math.min

@Service
class ArticleService(
        val renderService: PostRenderService,
        val tagRepository: TagRepository,
        val articleRepository: ArticleRepository,
        val articleViewRepository: ArticleViewRepository,
        val topicRepository: TopicRepository,
        val imageUploadService: ImageUploadService,
        private val showcaseStaticItemStatService: ShowcaseStaticItemStatService,
        private val staticShowcaseService: StaticShowcaseService,
        private val topicSubscriptionRepository: TopicSubscriptionRepository,
        private val topicService: TopicService,
        private val dsl: DSLContext,
        private val tagNonUniqueViewService: TagNonUniqueViewService,
        private val topicShowcaseService: TopicShowcaseService,
        private val tagShowcaseService: TagShowcaseService
) {
    companion object {
        const val CAN_EDIT = "CAN_EDIT"
    }

    @PersistenceContext
    lateinit var entityManager: EntityManager

    private fun isFingerprintValid(fingerprint: String): Boolean {
        return fingerprint.length == 32
    }

    /**
     * Mark article as viewed by user (or anonymous visitor, identified by fingerprint)
     * @param user A registered user who views the article
     * @param fingerprint If article is being viewed by anonymous user, a fingerprint must be present, it will be used
     * to identify and count unique views
     */
    fun markViewed(articleId: Long, user: User?, fingerprint: String?) {
        require(!(user == null && fingerprint == null)) { "Either user or fingerprint can be null, not both" }
        require(user != null || isFingerprintValid(fingerprint!!)) { "Fingerprint is not valid" }
        // Get article reference to prevent hitting the database on each view
        // We cannot use getOne because PagingAndSortingRepository does not have that method
        val articleRef = entityManager.getReference(Article::class.java, articleId)
        try {
            articleViewRepository.save(ArticleView(user = user, article = articleRef, fingerprint = fingerprint))
        } catch (ex: JpaSystemException) {
            // The exception is being thrown because of "ON CONFLICT" behaviour
            // TODO: Maybe figure out a way to make .save not throw an exception?
        }
    }

    fun createDraft(author: User): Long {
        val draft = articleRepository.save(Article(author))
        return draft.id
    }

    fun updateArticle(article: Article, newContent: String) {
        article.editableData = newContent
        article.renderedHtml = renderService.render(article.editableData)
        article.renderedTextOnly = renderService.renderText(article.editableData)
        articleRepository.save(article)
    }

    fun publish(id: Long) {
        val article = articleRepository.assertedFind(id)
        article.publicationStage = Publication.Stage.PUBLISHED
        article.publishedAt = Timestamp(System.currentTimeMillis())
        articleRepository.save(article)
    }

    /**
     * Removes "published" flag from article
     */
    fun withdraw(article: Article) {
        article.publicationStage = Publication.Stage.DRAFT
        articleRepository.save(article)
    }

    fun deleteArticle(articleId: Long) {
        articleRepository.deleteById(articleId)
    }

    fun updateTitle(article: Article, newTitle: String) {
        article.title = newTitle
        articleRepository.save(article)
    }

    fun updateSummary(article: Article, summary: String) {
        article.summary = summary
        articleRepository.save(article)
    }


    // TODO: Поменять размеры
    fun updateCover(article: Article, file: MultipartFile?): String {
        val uploaded = if (file != null) {
            val image = ImageIO.read(file.inputStream)
            val aspectRatio = image.width / image.height.toDouble()
            require(aspectRatio in 0.2f..5f) { "Image must not be stretched" }
            val scaled = Scalr.resize(image, 700, (700 / aspectRatio).toInt())
            val shownY = min(scaled.height, 409)
            val cropped = Scalr.crop(scaled, 0, (scaled.height - shownY) / 2, scaled.width, shownY)
            imageUploadService.uploadImage(cropped)
        } else {
            ""
        }

        article.cover = uploaded
        articleRepository.save(article)
        return uploaded
    }

    @Transactional
    fun updateTopics(article: Article, topics: List<Long>) {
        val ids = topics.distinct()
        val showcaseTopics = staticShowcaseService.getIdsByType(ShowcaseStaticItemType.TOPIC)
        article.topics.retainAll { ids.contains(it.id.topicId) }
        article.topics.forEach { it.rank = ids.indexOf(it.id.topicId).toShort() }
        ids.forEachIndexed { i, it ->
            if (!article.topics.any { attr -> attr.id.topicId == it })
                article.topics.add(ArticleTopic(article, topicRepository.findById(it).orElseThrow { NoSuchElementException("No topic with id $it") }, i.toShort()))
            if (showcaseTopics.contains(it.toLong())) {
                topicShowcaseService.upsertTopiShowcaseStat(it, postOffset = 1)
            }
        }
        article.topics.sortBy { it.rank }
    }

    data class TagIdList(
            @get:Valid
            val tags: List<@NotNull Long?>
    )

    @Transactional
    fun updateTags(article: Article, tags: List<Long>) {
        val ids = tags.distinct()
        val showcaseTags = staticShowcaseService.getIdsByType(ShowcaseStaticItemType.TAG)
        article.tags.retainAll { ids.contains(it.id.tagId) }
        article.tags.forEach { it.rank = ids.indexOf(it.id.tagId).toShort() }
        ids.forEachIndexed { i, it ->
            if (!article.tags.any { attr -> attr.id.tagId == it })
                article.tags.add(ArticleTag(article, tagRepository.findById(it).orElseThrow { NoSuchElementException("No tag with id $it") }, i.toShort()))
            if (showcaseTags.contains(it.toLong())) {
                tagShowcaseService.upsertShowcaseTagStats(it, postsOffset = 1)
            }
        }
        article.tags.sortBy { it.rank }
    }

    /* TODO
    @Transactional
    fun updateTagsText(id: Long, names: List<String>): TagIdList {
        val article = articleRepository.assertedFind(id)
        val tags = names.map { tagRepository.findByContent(it) ?: Tag(content = it) }
        article.tags.retainAll { tags.any { tag -> tag.id == it.id.tagId } }
        article.tags.forEach { it.rank = tags.indexOfFirst { tag -> tag.id == it.id.tagId }.toShort() }
        tags.forEachIndexed { i, tag ->
            if (!article.tags.any { attr -> attr.id.tagId == tag.id && tag.id != 0L })
                article.tags.add(ArticleTag(article, tag, i.toShort()))
        }
        article.tags.sortBy { it.rank }

    }
    */

    @Transactional
    fun updateStats() {
        entityManager.createNativeQuery("CALL article_stats_update()")!!.executeUpdate()
        entityManager.createNativeQuery("CALL recalculate_ranking_score()")!!.executeUpdate()
    }

    @Transactional
    fun clone(article: Article): Article {
        return articleRepository.save(article.apply {
            isEdited = true
            publicationStage = Publication.Stage.DRAFT
        })
    }

    @Transactional
    fun pinArticle(article: Article): Article {
        val list = articleRepository.findAllByPinnedAndAuthor(true, currentUser()).map {
            it.pinned = false
            it
        }
        articleRepository.saveAll(list)

        return if (article.publicationStage == Publication.Stage.PUBLISHED) {
            article.pinned = true
            articleRepository.save(article)
        } else {
            article
        }

    }

    @Transactional
    fun unpinArticle(article: Article): Article {
        article.pinned = false
        return articleRepository.save(article)
    }

    private fun copyComment(comment: Comment?, clone: Article): Comment {
        return if (comment?.parentComment == null)
            Comment(comment!!.author, comment.deletedAt, clone, null, comment.renderedHtml, comment.editableData, comment.votes)
        else
            Comment(comment.author, comment.deletedAt, clone, copyComment(comment.parentComment, clone), comment.renderedHtml, comment.editableData, comment.votes)
    }


}
