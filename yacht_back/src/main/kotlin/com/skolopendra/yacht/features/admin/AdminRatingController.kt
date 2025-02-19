package com.skolopendra.yacht.features.admin

import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.service.RankingService
import org.springframework.security.access.annotation.Secured
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@Validated
@RestController
@Secured(Roles.SUPERUSER)
@RequestMapping("administration/ranking")
class AdminRankingController(
        private val rankingService: RankingService
) {

    data class AdminMainRating(
            val views: Float?,
            val comments: Float?,
            val favourites: Float?,
            val likes: Float?,
            val dislikes: Float?,
            val factor1: Float?,
            val factor2: Float?,
            val divider: Float?,
            val days: Float?,
            val userRanking: EnumMainRanking? = EnumMainRanking.MEDIAN
    )

    enum class EnumMainRanking(val value: Int?) {
        MEDIAN(0), MEAN(1);

        companion object {
            fun fromInt(value: Int?) = values().first { it.value == value }
        }
    }

    @GetMapping
    fun getRanking(): AdminMainRating = rankingService.getMainRanking()

    @PostMapping
    fun postRanking(@Valid @RequestBody rating: AdminMainRating) = rankingService.editMainRanking(rating)
}