package com.skolopendra.yacht.features.showcase

import com.skolopendra.lib.Patchable
import com.skolopendra.yacht.entity.publication.Publication
import com.vladmihalcea.hibernate.type.interval.PostgreSQLIntervalType
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import java.time.Duration
import javax.persistence.*

@Entity
@Table(name = "showcase_static_item")
@TypeDef(
        typeClass = PostgreSQLIntervalType::class,
        defaultForType = Duration::class
)
class ShowcaseStaticItem(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @Enumerated(EnumType.ORDINAL)
        var publicationStage: Publication.Stage = Publication.Stage.DRAFT,

        var publishedAt: Timestamp? = null,

        @Column(name = "item_id")
        var itemId: Long? = null,

        @Column(name = "item_type")
        @Enumerated(EnumType.ORDINAL)
        var itemType: ShowcaseStaticItemType = ShowcaseStaticItemType.CUSTOM,

        // Business
        @property:Patchable
        @Embedded
        var info: ShowcaseStaticItemInfo = ShowcaseStaticItemInfo()
)