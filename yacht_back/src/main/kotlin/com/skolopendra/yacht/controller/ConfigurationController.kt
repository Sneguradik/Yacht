package com.skolopendra.yacht.controller

import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.RankingConfigValue
import com.skolopendra.yacht.service.ConfigurationService
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*

@RestController
@Secured(Roles.CHIEF_EDITOR)
@RequestMapping("/config")
class ConfigurationController(
        val service: ConfigurationService
) {
    @GetMapping("ranking")
    fun list(): List<RankingConfigValue> = service.list()

    data class Value(val value: Float)

    @PutMapping("ranking/{key}")
    fun set(@PathVariable key: String, @RequestBody value: Value): RankingConfigValue = service.set(key, value.value)
}