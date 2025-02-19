package com.skolopendra.yacht.features.tag

import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*
import javax.validation.constraints.Min

@Entity
@Table(name = "tag_non_unique_view")
class TagNonUniqueView(

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

        @OneToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "tag_id", nullable = false)
        var tag: Tag? = null,

        @Min(0)
        @Column(name = "views_count")
        var viewsCount: Int = 0,

        @Column(name = "updated_at")
        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0)
)
