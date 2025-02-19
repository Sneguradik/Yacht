package com.skolopendra.yacht.features.topic

import com.skolopendra.yacht.features.user.User
import org.hibernate.annotations.CreationTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "topic_hide")
class TopicHide(
        @EmbeddedId
        val id: TopicHideId,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @ManyToOne(fetch = FetchType.LAZY)
        @MapsId("userId")
        val user: User,

        @ManyToOne(fetch = FetchType.LAZY)
        @MapsId("topicId")
        val topic: Topic
) {
    constructor(user: User, topic: Topic) : this(TopicHideId(user.id, topic.id), user = user, topic = topic)
}
