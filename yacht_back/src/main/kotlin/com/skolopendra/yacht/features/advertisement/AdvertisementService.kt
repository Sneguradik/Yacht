package com.skolopendra.yacht.features.advertisement

import com.skolopendra.lib.ImageUploadService
import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.lib.response
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.SearchService
import org.jooq.DSLContext
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import javax.imageio.ImageIO
import javax.validation.Validator

@Service
class AdvertisementService(
        private val validator: Validator,
        private val advertisementRepository: AdvertisementRepository,
        private val advertisementRepositoryCustom: AdvertisementRepositoryCustom,
        private val imageUploadService: ImageUploadService,
        private val dsl: DSLContext,
        private val searchService: SearchService
) {
    companion object {
        val DEFAULT = selectTree {
            +"id"
            +"createdAt"
            +"updatedAt"
            +"name"
            +"text"
            +"place"
            +"placeType"
            +"rotation"
            +"url"

            +"clicksCount"
            +"viewsCount"
            +"picture"
            +"active"
            +"afterPublication"

            +"startDateTime"
            +"stopDateTime"

            +"startViewsTime"
            +"stopViewsCount"

            +"startClicksTime"
            +"stopClicksCount"
        }
    }

    fun getAdvertisement(id: Long): GraphResult {
        return advertisementRepositoryCustom.graph().apply {
            query.addConditions(Tables.ADVERTISEMENT.ID.eq(id))
        }.fetchSingle(DEFAULT)
    }

    fun getAdvertisements(
            pageable: PageRequest,
            place: Advertisement.Place?,
            order: List<AdvertisementOrder>?,
            searchQuery: String?
    ): PageResponse<GraphResult> {
        return advertisementRepositoryCustom.graph().apply {
            if (searchQuery != null) searchService.advertisementSearchQuery(query, searchQuery)
            advertisementRepositoryCustom.applyQuery(query, order, place)
        }.fetchPage(DEFAULT, pageable).response()
    }

    fun getActiveAdvertisements(
            pageable: PageRequest,
            place: Advertisement.Place?,
            order: List<AdvertisementOrder>?,
            searchQuery: String?
    ): PageResponse<GraphResult> {
        return advertisementRepositoryCustom.graph().apply {
            if (searchQuery != null) searchService.advertisementSearchQuery(query, searchQuery)
            advertisementRepositoryCustom.applyQuery(query, order, place)
            query.addConditions(Tables.ADVERTISEMENT.ACTIVE.isTrue)
        }.fetchPage(DEFAULT, pageable).response()
    }

    @Transactional
    fun update(advertisement: Advertisement, advertisementDTO: AdvertisementDTO): Advertisement {
        if (advertisementDTO.active) {
            if (advertisementDTO.place == null)
                throw IllegalArgumentException("place is null")
            else {
                advertisement.clicksCount = 0
                advertisement.viewsCount = 0
            }
        }

        return advertisementRepository.save(
                advertisement.apply {
                    place = advertisementDTO.place
                    rotation = advertisementDTO.rotation
                    url = advertisementDTO.url
                    picture = advertisementDTO.picture

                    active = advertisementDTO.active
                    placeType = advertisementDTO.placeType
                    afterPublication = advertisementDTO.afterPublication
                    text = advertisementDTO.text
                    name = advertisementDTO.name

                    startDateTime = advertisementDTO.startDateTime
                    stopDateTime = advertisementDTO.stopDateTime

                    startViewsTime = advertisementDTO.startViewsTime
                    stopViewsCount = advertisementDTO.stopViewsCount

                    startClicksTime = advertisementDTO.startClicksTime
                    stopClicksCount = advertisementDTO.stopClicksCount
                })
    }

    @Transactional
    fun createAdvertisement(dto: AdvertisementDTO): Advertisement {
        if (dto.place != null && dto.active) {
            if (dto.afterPublication == null)
                throw IllegalArgumentException("afterPublication is null")

            if (advertisementRepository.findByActiveIsTrueAndPlaceAndAfterPublication(dto.place, dto.afterPublication) != null)
                throw IllegalStateException("there's already an element here")
        }

        return advertisementRepository.save(
                Advertisement(
                        place = dto.place,
                        rotation = dto.rotation,
                        url = dto.url,
                        picture = dto.picture,
                        active = dto.active,
                        afterPublication = dto.afterPublication,
                        placeType = dto.placeType,
                        text = dto.text,
                        name = dto.name,
                        startDateTime = dto.startDateTime,
                        stopDateTime = dto.stopDateTime,
                        startViewsTime = dto.startViewsTime,
                        stopViewsCount = dto.stopViewsCount,
                        startClicksTime = dto.startClicksTime,
                        stopClicksCount = dto.stopClicksCount
                )
        )

    }

    data class Image(
            val width: Int,
            val height: Int
    )

    fun pictureSize(place: Advertisement.Place): Image {
        return when (place) {
            Advertisement.Place.HEADER -> Image(1440, 100)
            Advertisement.Place.FEED1 -> Image(1060, 100)
            Advertisement.Place.FEED2 -> Image(1060, 100)
            Advertisement.Place.FEED3 -> Image(1060, 100)
            Advertisement.Place.PUBLICATION_ABOVE_COMMENTS -> Image(1060, 100)
            Advertisement.Place.PUBLICATION_BELOW_COMMENTS -> Image(1060, 100)
            Advertisement.Place.PUBLICATION_SIDEBAR -> Image(300, 600)
        }
    }

    // TODO: Размеры в зависимости от типа
    @Transactional
    fun changePicture(advertisement: Advertisement, file: MultipartFile?): Advertisement {
        val imageSize = pictureSize(advertisement.place!!)
        advertisement.picture = if (file != null)
            imageUploadService.resizeWithCrop(imageSize.width, imageSize.height, ImageIO.read(file.inputStream))
        else
            ""
        return advertisementRepository.save(advertisement)
    }

    @Transactional
    fun delete(advertisement: Advertisement) {
        return advertisementRepository.delete(advertisement)
    }

    @Transactional
    fun addClick(advertisement: Advertisement) {
        advertisement.clicksCount += 1
        if (advertisement.placeType == Advertisement.PlaceType.CLICKS_COUNT &&
                advertisement.clicksCount >= advertisement.stopClicksCount!!)
            advertisement.active = false
        advertisementRepository.save(advertisement)
    }

    @Transactional
    fun addView(advertisement: Advertisement) {
        advertisement.viewsCount += 1
        if (advertisement.placeType == Advertisement.PlaceType.VIEWS_COUNT &&
                advertisement.viewsCount >= advertisement.stopViewsCount!!)
            advertisement.active = false
        advertisementRepository.save(advertisement)
    }
}