package com.skolopendra.yacht.repository

import com.skolopendra.yacht.entity.JobAndEventPlaces
import com.skolopendra.yacht.entity.JobAndEventViews
import org.springframework.data.jpa.repository.JpaRepository

interface JobAndEventViewsRepository : JpaRepository<JobAndEventViews, Long> {

    fun findFirstByWherePlace(wherePlaces: JobAndEventPlaces.JobAndEvent): JobAndEventViews?

}
