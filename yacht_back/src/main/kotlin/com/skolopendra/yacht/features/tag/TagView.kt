package com.skolopendra.yacht.features.tag

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "tag_view")
class TagView(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        var updatedAt: Timestamp = Timestamp(0),

        @Column(nullable = true)
        val fingerprint: String? = null,

        @ManyToOne(optional = true, fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", referencedColumnName = "id")
        val user: User? = null,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "tag_id", referencedColumnName = "id")
        val tag: Tag
)
