package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.access.annotations.CompanyAccount
import com.skolopendra.yacht.access.annotations.Owner
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.access.Role
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemStatService
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemType
import com.skolopendra.yacht.features.showcase.StaticShowcaseService
import com.skolopendra.yacht.features.tag.TagShowcaseService
import com.skolopendra.yacht.features.topic.TopicShowcaseService
import com.skolopendra.yacht.features.user.UserManagementService
import org.springframework.security.access.annotation.Secured
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@Secured(Roles.CHIEF_EDITOR)
@RequestMapping("/articles/{id}")
class ArticleManagementController(
        private val service: ArticleManagementService,
        private val articleRepository: ArticleRepository,
        private val showcaseStaticItemStatService: ShowcaseStaticItemStatService,
        private val userManagementService: UserManagementService,
        private val topicShowcaseService: TopicShowcaseService,
        private val tagShowcaseService: TagShowcaseService,
        private val showcaseService: StaticShowcaseService
) {
    /** Mark article as ready for review */
    @Owner
    @PostMapping("submit")
    fun submit(@PathVariable("id") article: Article) = service.submit(article)

    /** Return article to draft stage */
    @Owner
    @DeleteMapping("submit")
    fun retract(@PathVariable("id") article: Article) {
        service.retract(article)
        showcaseStaticItemStatService.upsertStats(article.author.id, itemType = ShowcaseStaticItemType.AUTHOR, currentPostsCount = articleRepository.countByAuthorAndPublicationStage(article.author, Publication.Stage.PUBLISHED))
        article.topics.toMutableSet().parallelStream().forEach {
            topicShowcaseService.upsertTopiShowcaseStat(it.topic.id)
        }
        article.tags.toMutableSet().parallelStream().forEach {
            tagShowcaseService.upsertShowcaseTagStats(it.tag.id)
        }
        val showcaseItem = showcaseService.getItemByItemIdAndType(article.id, ShowcaseStaticItemType.ARTICLE)
        if (showcaseItem != null) {
            showcaseService.withdraw(showcaseItem)
        }
    }

    /** Block article from being submitted or published */
    @Secured(Roles.CHIEF_EDITOR)
    @PostMapping("block")
    fun block(@PathVariable("id") article: Article) = service.block(article)

    /** Remove block */
    @DeleteMapping("block")
    fun unblock(@PathVariable("id") article: Article) = service.unblock(article)

    /** Publish the article (makes it visible in feed) */
    @CompanyAccount
    @PostMapping("publish")
    @PreAuthorize("hasAnyRole('ROLE_CHIEF_EDITOR') or (hasRole('ROLE_PRIVILEGED_USER') and @publicationSecurityService.isAuthor(#article))")
    fun publish(@PathVariable("id") article: Article) {
        val roleName = Roles.PRIVILEGED_USER
        val author = article.author
        service.publish(article)

        if (articleRepository.countByAuthorAndPublicationStage(author, Publication.Stage.PUBLISHED) >= 3 &&
                !author.roles.any { it.id.roleName == roleName })
            userManagementService.addRole(author, Role(roleName))
        showcaseStaticItemStatService.upsertStats(author.id, itemType = ShowcaseStaticItemType.AUTHOR, currentPostsCount = articleRepository.countByAuthorAndPublicationStage(author, Publication.Stage.PUBLISHED))
        article.topics.toMutableSet().parallelStream().forEach {
            topicShowcaseService.upsertTopiShowcaseStat(it.topic.id)
        }
        article.tags.toMutableSet().parallelStream().forEach {
            tagShowcaseService.upsertShowcaseTagStats(it.tag.id)
        }
    }

    /** Withdraw the article (makes it visible to author only) */
    @Owner
    @DeleteMapping("publish")
    fun withdraw(@PathVariable("id") article: Article) {
        service.withdraw(article)
        showcaseStaticItemStatService.upsertStats(article.author.id, itemType = ShowcaseStaticItemType.AUTHOR, currentPostsCount = articleRepository.countByAuthorAndPublicationStage(article.author, Publication.Stage.PUBLISHED))
        article.topics.toMutableSet().parallelStream().forEach {
            topicShowcaseService.upsertTopiShowcaseStat(it.topic.id)
        }
        article.tags.toMutableSet().parallelStream().forEach {
            tagShowcaseService.upsertShowcaseTagStats(it.tag.id)
        }
        val showcaseItem = showcaseService.getItemByItemIdAndType(article.id, ShowcaseStaticItemType.ARTICLE)
        if (showcaseItem != null) {
            showcaseService.withdraw(showcaseItem)
        }
    }

    /** Delete the article */
    @Owner
    @DeleteMapping
    fun delete(@PathVariable("id") article: Article) {
        val topics = article.topics
        val tags = article.tags
        service.delete(article)
        showcaseStaticItemStatService.upsertStats(article.author.id, itemType = ShowcaseStaticItemType.AUTHOR, currentPostsCount = articleRepository.countByAuthorAndPublicationStage(article.author, Publication.Stage.PUBLISHED))
        topics.toMutableSet().parallelStream().forEach {
            topicShowcaseService.upsertTopiShowcaseStat(it.topic.id)
        }
        tags.toMutableSet().parallelStream().forEach {
            tagShowcaseService.upsertShowcaseTagStats(it.tag.id)
        }
        val showcaseItem = showcaseService.getItemByItemIdAndType(article.id, ShowcaseStaticItemType.ARTICLE)
        if (showcaseItem != null) {
            showcaseService.withdraw(showcaseItem)
        }
    }
}
