package com.skolopendra.yacht.entity.vote

import com.skolopendra.yacht.features.user.User
import java.io.Serializable
import javax.persistence.*

@MappedSuperclass
open class Vote(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        /**
         * Either 1 (vote up) or -1 (vote down)
         * Sum of vote values for article produces article score
         */
        val value: Short,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        val user: User
) : Serializable