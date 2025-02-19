package com.skolopendra.yacht.entity.subscription

import com.skolopendra.yacht.features.user.User
import java.util.*
import javax.persistence.*

@MappedSuperclass
open class Subscription(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        val id: UUID = UUID.randomUUID(),

        /**
         * Owner of the subscription
         */
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        val user: User,

        /**
         * If true, this subscription will rank the item lower, or hide it
         */
        var bad: Boolean = false
)