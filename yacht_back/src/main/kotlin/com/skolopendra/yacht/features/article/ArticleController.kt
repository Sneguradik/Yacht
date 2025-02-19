package com.skolopendra.yacht.features.article

import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserOrNull
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemStatService
import com.skolopendra.yacht.features.showcase.ShowcaseStaticItemType
import com.skolopendra.yacht.features.user.UserController
import com.skolopendra.yacht.jooq.Tables
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/articles")
class ArticleController(
        private val articleService: ArticleService,
        // FIXME: Repository injection in controller
        private val articles: ArticleRepository,
        private val articleSchemaService: ArticleSchemaService,
        private val articleHideRepository: ArticleHideRepository,
        private val articleNonUniqueViewService: ArticleNonUniqueViewService,
        private val showcaseStaticItemStatService: ShowcaseStaticItemStatService,
        private val articleStatsRepository: ArticleStatsRepository
) {
    companion object {
        val META = selectTree { +"id"; +"createdAt"; +"updatedAt" }
        val SHORT = selectTree {
            "meta"(META)
            "status" {
                +"publicationStage"
                +"publishedAt"
            }
            "info" {
                +"title"
                +"summary"
                +"cover"
            }
            +"authorId"
        }
        val PREVIEW = SHORT with {
            "votes" { +"up"; +"down"; +"you" }
            "bookmarks" { +"count"; +"you" }
            "views" { +"count"; +"you" }
            "author"(UserController.SHORT)
            +"tags"
            +"topics"
            +"commentCount"
            +"hidden"
            +"pinned"
            +"isEdited"
            "promotions" { +"default"; +"lists" }
        }
        val FULL = PREVIEW with {
            +"html"
        }
        val SOURCE = PREVIEW with {
            +"source"
        }
    }

    data class CreateDraftResponse(
            val id: Long
    )

    /**
     * Create the article draft
     * Response: Article ID
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun post(): CreateDraftResponse {
        return CreateDraftResponse(
                id = articleService.createDraft(currentUser())
        )
    }

    /**
     * Get article rendered HTML and mark article as viewed by user
     */
    @GetMapping("{id}")
    fun get(@PathVariable id: Long, @RequestParam(required = false, name = "f") fingerprint: Optional<String>): GraphResult {
        val user = currentUserOrNull()
        if (user != null) articleService.markViewed(id, user, null)
        else {
//            require(fingerprint.isPresent)
//            articleService.markViewed(id, null, fingerprint.get())
        }

        articleNonUniqueViewService.markViewed(id)

        val viewsCountByArticle = articleNonUniqueViewService.countByArticle(id)
        showcaseStaticItemStatService.upsertStats(
                id,
                itemType = ShowcaseStaticItemType.ARTICLE,
                currentViewsCount = viewsCountByArticle
        )

        return articleSchemaService.graph(user?.id, null).apply { query.addConditions(Tables.ARTICLE.ID.eq(id)) }.fetchSingle(FULL)
    }

    @PostMapping("{id}/hide")
    fun articleHide(@PathVariable("id") article: Article) {
        articleHideRepository.save(ArticleHide(currentUser(), article))
    }

    @Transactional
    @DeleteMapping("{id}/hide")
    fun articleShow(@PathVariable("id") article: Article) {
        articleHideRepository.deleteByUserAndArticle(currentUser(), article)
    }

    /* TODO
    data class TextTagsRequest(
            val tags: List<String?>
    )

    @PreAuthorize("hasPermission(#id, 'Article', 'EDIT')")
    @PutMapping("{id}/tags", params = ["text"])
    fun updateTagsText(@PathVariable id: Long, @Valid @RequestBody request: TextTagsRequest): ArticleService.TagIdList {
        val normalizedTags = request.tags
                .filterNotNull()
                .map { it.replace(Regex("\\s+"), "").toLowerCase(Locale.ROOT) }
                .distinct()
        return articleService.updateTagsText(id, normalizedTags)
    }
    */
}
