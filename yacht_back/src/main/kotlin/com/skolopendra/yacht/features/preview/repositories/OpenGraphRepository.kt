package com.skolopendra.yacht.features.preview.repositories

import com.skolopendra.yacht.features.preview.entities.OpenGraphPreview
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OpenGraphRepository : JpaRepository<OpenGraphPreview, Long> {
    fun findFirstByUrl(url: String): OpenGraphPreview?
}