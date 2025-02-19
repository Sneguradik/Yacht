package com.skolopendra.yacht.features.advertisement

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.UrlResponse
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import javax.validation.Valid

@Validated
@RestController
@RequestMapping("/advertisement")
class AdvertisementController(
        private val advertisementService: AdvertisementService
) {
    @GetMapping("all")
    fun getAdvertisements(
            @RequestParam(name = "page", defaultValue = "0") page: Int,
            @RequestParam(name = "place", required = false) place: Advertisement.Place?,
            @RequestParam(name = "order", required = false) order: List<AdvertisementOrder>?,
            @RequestParam("query", required = false) searchQuery: String?
    ): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        return advertisementService.getAdvertisements(pageable, place, order, searchQuery)
    }

    @GetMapping("active")
    fun getActiveAdvertisements(
            @RequestParam(name = "page", defaultValue = "0") page: Int,
            @RequestParam(name = "place", required = false) place: Advertisement.Place?,
            @RequestParam(name = "order", required = false) order: List<AdvertisementOrder>?,
            @RequestParam("query", required = false) searchQuery: String?
    ): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        return advertisementService.getActiveAdvertisements(pageable, place, order, searchQuery)
    }

    @GetMapping("{id}")
    fun getAdvertisement(
            @PathVariable id: Long
    ): GraphResult {
        return advertisementService.getAdvertisement(id)
    }

    @PostMapping("click/{id}")
    fun addAdvertisementClick(
            @PathVariable("id") advertisement: Advertisement
    ) {
        return advertisementService.addClick(advertisement)
    }

    @PostMapping("view/{id}")
    fun addAdvertisementView(
            @PathVariable("id") advertisement: Advertisement
    ) {
        return advertisementService.addView(advertisement)
    }

    @Secured(Roles.SUPERUSER, Roles.SALES)
    @PostMapping
    fun createAdvertisement(
            @Valid @RequestBody advertisementDTO: AdvertisementDTO
    ): Advertisement {
        return advertisementService.createAdvertisement(advertisementDTO)
    }

    @Secured(Roles.SUPERUSER, Roles.SALES)
    @DeleteMapping("{id}")
    fun deleteAdvertisement(
            @PathVariable("id") advertisement: Advertisement
    ) {
        return advertisementService.delete(advertisement)
    }

    @Secured(Roles.SUPERUSER, Roles.SALES)
    @PutMapping("{id}")
    fun updateAdvertisement(
            @PathVariable("id") advertisement: Advertisement,
            @RequestBody advertisementDTO: AdvertisementDTO
    ): Advertisement {
        return advertisementService.update(advertisement, advertisementDTO)
    }

//    @Secured(Roles.SUPERUSER, Roles.SALES)
    @PutMapping("{id}/picture")
    @ResponseStatus(HttpStatus.OK)
    fun updatePicture(@PathVariable("id") advertisement: Advertisement,
                      @RequestParam("file", required = false) file: MultipartFile?
    ): UrlResponse {
        val changedEntity = advertisementService.changePicture(advertisement, file)
        return UrlResponse(changedEntity.picture!!)
    }
}