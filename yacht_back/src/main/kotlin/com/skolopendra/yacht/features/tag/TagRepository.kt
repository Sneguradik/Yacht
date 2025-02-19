package com.skolopendra.yacht.features.tag

import org.springframework.data.repository.PagingAndSortingRepository
import java.sql.Timestamp

interface TagRepository : PagingAndSortingRepository<Tag, Long> {
    fun findByContent(content: String): Tag?
    fun findAllByCreatedAtBetween(createdAt: Timestamp, createdAt2: Timestamp): List<Tag>
    fun findByContentIsIn(content: List<String>): List<Tag>
    fun countByIdIsIn(id: List<Long>): Long
}
