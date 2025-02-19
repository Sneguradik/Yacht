package com.skolopendra.yacht.features.event

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface EventRepository : JpaRepository<Event, Long> {
    @Modifying
    @Query("UPDATE Event e SET e.company = :master WHERE e.company = :slave")
    fun migrate(@Param("master") master: User, @Param("slave") slave: User)
}