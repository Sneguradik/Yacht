package com.skolopendra.yacht.features.article

import com.skolopendra.yacht.access.annotations.Owner
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.CreateResponse
import com.skolopendra.yacht.features.topic.TopicShowcaseService
import org.hibernate.validator.constraints.Length
import org.springframework.security.access.annotation.Secured
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import javax.validation.Valid
import javax.validation.constraints.NotNull

@Owner
@Secured(Roles.CHIEF_EDITOR)
@RestController
@RequestMapping("/articles/{id}")
class ArticleEditController(
    private val service: ArticleService
) {
    data class CoverUpdateResponse(
        val url: String
    )

    @PutMapping("cover")
    fun putCover(
        @PathVariable("id") article: Article,
        @RequestParam("file", required = false) file: MultipartFile?
    ): CoverUpdateResponse {
        return CoverUpdateResponse(url = service.updateCover(article, file))
    }

    data class SummaryUpdateRequest(
        @get:Length(max = 400)
        val summary: String
    )

    /**
     * Update article summary
     */
    @PutMapping("summary")
    fun putSummary(@PathVariable("id") article: Article, @Valid @RequestBody request: SummaryUpdateRequest) {
        service.updateSummary(article, request.summary)
    }

    data class Source(
        val data: String
    )

    /**
     * Edit article, re-render HTML
     */
    @PutMapping("source")
    fun put(@PathVariable("id") article: Article, @RequestBody content: Source) {
        service.updateArticle(article, content.data)
    }

    /**
     * Get editable data
     */
    @GetMapping("source")
    fun getRawData(@PathVariable("id") article: Article): Source {
        return Source(article.editableData)
    }

    data class TitleRequest(
        @get:Length(max = 120)
        val title: String
    )

    /**
     * Update article title
     */
    @PutMapping("title")
    fun updateTitle(@PathVariable("id") article: Article, @Valid @RequestBody request: TitleRequest) {
        service.updateTitle(article, request.title)
    }


    data class TopicsRequest(
        @get:Valid
        val topics: List<@NotNull Long?>
    )

    /**
     * Modify article topics
     */
    @PutMapping("topics")
    fun updateTopics(@PathVariable("id") article: Article, @Valid @RequestBody request: TopicsRequest) {
        // SEE https://youtrack.jetbrains.com/issue/KT-13228
        service.updateTopics(article, request.topics.filterNotNull())
    }

    /**
     * Modify article tags
     */
    @PutMapping("tags")
    fun updateTags(@PathVariable("id") article: Article, @Valid @RequestBody request: ArticleService.TagIdList) {
        // SEE https://youtrack.jetbrains.com/issue/KT-13228
        service.updateTags(article, request.tags.filterNotNull())
    }

    @PostMapping("clone")
    fun clone(@PathVariable("id") article: Article): CreateResponse {
        return CreateResponse(id = service.clone(article).id)
    }

    @Transactional
    @PostMapping("pin")
    fun articlePin(@PathVariable("id") article: Article) {
        service.pinArticle(article)
    }

    @Transactional
    @DeleteMapping("pin")
    fun articleUnpin(@PathVariable("id") article: Article) {
        service.unpinArticle(article)
    }
}
