package com.skolopendra.yacht.features.job

import com.skolopendra.yacht.features.event.Event
import com.skolopendra.yacht.features.event.EventNonUniqueView
import org.springframework.orm.jpa.JpaSystemException
import org.springframework.stereotype.Service
import javax.persistence.EntityManager
import javax.persistence.EntityNotFoundException
import javax.persistence.PersistenceContext

@Service
class JobNonUniqueViewService(
        private val jobNonUniqueViewRepository: JobNonUniqueViewRepository
) {
    @PersistenceContext
    lateinit var entityManager: EntityManager

    fun markViewed(jobId: Long) {
        val jobRef = entityManager.getReference(Job::class.java, jobId)
        val jobView = jobNonUniqueViewRepository.findFirstByJob(jobRef)
        jobNonUniqueViewRepository.save(jobView?.apply { viewsCount += 1 }
                ?: JobNonUniqueView(job = jobRef, viewsCount = 1))
    }

    fun getViewsByJob(jobId: Long): Int {
        val jobRef = entityManager.getReference(Job::class.java, jobId)
        val jobView = jobNonUniqueViewRepository.findFirstByJob(jobRef)
                ?: throw EntityNotFoundException("No views found by $jobId")

        return jobView.viewsCount
    }
}