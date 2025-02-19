package com.skolopendra.yacht.features.user

import org.hibernate.annotations.CreationTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "user_recovery")
class UserRecovery(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val time: Timestamp = Timestamp(0),

        @Column
        var hash: String? = null,

        @Column
        var used: Boolean? = null,

        @Column
        var usedAt: Timestamp? = null,

        @ManyToOne(optional = false, fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
        @JoinColumn(name="user_id")
        val user: User? = null
)
