package com.skolopendra.yacht.features.tag

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TagNonUniqueViewRepository : JpaRepository<TagNonUniqueView, Long> {
    fun findFirstByTag(tag: Tag): TagNonUniqueView?
}