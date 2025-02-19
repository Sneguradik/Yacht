package com.skolopendra.yacht.repository

import com.skolopendra.yacht.entity.Report
import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ReportRepository : JpaRepository<Report, Long> {
    fun findFirstByUserOrderByCreatedAtDesc(user: User): Report?
}
