package com.skolopendra.yacht.features.auth

import com.skolopendra.yacht.AccountOrigin
import com.skolopendra.yacht.features.user.User
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "credentials")
class Credentials(
        @Id
        val id: UUID = UUID.randomUUID(),

        @ManyToOne(optional = false)
        @JoinColumn(name = "user_id", nullable = false)
        val user: User,

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        val origin: AccountOrigin,

        @Column(nullable = false)
        val serviceId: String,

        var password: String?
)