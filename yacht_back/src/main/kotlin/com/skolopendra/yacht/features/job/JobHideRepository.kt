package com.skolopendra.yacht.features.job

import com.skolopendra.yacht.features.article.JobHide
import com.skolopendra.yacht.features.article.JobHideId
import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository

interface JobHideRepository : JpaRepository<JobHide, JobHideId> {
    fun deleteByUserAndJob(user: User, job: Job)
}