package com.skolopendra.yacht.features.showcase

import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.CreateResponse
import com.skolopendra.yacht.features.article.Article
import com.skolopendra.yacht.features.event.Event
import com.skolopendra.yacht.features.job.Job
import com.skolopendra.yacht.features.tag.Tag
import com.skolopendra.yacht.features.topic.Topic
import com.skolopendra.yacht.features.user.User
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController

@Secured(Roles.CHIEF_EDITOR, Roles.SALES)
@RestController
class ShowcaseCreationController(
        private val service: StaticShowcaseCreationService
) {
    @PostMapping("/articles/{id}/showcase")
    fun fromArticle(@PathVariable("id") article: Article): CreateResponse {
        return CreateResponse(service.fromArticle(article).id)
    }

    @PostMapping("/users/{id}/showcase", "/companies/{id}/showcase")
    fun fromAuthor(@PathVariable("id") author: User): CreateResponse {
        return CreateResponse(service.fromAuthor(author).id)
    }

    @PostMapping("/tags/{id}/showcase")
    fun fromTag(@PathVariable("id") tag: Tag): CreateResponse {
        return CreateResponse(service.fromTag(tag).id)
    }

    @PostMapping("/topics/{id}/showcase")
    fun fromTopic(@PathVariable("id") topic: Topic): CreateResponse {
        return CreateResponse(service.fromTopic(topic).id)
    }

    @PostMapping("/jobs/{id}/showcase")
    fun fromJob(@PathVariable("id") job: Job): CreateResponse {
        return CreateResponse(service.fromJob(job).id)
    }

    @PostMapping("/events/{id}/showcase")
    fun fromEvent(@PathVariable("id") event: Event): CreateResponse {
        return CreateResponse(service.fromEvent(event).id)
    }

    @PostMapping("/showcases")
    fun custom(): CreateResponse {
        return CreateResponse(service.create().id)
    }
}