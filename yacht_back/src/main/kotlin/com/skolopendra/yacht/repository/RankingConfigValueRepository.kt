package com.skolopendra.yacht.repository

import com.skolopendra.yacht.entity.RankingConfigValue
import org.springframework.data.jpa.repository.JpaRepository

interface RankingConfigValueRepository : JpaRepository<RankingConfigValue, String>