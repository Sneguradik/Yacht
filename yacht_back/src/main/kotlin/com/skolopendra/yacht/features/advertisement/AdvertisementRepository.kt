package com.skolopendra.yacht.features.advertisement

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AdvertisementRepository : JpaRepository<Advertisement, Long> {
    fun findByActiveIsTrueAndPlaceAndAfterPublication(place: Advertisement.Place, afterPublication: Long): Advertisement?
    fun findAllByActiveIsTrue(pageable: Pageable): Page<Advertisement>
    fun findAllByActiveIsTrueAndPlace(place: Advertisement.Place, pageable: Pageable): Page<Advertisement>
    fun findAllByPlace(place: Advertisement.Place, pageable: Pageable): Page<Advertisement>
}