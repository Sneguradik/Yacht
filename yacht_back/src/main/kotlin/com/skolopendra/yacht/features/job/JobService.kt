package com.skolopendra.yacht.features.job

import com.skolopendra.lib.ImageUploadService
import com.skolopendra.lib.ObjectPatcher
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.jooq.Tables
import org.jooq.Record1
import org.jooq.SelectQuery
import org.jooq.SortOrder
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.awt.image.BufferedImage
import java.sql.Timestamp
import java.time.Instant
import javax.validation.Validator

@Service
class JobService(
        private val jobs: JobRepository,
        private val bookmarks: JobBookmarkRepository,
        private val views: JobViewRepository,
        private val imageUploadService: ImageUploadService,
        private val validator: Validator,
        private val jobsGraph: JobRepositoryCustom
) {
    fun list(
            forUser: Long?,
            company: Long?,
            stages: Set<Publication.Stage>,
            seen: Boolean?,
            bookmark: Boolean?,
            hidden: TriStateFilter,
            order: JobOrder,
            direction: SortOrder
    ): GraphQuery {
        val canReview = SecurityContextHolder.getContext().authentication.authorities.any { listOf(Roles.SUPERUSER, Roles.CHIEF_EDITOR).contains(it.authority) }
        return jobsGraph.graph(forUser, hidden.value).apply {
            jobsGraph.applyQuery(query, canReview, forUser, company, stages, seen, bookmark, hidden, order, direction)
            query.addOrderBy(Tables.JOB.PUBLISHED_AT.desc())
        }
    }

    fun count(
            forUser: Long?,
            company: Long?,
            stages: Set<Publication.Stage>,
            seen: Boolean?,
            bookmark: Boolean?,
            hidden: TriStateFilter,
            order: JobOrder,
            direction: SortOrder
    ): SelectQuery<Record1<Int>> {
        val canReview = SecurityContextHolder.getContext().authentication.authorities.any { listOf(Roles.SUPERUSER, Roles.CHIEF_EDITOR).contains(it.authority) }
        return jobsGraph.count().apply {
            jobsGraph.applyQuery(this, canReview, forUser, company, stages, seen, bookmark, hidden, order, direction)
        }
    }

    fun create(company: User): Job {
        return jobs.save(Job(company = company))
    }

    fun changeImage(job: Job, image: BufferedImage): Job {
        if (job.body == null)
            job.body = JobBody()
        job.body!!.image = imageUploadService.cropToCenterSquareAndUpload(200, image)
        return jobs.save(job)
    }

    fun delete(id: Long) {
        jobs.deleteById(id)
    }

    fun patch(job: Job, patch: Map<String, Any?>): Job {
        return jobs.save(ObjectPatcher(job, validator).apply(patch))
    }

    fun bookmarkAdd(user: User, job: Job) {
        bookmarks.save(JobBookmark(user = user, job = job))
    }

    @Transactional
    fun bookmarkRemove(user: User, job: Job) {
        bookmarks.deleteByUserAndJob(user, job)
    }

    fun storeView(job: Job, user: User?, fingerprint: String?) {
        views.save(JobView(fingerprint = fingerprint, user = user, job = job))
    }

    fun submit(job: Job) {
        job.publicationStage = Publication.Stage.REVIEWING
        jobs.save(job)
    }

    fun publish(job: Job) {
        job.publicationStage = Publication.Stage.PUBLISHED
        job.publishedAt = Timestamp.from(Instant.now())
        jobs.save(job)
    }

    fun toDraft(job: Job) {
        job.publicationStage = Publication.Stage.DRAFT
        jobs.save(job)
    }
}
