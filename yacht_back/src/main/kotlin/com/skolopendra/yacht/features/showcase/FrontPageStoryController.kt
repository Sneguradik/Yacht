package com.skolopendra.yacht.features.showcase

import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.service.FrontPageStoryService
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/stories")
class FrontPageStoryController(
        private val service: FrontPageStoryService
) {
    /**
     * Create a story
     * Stories are displayed in horizontal scroll area on front page
     */
    @Secured(Roles.CHIEF_EDITOR)
    @PostMapping("{articleId}")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@PathVariable articleId: Long) {
        service.create(articleId)
    }

    /**
     * Delete a story
     */
    @Secured(Roles.CHIEF_EDITOR)
    @DeleteMapping("{articleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable articleId: Long) {
        service.delete(articleId)
    }

    @GetMapping
    fun get(): List<GraphResult> = service.list(currentUserIdOrNull())
}
