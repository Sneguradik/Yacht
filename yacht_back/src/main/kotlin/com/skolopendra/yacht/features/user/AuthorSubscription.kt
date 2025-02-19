package com.skolopendra.yacht.features.user

import com.skolopendra.yacht.entity.subscription.Subscription
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne

@Entity
class AuthorSubscription(
        user: User,

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "author_id")
        val author: User
) : Subscription(user = user)