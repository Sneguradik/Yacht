package com.skolopendra.yacht.entity

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "user_notify_settings")
class UserNotifySettings(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        var type: NotifyType? = null,

        var active: Boolean = false,

        @ManyToOne
        @JoinColumn(name = "user_id")
        val user: User
)
