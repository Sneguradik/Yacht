package com.skolopendra.yacht.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.skolopendra.lib.ImageUploadService
import org.owasp.html.HtmlPolicyBuilder
import org.owasp.html.PolicyFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Bean
import org.springframework.stereotype.Service
import kotlin.math.min

@Service
class EditorJSRenderService {
    data class Block(
        val type: String,
        val data: Map<String, Any>
    )

    @Bean("defaultPolicy")
    fun policyFactory(): PolicyFactory {
        return HtmlPolicyBuilder()
            .allowElements("b", "i", "code", "u")
            .allowAttributes("class")
            .matching(false, "inline-code")
            .onElements("code")
            .toFactory()
    }

    @Autowired
    lateinit var mapper: ObjectMapper

    @Qualifier("stripAllPolicy")
    @Autowired
    lateinit var stripAllPolicy: PolicyFactory

    @Autowired
    lateinit var imageUploadService: ImageUploadService

    data class FileData(
        val url: String
    )

    data class ImageData(
        val caption: String,
        val file: FileData,
        val stretched: Boolean,
        val withBackground: Boolean,
        val withBorder: Boolean
    )

    data class ListData(
        val style: String,
        val items: List<String>
    )

    private fun renderTextBlock(block: Block): String? {
        when (block.type) {
            "header", "paragraph" -> {
                return stripAllPolicy.sanitize(block.data["text"] as String)
            }

            "image" -> {
                return stripAllPolicy.sanitize(block.data["caption"] as String)
            }

            "list" -> {
                val data = mapper.convertValue(block.data, ListData::class.java)
                return data.items.joinToString(separator = "\n")
            }
        }
        return null
    }

}
