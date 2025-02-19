package com.skolopendra.yacht.features.admin

import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.service.RankingService
import org.springframework.security.access.annotation.Secured
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@Validated
@RestController
@RequestMapping("administration/events")
class AdminJobsEventsController(
        private val rankingService: RankingService
) {

    data class AdminJobsEventsRanking(
            val feed: JobsEventsRankingBoolean?,
            val publications: JobsEventsRankingBoolean?,
            val popular: JobsEventsRankingBoolean?,
            val publicationsBottom: Boolean?,

            val firstView: JobsEventsRankingInt = JobsEventsRankingInt(),
            val secondView: JobsEventsRankingInt = JobsEventsRankingInt(),
            val thirdView: JobsEventsRankingInt = JobsEventsRankingInt()
    )

    data class JobsEventsRankingBoolean(
            val jobs: Boolean,
            val events: Boolean
    )

    data class JobsEventsRankingInt(
            val jobs: Int = 0,
            val events: Int = 0
    )

    @GetMapping
    fun getRanking(): AdminJobsEventsRanking = rankingService.getJobsEventsRanking()

    @Secured(Roles.SUPERUSER)
    @PostMapping
    fun postRanking(@Valid @RequestBody rating: AdminJobsEventsRanking) = rankingService.editJobsEventsRanking(rating)
}
