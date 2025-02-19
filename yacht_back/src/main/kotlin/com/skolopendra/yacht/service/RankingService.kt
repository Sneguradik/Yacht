package com.skolopendra.yacht.service

import com.skolopendra.yacht.entity.JobAndEventPlaces
import com.skolopendra.yacht.entity.JobAndEventViews
import com.skolopendra.yacht.features.admin.AdminJobsEventsController
import com.skolopendra.yacht.features.admin.AdminRankingController
import com.skolopendra.yacht.features.article.ArticleService
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.repository.JobAndEventRepository
import com.skolopendra.yacht.repository.JobAndEventViewsRepository
import org.jooq.DSLContext
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class RankingService(
        val dsl: DSLContext,
        private val jobAndEventRepository: JobAndEventRepository,
        private val jobAndEventViewsRepository: JobAndEventViewsRepository,
        private val articleService: ArticleService
) {
    fun getMainRanking(): AdminRankingController.AdminMainRating {
        val ranking = dsl.select().from(Tables.RANKING_CONFIG).fetch()
                .intoMap(Tables.RANKING_CONFIG.ID, Tables.RANKING_CONFIG.VALUE)

        return AdminRankingController.AdminMainRating(
                views = ranking["ranking.view"],
                comments = ranking["ranking.comment"],
                favourites = ranking["ranking.bookmark"],
                likes = ranking["ranking.vote-up"],
                dislikes = ranking["ranking.vote-down"],
                factor1 = ranking["ranking.factor1"],
                factor2 = ranking["ranking.factor2"],
                divider = ranking["ranking.divider"],
                days = ranking["ranking.days"],
                userRanking = AdminRankingController.EnumMainRanking.fromInt(ranking["ranking.userMethod"]!!.toInt())
        )
    }

    @Transactional
    fun editMainRanking(rating: AdminRankingController.AdminMainRating) {
        val config = Tables.RANKING_CONFIG

        if (rating.views != null)
            dsl.update(config).set(config.VALUE, rating.views).where(config.ID.eq("ranking.view")).execute()
        if (rating.comments != null)
            dsl.update(config).set(config.VALUE, rating.comments).where(config.ID.eq("ranking.comment")).execute()
        if (rating.favourites != null)
            dsl.update(config).set(config.VALUE, rating.favourites).where(config.ID.eq("ranking.bookmark")).execute()
        if (rating.likes != null)
            dsl.update(config).set(config.VALUE, rating.likes).where(config.ID.eq("ranking.vote-up")).execute()
        if (rating.dislikes != null)
            dsl.update(config).set(config.VALUE, rating.dislikes).where(config.ID.eq("ranking.vote-down")).execute()
        if (rating.divider != null)
            dsl.update(config).set(config.VALUE, rating.divider).where(config.ID.eq("ranking.divider")).execute()
        if (rating.factor1 != null)
            dsl.update(config).set(config.VALUE, rating.factor1).where(config.ID.eq("ranking.factor1")).execute()
        if (rating.factor2 != null)
            dsl.update(config).set(config.VALUE, rating.factor2).where(config.ID.eq("ranking.factor2")).execute()
        if (rating.days != null)
            dsl.update(config).set(config.VALUE, rating.days).where(config.ID.eq("ranking.days")).execute()
        if (rating.userRanking != null)
            dsl.update(config).set(config.VALUE, rating.userRanking.value!!.toFloat()).where(config.ID.eq("ranking.userMethod")).execute()

        articleService.updateStats()

    }

    fun getJobsEventsRanking(): AdminJobsEventsController.AdminJobsEventsRanking {
        val jobViews = jobAndEventViewsRepository.findFirstByWherePlace(JobAndEventPlaces.JobAndEvent.JOB)
        val eventViews = jobAndEventViewsRepository.findFirstByWherePlace(JobAndEventPlaces.JobAndEvent.EVENT)

        return AdminJobsEventsController.AdminJobsEventsRanking(
                feed = findOneByJobAndEventPlace(JobAndEventPlaces.PlaceJobAndEvent.NEWS_FEED),
                publications = findOneByJobAndEventPlace(JobAndEventPlaces.PlaceJobAndEvent.MY_FEED),
                popular = findOneByJobAndEventPlace(JobAndEventPlaces.PlaceJobAndEvent.POPULAR),
                publicationsBottom = findOneByJobAndEventPlace(JobAndEventPlaces.PlaceJobAndEvent.PUBLICATION).jobs,
                firstView = AdminJobsEventsController.JobsEventsRankingInt(
                        jobs = jobViews?.viewsCount?.get(0) ?: 0,
                        events = eventViews?.viewsCount?.get(0) ?: 0
                ),
                secondView = AdminJobsEventsController.JobsEventsRankingInt(
                        jobs = jobViews?.viewsCount?.get(1) ?: 0,
                        events = eventViews?.viewsCount?.get(1) ?: 0
                ),
                thirdView = AdminJobsEventsController.JobsEventsRankingInt(
                        jobs = jobViews?.viewsCount?.get(2) ?: 0,
                        events = eventViews?.viewsCount?.get(2) ?: 0
                )
        )
    }


    @Transactional
    fun editJobsEventsRanking(rating: AdminJobsEventsController.AdminJobsEventsRanking) {
        if (rating.feed != null) upsertJobAndEvent(rating.feed, JobAndEventPlaces.PlaceJobAndEvent.NEWS_FEED)
        if (rating.publications != null) upsertJobAndEvent(rating.publications, JobAndEventPlaces.PlaceJobAndEvent.MY_FEED)
        if (rating.popular != null) upsertJobAndEvent(rating.popular, JobAndEventPlaces.PlaceJobAndEvent.POPULAR)
        if (rating.publicationsBottom != null) upsertJobAndEvent(
                AdminJobsEventsController.JobsEventsRankingBoolean(rating.publicationsBottom, false),
                JobAndEventPlaces.PlaceJobAndEvent.PUBLICATION
        )

        val jobViews = jobAndEventViewsRepository.findFirstByWherePlace(JobAndEventPlaces.JobAndEvent.JOB)
        val eventViews = jobAndEventViewsRepository.findFirstByWherePlace(JobAndEventPlaces.JobAndEvent.EVENT)

        jobAndEventViewsRepository.save(jobViews?.apply {
            viewsCount = countViews(rating, JobAndEventPlaces.JobAndEvent.JOB)
        }
                ?: JobAndEventViews(wherePlace = JobAndEventPlaces.JobAndEvent.JOB, viewsCount = countViews(rating, JobAndEventPlaces.JobAndEvent.JOB)))

        jobAndEventViewsRepository.save(eventViews?.apply {
            viewsCount = countViews(rating, JobAndEventPlaces.JobAndEvent.EVENT)
        }
                ?: JobAndEventViews(wherePlace = JobAndEventPlaces.JobAndEvent.EVENT, viewsCount = countViews(rating, JobAndEventPlaces.JobAndEvent.EVENT)))
    }

    private fun wherePlaces(place: AdminJobsEventsController.JobsEventsRankingBoolean): JobAndEventPlaces.JobAndEvent =
            when {
                place.jobs && place.events -> JobAndEventPlaces.JobAndEvent.BOTH
                place.jobs -> JobAndEventPlaces.JobAndEvent.JOB
                place.events -> JobAndEventPlaces.JobAndEvent.EVENT
                else -> JobAndEventPlaces.JobAndEvent.NONE
            }

    private fun findOneByJobAndEventPlace(placeJobAndEvent: JobAndEventPlaces.PlaceJobAndEvent): AdminJobsEventsController.JobsEventsRankingBoolean {
        val existsPlace = jobAndEventRepository.findFirstByPlace(placeJobAndEvent)
        if (existsPlace != null) {
            when (existsPlace.wherePlace) {
                JobAndEventPlaces.JobAndEvent.BOTH -> return AdminJobsEventsController.JobsEventsRankingBoolean(jobs = true, events = true)
                JobAndEventPlaces.JobAndEvent.JOB -> return AdminJobsEventsController.JobsEventsRankingBoolean(jobs = true, events = false)
                JobAndEventPlaces.JobAndEvent.EVENT -> return AdminJobsEventsController.JobsEventsRankingBoolean(jobs = false, events = true)
                else -> return AdminJobsEventsController.JobsEventsRankingBoolean(jobs = false, events = false)
            }
        }

        return AdminJobsEventsController.JobsEventsRankingBoolean(jobs = false, events = false)
    }

    private fun upsertJobAndEvent(place: AdminJobsEventsController.JobsEventsRankingBoolean, placeJobAndEvent: JobAndEventPlaces.PlaceJobAndEvent) {
        val wherePlace = wherePlaces(place)
        val existsPlace = jobAndEventRepository.findFirstByPlace(placeJobAndEvent)

        if (existsPlace != null) {
            jobAndEventRepository.save(existsPlace.apply {
                this.wherePlace = wherePlace
            })
        } else {
            jobAndEventRepository.save(JobAndEventPlaces().apply {
                this.wherePlace = wherePlace
                this.place = placeJobAndEvent
            })
        }
    }

    private fun countViews(rating: AdminJobsEventsController.AdminJobsEventsRanking, wherePlace: JobAndEventPlaces.JobAndEvent): List<Int> {
        val views: MutableList<Int> = mutableListOf()

        views.add(if (JobAndEventPlaces.JobAndEvent.JOB == wherePlace) rating.firstView.jobs else rating.firstView.events)
        views.add(if (JobAndEventPlaces.JobAndEvent.JOB == wherePlace) rating.secondView.jobs else rating.secondView.events)
        views.add(if (JobAndEventPlaces.JobAndEvent.JOB == wherePlace) rating.thirdView.jobs else rating.thirdView.events)

        return views
    }

    fun getDays(): Float? {
        val result = dsl.select().from(Tables.RANKING_CONFIG).where(Tables.RANKING_CONFIG.ID.eq("ranking.days"))
                .fetch().intoMap(Tables.RANKING_CONFIG.ID, Tables.RANKING_CONFIG.VALUE)
        return result["ranking.days"]
    }

}
