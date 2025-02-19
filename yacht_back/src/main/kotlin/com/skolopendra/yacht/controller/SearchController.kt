package com.skolopendra.yacht.controller

import com.skolopendra.yacht.service.SearchService
import org.springframework.security.authentication.AuthenticationTrustResolver
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/search")
class SearchController(
        private val searchService: SearchService,
        private val authenticationTrustResolver: AuthenticationTrustResolver
) {
//    @GetMapping("article/{page}")
//    fun article(@RequestParam query: String, @PathVariable page: Int): PageResponse<ArticleSummaryDto> {
//        val authentication = SecurityContextHolder.getContext().authentication
//        val user = if (authenticationTrustResolver.isAnonymous(authentication)) {
//            null
//        } else {
//            authentication.getUser()
//        }
//        return searchService.findArticles(query, page, user)
//    }
}