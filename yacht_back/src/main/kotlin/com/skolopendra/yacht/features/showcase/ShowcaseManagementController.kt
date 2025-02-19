package com.skolopendra.yacht.features.showcase

import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.UrlResponse
import com.skolopendra.yacht.features.auth.currentUserIdOrNull
import com.skolopendra.yacht.jooq.Tables
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@Secured(Roles.SALES, Roles.CHIEF_EDITOR)
@RestController
@RequestMapping("/showcases/{id}")
class ShowcaseManagementController(
        private val graph: ShowcaseRepositoryCustom,
        private val service: StaticShowcaseService
) {
    @PutMapping("cover")
    fun updateCover(@PathVariable("id") item: ShowcaseStaticItem, @RequestParam("file", required = false) file: MultipartFile?): UrlResponse {
        return UrlResponse(service.updateCover(item, file))
    }

    @PatchMapping
    fun update(@PathVariable("id") item: ShowcaseStaticItem, @RequestBody patch: Map<String, Any?>): GraphResult {
        service.patch(item, patch)
        return graph.all(currentUserIdOrNull()).apply { query.addConditions(Tables.SHOWCASE_STATIC_ITEM.ID.eq(item.id)) }.fetchSingle(ShowcaseController.FULL)
    }

    @Secured(Roles.CHIEF_EDITOR)
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable("id") item: ShowcaseStaticItem) {
        service.delete(item)
    }

    @PostMapping("publish")
    fun publish(@PathVariable("id") item: ShowcaseStaticItem) {
        service.publish(item)
    }

    @DeleteMapping("publish")
    fun withdraw(@PathVariable("id") item: ShowcaseStaticItem) {
        service.withdraw(item)
    }
}
