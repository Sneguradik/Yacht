package com.skolopendra.yacht.features.job

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface JobBookmarkRepository : JpaRepository<JobBookmark, Long> {
    fun deleteByUserAndJob(user: User, job: Job)
}