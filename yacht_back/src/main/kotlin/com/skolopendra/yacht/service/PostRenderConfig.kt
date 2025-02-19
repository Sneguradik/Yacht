package com.skolopendra.yacht.service

import org.owasp.html.CssSchema
import org.owasp.html.HtmlPolicyBuilder
import org.owasp.html.PolicyFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class PostRenderConfig {
    @Bean("ckEditorHtmlPolicy")
    fun ckEditorHtmlPolicy(): PolicyFactory {
        return HtmlPolicyBuilder()
            .allowElements(
                "figcaption",
                "a",
                "oembed",
                "p",
                "span",
                "strong",
                "i",
                "u",
                "ol",
                "ul",
                "li",
                "blockquote",
                "table",
                "thead",
                "tbody",
                "tr",
                "td",
                "figure",
                "img",
                "br"
            )
            .allowAttributes("href")
            .onElements("a")
            .allowAttributes("url")
            .onElements("oembed")
            .allowAttributes("src", "alt")
            .onElements("img")
            .allowAttributes("class")
            .matching(false, "media", "table", "image", "image image-style-align-right", "image image-style-align-left")
            .onElements("figure")
            .allowAttributes("class")
            .matching(false, "text-tiny", "text-small", "text-big", "text-huge")
            .onElements(
                "a",
                "p",
                "span",
                "strong",
                "i",
                "u",
                "ol",
                "ul",
                "li",
                "blockquote",
                "table",
                "tbody",
                "tr",
                "td"
            )
            .allowAttributes("rowspan", "colspan").onElements("td")
            .allowElements("h2", "h3")
            .allowStyling(CssSchema.withProperties(mutableListOf("text-align")))
            .allowStandardUrlProtocols()
            .requireRelNofollowOnLinks()
            .toFactory()
    }

    @Bean("stripAllPolicy")
    fun stripAllPolicy(): PolicyFactory {
        return HtmlPolicyBuilder().allowElements("h2", "h3").toFactory()
    }
}
