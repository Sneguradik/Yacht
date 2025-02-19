package com.skolopendra.yacht.features.job

import com.skolopendra.yacht.features.user.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface JobRepository : JpaRepository<Job, Long> {
    @Modifying
    @Query("UPDATE Job j SET j.company = :master WHERE j.company = :slave")
    fun migrate(@Param("master") master: User, @Param("slave") slave: User)
}
