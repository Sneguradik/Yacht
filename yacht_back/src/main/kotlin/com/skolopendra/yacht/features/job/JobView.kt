package com.skolopendra.yacht.features.job

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.SQLInsert
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(
        name = "job_view",
        uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "job_id"]),
            UniqueConstraint(columnNames = ["fingerprint", "job_id"])]
)
@SQLInsert(sql = "INSERT INTO job_view (job_id, fingerprint, user_id, created_at) VALUES (?, ?, ?, now()) ON CONFLICT DO NOTHING")
class JobView(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @Column(nullable = true)
        val fingerprint: String?,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = true, fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        val user: User?,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "job_id")
        val job: Job
)
