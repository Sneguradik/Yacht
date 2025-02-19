package com.skolopendra.yacht.features.event

import com.fasterxml.jackson.annotation.JsonProperty
import com.skolopendra.lib.Patchable
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
class Event(
        // Meta
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

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "company_id")
        val company: User,

        // Business
        @property:Patchable
        @get:JsonProperty("info")
        @Embedded
        var info: EventInfo? = EventInfo(),

        @property:Patchable
        @get:JsonProperty("body")
        @Embedded
        var body: EventBody? = EventBody()
) {
    enum class Currency {
        FREE,
        RUB,
        USD,
        EUR,
        NONE
    }

    enum class Type {
        OTHER,
        EXHIBITIONS,
        TRAINING,
        REGATTAS,
        FLOTILLAS,
        PRESENTATIONS,
        CONFERENCES,
        FORUMS
    }
}