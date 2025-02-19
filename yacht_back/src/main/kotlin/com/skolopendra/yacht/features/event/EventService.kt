package com.skolopendra.yacht.features.event

import com.skolopendra.lib.ObjectPatcher
import com.skolopendra.lib.TriStateFilter
import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.PostRenderService
import org.jooq.Record1
import org.jooq.SelectQuery
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Timestamp
import java.time.Instant
import javax.validation.Validator

@Service
class EventService(
        val events: EventRepository,
        val bookmarks: EventBookmarkRepository,
        val views: EventViewRepository,
        val validator: Validator,
        val eventsGraph: EventRepositoryCustom,
        val postRenderService: PostRenderService
) {
    fun list(
            forUser: Long?,
            company: Long?,
            stages: Set<Publication.Stage>,
            types: Set<Event.Type>?,
            seen: Boolean?,
            bookmark: Boolean?,
            hidden: TriStateFilter,
            before: Long?,
            after: Long?
    ): GraphQuery {
        val canReview = SecurityContextHolder.getContext().authentication.authorities.any { listOf(Roles.SUPERUSER, Roles.CHIEF_EDITOR).contains(it.authority) }
        return eventsGraph.graph(forUser, hidden.value).apply {
            eventsGraph.applyQuery(query, canReview, forUser, company, stages, types, seen, bookmark, hidden, before, after)
            query.addOrderBy(Tables.EVENT.DATE.asc().nullsLast())
        }
    }

    fun count(
            forUser: Long?,
            company: Long?,
            stages: Set<Publication.Stage>,
            types: Set<Event.Type>?,
            seen: Boolean?,
            bookmark: Boolean?,
            hidden: TriStateFilter,
            before: Long?,
            after: Long?
    ): SelectQuery<Record1<Int>> {
        val canReview = SecurityContextHolder.getContext().authentication.authorities.any { listOf(Roles.SUPERUSER, Roles.CHIEF_EDITOR).contains(it.authority) }
        return eventsGraph.count().apply {
            eventsGraph.applyQuery(this, canReview, forUser, company, stages, types, seen, bookmark, hidden, before, after)
        }
    }

    fun updateSource(event: Event, source: String): String {
        if (event.body == null)
            event.body = EventBody()
        event.body!!.source = source
        event.body!!.html = postRenderService.render(source)
        events.save(event)
        return event.body!!.html!!
    }

    fun create(company: User): Event {
        return events.save(Event(company = company))
    }

    fun delete(id: Long) {
        events.deleteById(id)
    }

    fun patch(event: Event, patch: Map<String, Any?>): Event {
        return events.save(ObjectPatcher(event, validator).apply(patch))
    }

    fun bookmarkAdd(user: User, event: Event) {
        bookmarks.save(EventBookmark(user = user, event = event))
    }

    @Transactional
    fun bookmarkRemove(user: User, event: Event) {
        bookmarks.deleteByUserAndEvent(user, event)
    }

    fun storeView(event: Event, user: User?, fingerprint: String?) {
        views.save(EventView(fingerprint = fingerprint, user = user, event = event))
    }

    fun submit(event: Event) {
        event.publicationStage = Publication.Stage.REVIEWING
        events.save(event)
    }

    fun publish(event: Event) {
        event.publicationStage = Publication.Stage.PUBLISHED
        event.publishedAt = Timestamp.from(Instant.now())
        events.save(event)
    }

    fun toDraft(event: Event) {
        event.publicationStage = Publication.Stage.DRAFT
        events.save(event)
    }
}