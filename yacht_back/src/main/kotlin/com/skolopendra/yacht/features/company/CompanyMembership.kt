package com.skolopendra.yacht.features.company

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import java.sql.Timestamp
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "company_membership")
class CompanyMembership(
        @Id
        val id: UUID = UUID.randomUUID(),

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", nullable = false)
        val user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "company_id", nullable = false)
        val company: User
)
