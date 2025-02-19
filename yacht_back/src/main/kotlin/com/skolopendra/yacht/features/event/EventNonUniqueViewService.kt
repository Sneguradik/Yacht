package com.skolopendra.yacht.features.event

import org.springframework.orm.jpa.JpaSystemException
import org.springframework.stereotype.Service
import javax.persistence.EntityManager
import javax.persistence.EntityNotFoundException
import javax.persistence.PersistenceContext

@Service
class EventNonUniqueViewService(
        private val eventNonUniqueViewRepository: EventNonUniqueViewRepository
) {
    @PersistenceContext
    lateinit var entityManager: EntityManager

    fun markViewed(eventId: Long) {
        val eventRef = entityManager.getReference(Event::class.java, eventId)
        val eventView = eventNonUniqueViewRepository.findFirstByEvent(eventRef)
        eventNonUniqueViewRepository.save(eventView?.apply { viewsCount += 1 }
                ?: EventNonUniqueView(event = eventRef, viewsCount = 1))
    }

    fun getViewsByEvent(eventId: Long): Int {
        val eventRef = entityManager.getReference(Event::class.java, eventId)
        val eventView = eventNonUniqueViewRepository.findFirstByEvent(eventRef)
                ?: throw EntityNotFoundException("No views found by $eventId")

        return eventView.viewsCount
    }
}