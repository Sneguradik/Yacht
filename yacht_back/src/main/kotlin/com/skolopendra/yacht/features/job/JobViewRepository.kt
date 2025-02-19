package com.skolopendra.yacht.features.job

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface JobViewRepository : JpaRepository<JobView, Long>