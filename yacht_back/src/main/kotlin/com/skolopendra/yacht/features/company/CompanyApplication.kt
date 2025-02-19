package com.skolopendra.yacht.features.company

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
class CompanyApplication(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @Column(columnDefinition = "TEXT")
        val message: String = "",

        @Column(columnDefinition = "TEXT")
        var rejectionReason: String? = null,

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "company_id")
        val company: User,

        @Enumerated(EnumType.ORDINAL)
        var status: Status = Status.WAITING_FOR_REVIEW
) {
    enum class Status {
        WAITING_FOR_REVIEW,
        REVIEWING,
        ACCEPTED,
        REJECTED;

        fun isPending(): Boolean {
            return this == WAITING_FOR_REVIEW || this == REVIEWING
        }
    }
}