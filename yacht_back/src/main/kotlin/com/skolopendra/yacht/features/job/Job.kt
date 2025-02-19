package com.skolopendra.yacht.features.job

import com.fasterxml.jackson.annotation.JsonProperty
import com.skolopendra.lib.Patchable
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
class Job(
        // System data
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        // Access
        @Enumerated(EnumType.ORDINAL)
        @Column(name = "publication_stage", nullable = false)
        var publicationStage: Publication.Stage = Publication.Stage.DRAFT,

        var publishedAt: Timestamp? = null,

        @ManyToOne
        @JoinColumn(name = "company_id")
        val company: User,

        // Business data
        @property:Patchable
        @get:JsonProperty("info")
        @Embedded
        var info: JobInfo? = JobInfo(),

        @property:Patchable
        @get:JsonProperty("body")
        @Embedded
        var body: JobBody? = JobBody()
) {
    enum class Currency {
        RUB,
        USD,
        EUR
    }

    enum class Type {
        FULL,
        PART_TIME
    }

    enum class Place {
        OFFICE,
        REMOTE
    }
}
