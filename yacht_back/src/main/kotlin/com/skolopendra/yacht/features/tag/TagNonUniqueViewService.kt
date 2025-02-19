package com.skolopendra.yacht.features.tag

import org.springframework.stereotype.Service
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

@Service
class TagNonUniqueViewService(
        private val tagNonUniqueViewRepository: TagNonUniqueViewRepository
) {

    @PersistenceContext
    lateinit var entityManager: EntityManager

    fun markViewed(tagId: Long) {
        val tagRef = entityManager.getReference(Tag::class.java, tagId)
        val tag = tagNonUniqueViewRepository.findFirstByTag(tagRef)
        tagNonUniqueViewRepository.save(tag?.apply { viewsCount += 1 } ?: TagNonUniqueView(tag = tagRef, viewsCount = 1))
    }

    fun countByTag(tagId: Long): Long {
        val tagRef = entityManager.getReference(Tag::class.java, tagId)
        val tag = tagNonUniqueViewRepository.findFirstByTag(tagRef)
        return tag?.viewsCount?.toLong() ?: 0L
    }
}