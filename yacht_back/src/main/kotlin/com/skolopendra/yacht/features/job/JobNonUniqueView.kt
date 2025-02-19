package com.skolopendra.yacht.features.job

import com.skolopendra.yacht.features.article.Article
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*
import javax.validation.constraints.Min

@Entity
@Table(name = "job_non_unique_view")
class JobNonUniqueView(
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

    @OneToOne(optional = false, fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(name = "job_id", nullable = false)
    var job: Job? = null,

    @Min(0)
    @Column(name = "views_count")
    var viewsCount: Int = 0,

    @Column(name = "updated_at")
    @UpdateTimestamp
    val updatedAt: Timestamp = Timestamp(0)
)
