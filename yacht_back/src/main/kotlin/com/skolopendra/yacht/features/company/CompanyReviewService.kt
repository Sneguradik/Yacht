package com.skolopendra.yacht.features.company

import com.skolopendra.yacht.assertedFind
import com.skolopendra.yacht.features.user.User
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service

@Service
class CompanyReviewService(
        val applications: CompanyApplicationRepository
) {
    fun apply(company: User, message: String): CompanyApplication {
        val currentApplications = applications.findByCompany(company)
        if (currentApplications.any { it.status.isPending() }) {
            throw AccessDeniedException("You already have an application pending review")
        }
        val application = CompanyApplication(
                company = company,
                message = message
        )
        return applications.save(application)
    }

    fun start(id: Long) {
        val application = applications.assertedFind(id)
        check(application.status == CompanyApplication.Status.WAITING_FOR_REVIEW) { "Review already started" }
        application.status = CompanyApplication.Status.REVIEWING
        // TODO: Notify
        applications.save(application)
    }

    fun accept(id: Long) {
        val application = applications.assertedFind(id)
        check(application.status.isPending()) { "Already marked as ${application.status}" }
        application.status = CompanyApplication.Status.ACCEPTED
        application.company.company.isConfirmed = true
        // TODO: Notify
        applications.save(application)
    }

    fun reject(id: Long, reason: String) {
        val application = applications.assertedFind(id)
        check(application.status.isPending()) { "Already marked as ${application.status}" }
        application.status = CompanyApplication.Status.REJECTED
        application.rejectionReason = reason
        // TODO: Notify
        applications.save(application)
    }
}