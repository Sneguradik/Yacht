package com.skolopendra.yacht.entity.publication

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@MappedSuperclass
open class Publication(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "author_id")
        var author: User
) {
    enum class Stage {
        DRAFT,
        REVIEWING,
        PUBLISHED,
        BLOCKED
    }
}
