package com.skolopendra.yacht.features.topic

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository


@Repository
interface TopicRepository : JpaRepository<Topic, Long> {
    fun findByName(name: String): Topic?
    fun findFirstByUrl(url: String): Topic?
}