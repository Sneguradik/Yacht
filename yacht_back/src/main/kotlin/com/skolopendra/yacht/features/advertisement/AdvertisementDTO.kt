package com.skolopendra.yacht.features.advertisement

import java.sql.Timestamp

data class AdvertisementDTO(
        val place: Advertisement.Place?,
        val rotation: Double?,
        val url: String?,
        val picture: String?,

        val active: Boolean,
        val placeType: Advertisement.PlaceType?,
        val afterPublication: Long?,
        val text: String?,
        val name: String?,

        val startDateTime: Timestamp?,
        val stopDateTime: Timestamp?,

        val startViewsTime: Timestamp?,
        val stopViewsCount: Long?,

        val startClicksTime: Timestamp?,
        val stopClicksCount: Long?
) {
    companion object {
        fun fromData(advertisement: Advertisement): AdvertisementDTO =
                AdvertisementDTO(
                        advertisement.place,
                        advertisement.rotation,
                        advertisement.url,
                        advertisement.picture,
                        advertisement.active,
                        advertisement.placeType,
                        advertisement.afterPublication,
                        advertisement.text,
                        advertisement.name,
                        advertisement.startDateTime,
                        advertisement.stopDateTime,
                        advertisement.startViewsTime,
                        advertisement.stopViewsCount,
                        advertisement.startClicksTime,
                        advertisement.stopClicksCount

                )
    }
}
