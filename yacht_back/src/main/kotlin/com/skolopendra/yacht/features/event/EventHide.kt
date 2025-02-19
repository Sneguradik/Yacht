package com.skolopendra.yacht.features.event

import com.skolopendra.yacht.features.article.EventHideId
import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "event_hide")
class EventHide(
        @EmbeddedId
        val id: EventHideId,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("userId")
        val user: User,

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @MapsId("eventId")
        val event: Event
) {
    constructor(user: User, event: Event) : this(EventHideId(user.id, event.id), user = user, event = event)
}
