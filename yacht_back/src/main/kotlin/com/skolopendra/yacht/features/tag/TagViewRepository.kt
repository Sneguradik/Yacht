package com.skolopendra.yacht.features.tag

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TagViewRepository : JpaRepository<TagView, Long> {
    fun findFirstByTagAndUser(tag: Tag, user: User): TagView?
    fun findFirstByTagAndFingerprint(tag: Tag, fingerprint: String): TagView?
}