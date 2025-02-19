package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.features.job.Job
import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "job_hide")
class JobHide(
        @EmbeddedId
        val id: JobHideId,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("userId")
        val user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("jobId")
        val job: Job
) {
    constructor(user: User, job: Job) : this(JobHideId(user.id, job.id), user = user, job = job)
}
