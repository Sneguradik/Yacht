package com.skolopendra.yacht.features.job

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface JobNonUniqueViewRepository : JpaRepository<JobNonUniqueView, Long> {
    fun findFirstByJob(job: Job): JobNonUniqueView?
}