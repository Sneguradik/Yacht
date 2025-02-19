package com.skolopendra.yacht.features.company

import com.skolopendra.lib.error.AlreadyExistsException
import com.skolopendra.yacht.event.UserSubscribedEvent
import com.skolopendra.yacht.features.user.AuthorSubscription
import com.skolopendra.yacht.features.user.AuthorSubscriptionRepository
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CompanyService(
        private val users: UserRepository,
        private val authorSubscriptionRepository: AuthorSubscriptionRepository,
        private val eventPublisher: ApplicationEventPublisher
) {
    @Transactional
    fun create(owner: User) {
        if (owner.company.isCompany) {
            throw AlreadyExistsException()
        }
        owner.company.isCompany = true
        users.save(owner)
    }

    @Transactional
    fun delete(id: Long) {
        // TODO
    }

    fun userSubscribe(user: User, target: User) {
        authorSubscriptionRepository.save(AuthorSubscription(user, target))
        eventPublisher.publishEvent(UserSubscribedEvent(target, user))
    }

    @Transactional
    fun userUnsubscribe(user: User, target: User) {
        authorSubscriptionRepository.deleteByUserAndAuthor(user, target)
    }
}