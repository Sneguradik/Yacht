package com.skolopendra.yacht.features.showcase

import com.skolopendra.lib.ImageUploadService
import com.skolopendra.lib.ObjectPatcher
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.article.Article
import com.skolopendra.yacht.features.article.ArticleNonUniqueViewRepository
import com.skolopendra.yacht.features.article.ArticleRepository
import com.skolopendra.yacht.features.user.User
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.sql.Timestamp
import java.time.Instant
import javax.imageio.ImageIO
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext
import javax.validation.Validator

@Service
class StaticShowcaseService(
        private val views: ShowcaseStaticItemViewRepository,
        private val showcaseStaticItemRepository: ShowcaseStaticItemRepository,
        private val articleNonUniqueViewRepository: ArticleNonUniqueViewRepository,
        private val items: ShowcaseStaticItemRepository,
        private val imageUploadService: ImageUploadService,
        private val validator: Validator
) {

    @PersistenceContext
    lateinit var entityManager: EntityManager

    fun storeView(user: User, item: ShowcaseStaticItem) {
        views.save(ShowcaseStaticItemView(user, item))
    }

    @Transactional
    fun delete(item: ShowcaseStaticItem) {
        items.delete(item)
    }

    fun patch(item: ShowcaseStaticItem, patch: Map<String, Any?>) {
        items.save(ObjectPatcher(item, validator).apply(patch))
    }

    fun withdraw(item: ShowcaseStaticItem) {
        if (item.publicationStage != Publication.Stage.DRAFT) {
            item.publicationStage = Publication.Stage.DRAFT
            items.save(item)
        }
    }

    fun publish(item: ShowcaseStaticItem) {
        item.publicationStage = Publication.Stage.PUBLISHED
        item.publishedAt = Timestamp.from(Instant.now())
        items.save(item)
    }

    fun updateCover(item: ShowcaseStaticItem, file: MultipartFile?): String {
        val url = if (file != null) {
            imageUploadService.uploadImage(ImageIO.read(file.inputStream))
        } else {
            ""
        }
        item.info.cover = url
        items.save(item)
        return url
    }

    fun getIdsByType(type: ShowcaseStaticItemType) : List<Long?> {
        return showcaseStaticItemRepository.findAllByItemType(type).map { it.itemId }
    }

    fun getItemByItemIdAndType(itemId: Long, itemType: ShowcaseStaticItemType): ShowcaseStaticItem? {
        return showcaseStaticItemRepository.findFirstByItemIdAndItemType(itemId, itemType)
    }

}