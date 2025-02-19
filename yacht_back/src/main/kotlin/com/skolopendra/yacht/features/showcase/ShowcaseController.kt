package com.skolopendra.yacht.features.showcase

import com.skolopendra.lib.PageResponse
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.lib.graph.selectTree
import com.skolopendra.lib.response
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.jooq.Tables
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/showcases")
class ShowcaseController(
        private val service: StaticShowcaseService,
        private val graph: ShowcaseRepositoryCustom
) {
    companion object {
        val FULL = selectTree {
            "meta" { +"id"; +"createdAt"; +"updatedAt" }
            "status" { +"publicationStage"; +"publishedAt" }
            "info" {
                +"duration"
                +"cover"
                +"title"
                +"subtitle"
                +"url"
                "options" { +"postCount"; +"subCount"; +"viewCount" }
            }
            "views" { +"you"; +"count" }
        }
    }

    @GetMapping
    fun get(
            @RequestParam(defaultValue = "0") page: Int
    ): PageResponse<GraphResult> {
        return graph.public(currentUserIdOrNull()).fetchPage(FULL, PageRequest.of(page, 10)).response()
    }

    @Secured(Roles.SALES, Roles.CHIEF_EDITOR)
    @GetMapping("{id}")
    fun getOne(@PathVariable id: Long): GraphResult {
        return graph.all(currentUserIdOrNull()).apply { query.addConditions(Tables.SHOWCASE_STATIC_ITEM.ID.eq(id)) }.fetchSingle(FULL)
    }

    @Secured(Roles.SALES, Roles.CHIEF_EDITOR)
    @GetMapping(params = ["all"])
    fun getAll(
            @RequestParam(defaultValue = "0") page: Int
    ): PageResponse<GraphResult> {
        return graph.all(currentUserIdOrNull()).fetchPage(FULL, PageRequest.of(page, 10)).response()
    }

    @PostMapping("{id}/view")
    fun storeView(@PathVariable("id") item: ShowcaseStaticItem) {
        service.storeView(currentUser(), item)
    }
}