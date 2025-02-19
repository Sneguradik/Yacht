package com.skolopendra.yacht.features.event

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.SQLInsert
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(
        name = "event_view",
        uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "event_id"]),
            UniqueConstraint(columnNames = ["fingerprint", "event_id"])]
)
@SQLInsert(sql = "INSERT INTO event_view (event_id, fingerprint, user_id, created_at) VALUES (?, ?, ?, now()) ON CONFLICT DO NOTHING")
class EventView(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @Column(nullable = true)
        val fingerprint: String?,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = true, fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        val user: User?,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "event_id")
        val event: Event
)
