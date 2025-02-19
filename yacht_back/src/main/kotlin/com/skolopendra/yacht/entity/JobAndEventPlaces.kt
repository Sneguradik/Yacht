package com.skolopendra.yacht.entity

import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "job_event_places")
class JobAndEventPlaces(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @Enumerated
        var wherePlace: JobAndEvent? = null,

        @Enumerated
        var place: PlaceJobAndEvent? = null
) {

    enum class JobAndEvent {
        JOB, EVENT, BOTH, NONE
    }

    enum class PlaceJobAndEvent {
        MY_FEED, NEWS_FEED, POPULAR, PUBLICATION
    }

}
