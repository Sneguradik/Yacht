package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.auth.currentUser
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
import javax.persistence.EntityManager

@RestController
class BookmarkController(
        private val bookmarkService: BookmarkService,
        private val entityManager: EntityManager
) {
    /**
     * Bookmark an article
     */
    @PostMapping("/articles/{id}/bookmark")
    fun post(@PathVariable id: Long) {
        bookmarkService.mark(entityManager.getReference(Article::class.java, id), currentUser())
    }

    /**
     * Remove a bookmark
     */
    @Transactional
    @DeleteMapping("/articles/{id}/bookmark")
    fun delete(@PathVariable id: Long) {
        bookmarkService.remove(entityManager.getReference(Article::class.java, id), currentUser())
    }
}