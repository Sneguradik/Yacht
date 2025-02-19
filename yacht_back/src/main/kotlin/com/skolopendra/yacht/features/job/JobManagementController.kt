package com.skolopendra.yacht.features.job

import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.yacht.access.annotations.Owner
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.UrlResponse
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.jooq.Tables
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import javax.imageio.ImageIO

@Secured(Roles.CHIEF_EDITOR)
@RestController
@RequestMapping("/jobs/{id}")
class JobManagementController(
        private val service: JobService,
        private val jobRepositoryCustom: JobRepositoryCustom
) {
    /**
     * Changes image
     */
    @Owner
    @PutMapping("image")
    fun changeImage(@PathVariable("id") job: Job, @RequestParam file: MultipartFile): UrlResponse {
        val changedImageJob = service.changeImage(job, ImageIO.read(file.inputStream))
        return UrlResponse(url = changedImageJob.body!!.image!!)
    }

    /**
     * Deletes a job
     */
    @Owner
    @Secured(Roles.CHIEF_EDITOR)
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) {
        service.delete(id)
    }

    /**
     * Edit a job
     */
    @Owner
    @PatchMapping
    fun patch(@PathVariable("id") job: Job, @RequestBody patch: Map<String, Any?>): GraphResult {
        service.patch(job, patch)
        return jobRepositoryCustom.graph(currentUserIdOrNull()).apply { query.addConditions(Tables.JOB.ID.eq(job.id)) }.fetchSingle(JobController.FULL)
    }

    /**
     * Sends to pre-publication
     */
    /*@Owner
    @PostMapping("submit")
    fun submit(@PathVariable("id") job: Job) {
        service.submit(job)
    }*/

    /**
     * Approve publishing
     */
    @Owner
    @PostMapping("publish")
    fun publish(@PathVariable("id") job: Job) {
        service.publish(job)
    }

    /**
     * Withdraw from publication
     */
    @Owner
    @DeleteMapping("submit", "publish")
    fun withdraw(@PathVariable("id") job: Job) {
        service.toDraft(job)
    }
}