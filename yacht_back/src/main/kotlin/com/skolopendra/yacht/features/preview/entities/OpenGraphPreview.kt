package com.skolopendra.yacht.features.preview.entities

import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "open_graph_preview")
data class OpenGraphPreview(

        @Id
        @GeneratedValue(
                strategy = GenerationType.SEQUENCE,
                generator = "entity_id_seq"
        )
        @SequenceGenerator(
                name = "entity_id_seq",
                sequenceName = "global_id_sequence",
                allocationSize = 1
        )
        @Column(
                name = "id",
                unique = true,
                updatable = false,
                nullable = false
        )
        val id: Long? = null,
        var title: String? = null,

        @Column(name = "site_name", insertable = true, updatable = true)
        var siteName: String? = null,
        var url: String? = null,
        var image: String? = null,
        var description: String? = null,

        @Enumerated(EnumType.ORDINAL)
        @Column(name = "type", insertable = true, updatable = true)
        var type: PreviewSiteType = PreviewSiteType.WEBSITE,
        var card: String? = null,

        @Column(name = "updated_at")
        @UpdateTimestamp
        var updatedAt: Timestamp = Timestamp(0)
)

enum class PreviewSiteType {
    WEBSITE
}