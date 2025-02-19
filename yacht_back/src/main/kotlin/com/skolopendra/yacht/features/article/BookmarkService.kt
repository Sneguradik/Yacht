package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.user.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.orm.jpa.JpaSystemException
import org.springframework.stereotype.Service

@Service
class BookmarkService {
    @Autowired
    lateinit var bookmarkRepository: BookmarkRepository

    fun mark(article: Article, user: User) {
        try {
            bookmarkRepository.save(Bookmark(user = user, article = article))
        } catch (ex: JpaSystemException) {
            /**
             * @see ArticleService.markViewed - the catch{} block
             */
        }
    }

    fun remove(article: Article, user: User) {
        bookmarkRepository.deleteByUserAndArticle(user, article)
    }
}