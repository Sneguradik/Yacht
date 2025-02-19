package com.skolopendra.yacht.features.event

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EventNonUniqueViewRepository : JpaRepository<EventNonUniqueView, Long> {

    fun findFirstByEvent(event: Event): EventNonUniqueView?
}