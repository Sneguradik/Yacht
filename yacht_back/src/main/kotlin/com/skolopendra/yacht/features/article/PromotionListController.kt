package com.skolopendra.yacht.features.article

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.Count
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.annotation.Secured
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import javax.validation.Valid
import javax.validation.constraints.Pattern


@Validated
@RestController
@RequestMapping("/articles")
class PromotionListController(
        private val service: ArticlePromotionListService,
        private val listGraph: PromotionListRepositoryCustom
) {
    companion object {
        val FULL = selectTree {
            "meta" { +"id"; +"createdAt"; +"updatedAt" }
            +"postCount"
        }
    }

    /**
     * Get ArticlesList
     */
    @GetMapping("promotions")
    fun getPromotionLists(
            @RequestParam(name = "page", defaultValue = "0") page: Int
    ): PageResponse<GraphResult> {
        val pageable = PageRequest.of(page, 10)
        return listGraph.graph().fetchPage(FULL, pageable).response()
    }

    /**
     * Get Count of ArticleList
     */
    @GetMapping("promotions/count")
    fun getCount(
            @RequestParam(name = "id", defaultValue = "default") id: String
    ): Count {
        return Count(service.count(id))
    }

    /**
     * Add ArticleId to specific list
     */
    @Secured(Roles.CHIEF_EDITOR)
    @PostMapping("{id}/promote")
    fun postArticle(
            @PathVariable("id") article: Article,
            @Valid @RequestParam(defaultValue = "default") @Pattern(regexp = "^[a-z_0-9\\-]{1,32}$") list: String
    ) {
        service.add(article, list)
    }

    /**
     * Remove an Article
     */
    @Secured(Roles.CHIEF_EDITOR)
    @DeleteMapping("{id}/promote")
    fun deleteArticle(
            @PathVariable("id") article: Article,
            @RequestParam(defaultValue = "default") list: ArticlePromotionList
    ) {
        service.remove(article, list)
    }
}