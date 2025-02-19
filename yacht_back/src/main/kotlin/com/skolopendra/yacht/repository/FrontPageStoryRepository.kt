package com.skolopendra.yacht.repository

import com.skolopendra.yacht.entity.FrontPageStory
import org.springframework.data.jpa.repository.JpaRepository

interface FrontPageStoryRepository : JpaRepository<FrontPageStory, Long>
