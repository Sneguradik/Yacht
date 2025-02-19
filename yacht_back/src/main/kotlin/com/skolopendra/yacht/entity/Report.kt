package com.skolopendra.yacht.entity

import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.service.ReportService
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "report")
class Report(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @Column(name = "report_object_type")
        @Enumerated(EnumType.STRING)
        val reportObjectType: ReportService.ReportEntityType,

        @Column(name = "report_object_id")
        val reportObjectId: Long,

        @Column(nullable = true)
        val message: String? = null,

        var seen: Boolean = false,

        @Enumerated(EnumType.ORDINAL)
        var status: Status = Status.IN_REVIEW,

        @ManyToOne
        @JoinColumn(name = "user_id")
        val user: User
) {
    enum class Status {
        APPROVED,
        IN_REVIEW,
        REJECTED
    }
}
