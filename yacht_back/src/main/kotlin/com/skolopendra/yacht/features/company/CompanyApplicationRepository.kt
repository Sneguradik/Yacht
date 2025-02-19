package com.skolopendra.yacht.features.company

import com.skolopendra.yacht.features.user.User
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface CompanyApplicationRepository : PagingAndSortingRepository<CompanyApplication, Long> {
    fun findByCompany(company: User): Iterable<CompanyApplication>
}