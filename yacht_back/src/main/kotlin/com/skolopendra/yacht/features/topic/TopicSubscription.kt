package com.skolopendra.yacht.features.topic

import com.skolopendra.yacht.entity.subscription.Subscription
import com.skolopendra.yacht.features.user.User
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne

@Entity
class TopicSubscription(
        user: User,

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "topic_id")
        val topic: Topic
) : Subscription(user = user)