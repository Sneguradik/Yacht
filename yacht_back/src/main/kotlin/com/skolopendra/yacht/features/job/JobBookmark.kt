package com.skolopendra.yacht.features.job

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(
        name = "job_bookmark",
        uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "job_id"])]
)
class JobBookmark(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        val user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "job_id")
        val job: Job
)
