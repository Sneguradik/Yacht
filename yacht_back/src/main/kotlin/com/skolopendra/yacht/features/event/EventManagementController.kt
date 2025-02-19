package com.skolopendra.yacht.features.event

import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.yacht.access.annotations.Owner
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.Html
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.jooq.Tables
import org.hibernate.validator.constraints.Length
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@Secured(Roles.CHIEF_EDITOR)
@RestController
@RequestMapping("/events/{id}")
class EventManagementController(
        val service: EventService,
        val eventRepository: EventRepositoryCustom
) {
    /**
     * Edit an event
     */
    @Owner
    @PatchMapping
    fun patch(@PathVariable("id") event: Event, @RequestBody patch: Map<String, Any?>): GraphResult {
        service.patch(event, patch)
        return eventRepository.graph(currentUserIdOrNull()).apply { query.addConditions(Tables.EVENT.ID.eq(event.id)) }.fetchSingle(EventController.FULL)
    }

    data class Source(@get:Length(max = 25600) val source: String)

    /**
     * Update source
     */
    @Owner
    @PutMapping("source")
    fun updateSource(@PathVariable("id") event: Event, @Valid @RequestBody source: Source): Html {
        return Html(service.updateSource(event, source.source))
    }

    /**
     * Get source
     */
    @Owner
    @GetMapping("source")
    fun getSource(@PathVariable("id") event: Event): Source {
        return Source(event.body?.source
                ?: "")
    }

    /**
     * Deletes event
     */
    @Owner
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) {
        service.delete(id)
    }

    /**
     * Sends to pre-publication
     */
    /*@Owner
    @PostMapping("submit")
    fun submit(@PathVariable("id") event: Event) {
        service.submit(event)
    }*/

    /**
     * Approve publishing
     */
    @Owner
    @PostMapping("publish")
    fun publish(@PathVariable("id") event: Event) {
        service.publish(event)
    }

    /**
     * Withdraw from publication
     */
    @Owner
    @DeleteMapping("submit", "publish")
    fun withdraw(@PathVariable("id") event: Event) {
        service.toDraft(event)
    }
}
