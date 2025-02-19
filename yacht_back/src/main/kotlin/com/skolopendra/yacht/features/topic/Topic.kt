package com.skolopendra.yacht.features.topic

import com.fasterxml.jackson.annotation.JsonProperty
import com.skolopendra.lib.Patchable
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import org.hibernate.validator.constraints.Length
import java.sql.Timestamp
import javax.persistence.*
import javax.validation.constraints.Size

@Entity
@Table(name = "topic")
class Topic(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @property:Patchable
        @get:Length(min = 1, max = 26)
        var name: String,

        @Column(nullable = true)
        var image: String? = null,

        @property:Patchable
        @Column(unique = true, nullable = true)
        var url: String? = null,

        @property:Patchable
        @get:Length(max = 300)
        @get:Size(max = 300)
        @Column(nullable = true)
        var description: String? = null,

        @Column(nullable = true)
        var profileCoverUrl: String? = null,

        @property:Patchable
        @get:JsonProperty("fullDescription")
        @get:Length(max = 4096)
        @Column(name = "description_full")
        var descriptionFull: String = "",

        @OneToMany(mappedBy = "topic", fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
        val subscriptions: List<TopicSubscription> = listOf(),

        @OneToMany(mappedBy = "topic", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
        val articles: List<ArticleTopic> = listOf()
)
