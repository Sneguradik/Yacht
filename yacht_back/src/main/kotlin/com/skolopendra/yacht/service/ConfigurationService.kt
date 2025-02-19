package com.skolopendra.yacht.service

import com.skolopendra.yacht.assertedFind
import com.skolopendra.yacht.entity.RankingConfigValue
import com.skolopendra.yacht.repository.RankingConfigValueRepository
import org.springframework.stereotype.Service

@Service
class ConfigurationService(
        val rankingConfigValues: RankingConfigValueRepository
) {
    fun list(): List<RankingConfigValue> = rankingConfigValues.findAll()

    fun set(key: String, value: Float): RankingConfigValue {
        val item = rankingConfigValues.assertedFind(key)
        item.value = value
        return rankingConfigValues.save(item)
    }

}