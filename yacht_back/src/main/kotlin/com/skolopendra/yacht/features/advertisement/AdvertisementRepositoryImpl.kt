package com.skolopendra.yacht.features.advertisement

import com.skolopendra.lib.graph.Graph
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.yacht.entity.nullSort
import com.skolopendra.yacht.jooq.Tables
import org.jooq.*
import org.jooq.impl.DSL
import org.springframework.stereotype.Repository

@Repository
class AdvertisementRepositoryImpl(
    val dsl: DSLContext
) : AdvertisementRepositoryCustom {
    companion object {
        val GRAPH = (Graph on Tables.ADVERTISEMENT) {
            val u = Tables.ADVERTISEMENT

            "id" from u.ID
            "createdAt" from u.CREATED_AT
            "updatedAt" from u.UPDATED_AT
            "name" from u.NAME
            "text" from u.TEXT
            "place" from (u.PLACE enum Advertisement.Place.values())
            "placeType" from (u.PLACE_TYPE enum Advertisement.PlaceType.values())
            "rotation" from u.ROTATION
            "url" from u.URL

            "clicksCount" from u.CLICKS_COUNT
            "viewsCount" from u.VIEWS_COUNT

            "picture" from u.PICTURE
            "active" from u.ACTIVE
            "afterPublication" from u.AFTER_PUBLICATION

            "startDateTime" from u.START_DATE_TIME
            "stopDateTime" from u.STOP_DATE_TIME

            "startViewsTime" from u.START_VIEWS_TIME
            "stopViewsCount" from u.STOP_VIEWS_COUNT

            "startClicksTime" from u.START_CLICKS_TIME
            "stopClicksCount" from u.STOP_CLICKS_COUNT
        }
    }

    override fun graph(): GraphQuery =
        GRAPH.create(dsl, mapOf())

    override fun count(): SelectQuery<Record1<Int>> =
        dsl.selectCount().from(Tables.ADVERTISEMENT).query

    override fun <T : Record> applyQuery(
        query: SelectQuery<T>,
        order: List<AdvertisementOrder>?,
        place: Advertisement.Place?
    ) {
        query.apply {
            if (order != null) {
                when {
                    order.contains(AdvertisementOrder.ID_ASC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.ID.nullSort(
                            SortOrder.ASC
                        )
                    )

                    order.contains(AdvertisementOrder.ID_DESC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.ID.nullSort(
                            SortOrder.DESC
                        )
                    )

                    order.contains(AdvertisementOrder.PLACE_ASC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.PLACE.nullSort(
                            SortOrder.ASC
                        )
                    )

                    order.contains(AdvertisementOrder.PLACE_DESC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.PLACE.nullSort(
                            SortOrder.DESC
                        )
                    )

                    order.contains(AdvertisementOrder.ACTIVITY_ASC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.ACTIVE.nullSort(
                            SortOrder.ASC
                        )
                    )

                    order.contains(AdvertisementOrder.ACTIVITY_DESC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.ACTIVE.nullSort(
                            SortOrder.DESC
                        )
                    )

                    order.contains(AdvertisementOrder.START_DATE_ASC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.START_DATE_TIME.nullSort(
                            SortOrder.ASC
                        )
                    )

                    order.contains(AdvertisementOrder.START_DATE_DESC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.START_DATE_TIME.nullSort(
                            SortOrder.DESC
                        )
                    )

                    order.contains(AdvertisementOrder.END_DATE_ASC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.STOP_DATE_TIME.nullSort(
                            SortOrder.ASC
                        )
                    )

                    order.contains(AdvertisementOrder.END_DATE_DESC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.STOP_DATE_TIME.nullSort(
                            SortOrder.DESC
                        )
                    )

                    order.contains(AdvertisementOrder.PLACE_PERIOD_ASC) -> query.addOrderBy(
                        DSL.localDateTimeDiff(
                            Tables.ADVERTISEMENT.STOP_DATE_TIME,
                            Tables.ADVERTISEMENT.START_DATE_TIME
                        ).nullSort(SortOrder.ASC)
                    )

                    order.contains(AdvertisementOrder.PLACE_PERIOD_DESC) -> query.addOrderBy(
                        DSL.localDateTimeDiff(
                            Tables.ADVERTISEMENT.STOP_DATE_TIME,
                            Tables.ADVERTISEMENT.START_DATE_TIME
                        )
                    )

                    order.contains(AdvertisementOrder.CLICKS_ASC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.CLICKS_COUNT.nullSort(
                            SortOrder.ASC
                        )
                    )

                    order.contains(AdvertisementOrder.CLICKS_DESC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.CLICKS_COUNT.nullSort(
                            SortOrder.DESC
                        )
                    )

                    order.contains(AdvertisementOrder.VIEWS_ASC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.VIEWS_COUNT.nullSort(
                            SortOrder.ASC
                        )
                    )

                    order.contains(AdvertisementOrder.VIEWS_DESC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.VIEWS_COUNT.nullSort(
                            SortOrder.DESC
                        )
                    )

                    order.contains(AdvertisementOrder.ROTATION_ASC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.ROTATION.nullSort(
                            SortOrder.ASC
                        )
                    )

                    order.contains(AdvertisementOrder.ROTATION_DESC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.ROTATION.nullSort(
                            SortOrder.DESC
                        )
                    )

                    order.contains(AdvertisementOrder.NAME_ASC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.NAME.nullSort(
                            SortOrder.ASC
                        )
                    )

                    order.contains(AdvertisementOrder.NAME_DESC) -> query.addOrderBy(
                        Tables.ADVERTISEMENT.NAME.nullSort(
                            SortOrder.DESC
                        )
                    )
                }
            }

            if (place != null) {
                when (place) {
                    Advertisement.Place.PUBLICATION_SIDEBAR -> query.addConditions(
                        Tables.ADVERTISEMENT.PLACE.eq(
                            Advertisement.Place.PUBLICATION_SIDEBAR.ordinal
                        )
                    )

                    Advertisement.Place.HEADER -> query.addConditions(Tables.ADVERTISEMENT.PLACE.eq(Advertisement.Place.HEADER.ordinal))
                    Advertisement.Place.FEED1 -> query.addConditions(Tables.ADVERTISEMENT.PLACE.eq(Advertisement.Place.FEED1.ordinal))
                    Advertisement.Place.FEED2 -> query.addConditions(Tables.ADVERTISEMENT.PLACE.eq(Advertisement.Place.FEED2.ordinal))
                    Advertisement.Place.FEED3 -> query.addConditions(Tables.ADVERTISEMENT.PLACE.eq(Advertisement.Place.FEED3.ordinal))
                    Advertisement.Place.PUBLICATION_ABOVE_COMMENTS -> query.addConditions(
                        Tables.ADVERTISEMENT.PLACE.eq(
                            Advertisement.Place.PUBLICATION_ABOVE_COMMENTS.ordinal
                        )
                    )

                    Advertisement.Place.PUBLICATION_BELOW_COMMENTS -> query.addConditions(
                        Tables.ADVERTISEMENT.PLACE.eq(
                            Advertisement.Place.PUBLICATION_BELOW_COMMENTS.ordinal
                        )
                    )
                }
            }
        }
    }
}
