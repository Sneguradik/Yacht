package com.skolopendra.yacht.features.topic

import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.UrlResponse
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemType
import com.skolopendra.yacht.features.showcase.StaticShowcaseService
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import javax.imageio.ImageIO
import javax.validation.Valid
import javax.validation.constraints.Pattern

@RestController
@Secured(Roles.CHIEF_EDITOR)
@RequestMapping("/topics")
class TopicController(
        private val service: TopicService,
        private val showcaseService: StaticShowcaseService
) {
    data class CreateTopicRequest(
            val name: String,

            @get:Pattern(regexp = "^(?=.*[a-zA-Z])([a-zA-Z0-9_-]+)\$")
            val url: String?
    )

    data class TopicResponse(
            val id: Long
    )

    /**
     * Creates a new topic
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreateTopicRequest): TopicResponse {
        return TopicResponse(id = service.create(request.name, request.url).id)
    }

    /**
     * Changes topic icon
     */
    @PutMapping("{id}/image")
    fun changeImage(@PathVariable id: Long, @RequestParam(required = false) file: MultipartFile?): UrlResponse {
        val user = currentUser()
        val changedImageTopic = if (file != null) {
            service.changeImage(id, ImageIO.read(file.inputStream), user)
        } else {
            service.deleteImage(id, user)
        }
        return UrlResponse(url = changedImageTopic.image!!)
    }

    /**
     * Changes topic cover
     */
    @PutMapping("{id}/cover")
    fun changeCover(@PathVariable id: Long, @RequestParam(required = false) file: MultipartFile?): UrlResponse {
        val user = currentUser()
        val changedImageTopic = if (file != null) {
            service.changeTopicImage(id, ImageIO.read(file.inputStream), user)
        } else {
            service.deleteTopicImage(id, user)
        }
        return UrlResponse(url = changedImageTopic.profileCoverUrl!!)
    }

    /**
     * Deletes a topic
     */
    @Secured(Roles.CHIEF_EDITOR)
    @DeleteMapping("{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) {
        val showcaseItem = showcaseService.getItemByItemIdAndType(id, ShowcaseStaticItemType.TOPIC)
        if (showcaseItem != null) {
            showcaseService.withdraw(showcaseItem)
        }
        service.delete(id)
    }

    @Secured(Roles.SUPERUSER)
    @DeleteMapping("{id}/advanced")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun advancedDelete(@PathVariable id: Long,
                       @RequestParam(required = false, name = "tags") tags: List<String>?,
                       @RequestParam(required = false, name = "topic") topic: Topic?) {
        val showcaseItem = showcaseService.getItemByItemIdAndType(id, ShowcaseStaticItemType.TOPIC)
        if (showcaseItem != null) {
            showcaseService.withdraw(showcaseItem)
        }
        service.advancedDelete(id, tags, topic)
    }
}
