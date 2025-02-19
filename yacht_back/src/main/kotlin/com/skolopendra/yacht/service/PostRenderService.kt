package com.skolopendra.yacht.service

import org.owasp.html.PolicyFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service

@Service
class PostRenderService(
        @Qualifier("ckEditorHtmlPolicy")
        val policy: PolicyFactory,
        @Qualifier("stripAllPolicy")
        val stripAll: PolicyFactory
) {
    fun render(source: String): String {
        // TODO: Images
        return policy.sanitize(source)
    }

    fun renderText(source: String): String {
        return stripAll.sanitize(source)
    }
}
