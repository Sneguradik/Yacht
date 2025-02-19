package com.skolopendra.yacht.features.company

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface CompanyMembershipRepository : JpaRepository<CompanyMembership, UUID> {
    fun deleteByCompanyAndUser(company: User, user: User)
}