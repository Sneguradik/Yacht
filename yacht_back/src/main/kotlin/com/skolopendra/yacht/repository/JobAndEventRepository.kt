package com.skolopendra.yacht.repository

import com.skolopendra.yacht.entity.JobAndEventPlaces
import org.springframework.data.jpa.repository.JpaRepository

interface JobAndEventRepository : JpaRepository<JobAndEventPlaces, Long> {

    fun findFirstByPlace(places: JobAndEventPlaces.PlaceJobAndEvent): JobAndEventPlaces?

}
