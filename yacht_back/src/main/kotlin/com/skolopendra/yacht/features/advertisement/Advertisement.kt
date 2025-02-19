package com.skolopendra.yacht.features.advertisement

import com.skolopendra.lib.Patchable
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.sql.Timestamp
import javax.persistence.*

@Patchable
@Entity
class Advertisement(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,

        @CreationTimestamp
        val createdAt: Timestamp = Timestamp(0),

        @UpdateTimestamp
        val updatedAt: Timestamp = Timestamp(0),

        @Column(name = "name")
        var name: String? = null,

        @Column(name = "text")
        var text: String? = null,

        @Enumerated(EnumType.ORDINAL)
        @Column(name = "place")
        var place: Place? = null,

        @Column(name = "rotation")
        var rotation: Double?,

        @Column(name = "url")
        var url: String? = null,

        @Column(name = "clicksCount")
        var clicksCount: Int = 0,

        @Column(name = "viewsCount")
        var viewsCount: Int = 0,

        @Column(name = "picture")
        var picture: String? = null,

        var active: Boolean = false,

        var afterPublication: Long?,

        @Enumerated(EnumType.ORDINAL)
        @Column(name = "place_type")
        var placeType: PlaceType? = PlaceType.TIME_INTERVAL,

        var startDateTime: Timestamp?,
        var stopDateTime: Timestamp?,

        var startViewsTime: Timestamp?,
        var stopViewsCount: Long?,

        var startClicksTime: Timestamp?,
        var stopClicksCount: Long?
) {
    enum class Place {
        HEADER, FEED1, FEED2, FEED3, PUBLICATION_ABOVE_COMMENTS, PUBLICATION_BELOW_COMMENTS, PUBLICATION_SIDEBAR
    }

    enum class PlaceType {
        TIME_INTERVAL, VIEWS_COUNT, CLICKS_COUNT
    }
}
