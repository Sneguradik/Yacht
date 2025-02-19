package com.skolopendra.lib

import org.springframework.data.domain.Page

class PageResponse<T>(
        val page: Int,
        val total: Long,
        val totalPages: Int,
        val content: List<T>
) {
    companion object {
        operator fun <T, X> invoke(page: Page<T>, transform: (item: T) -> X): PageResponse<X> {
            return PageResponse(page.number, page.totalElements, page.totalPages, page.content.map(transform))
        }

        operator fun <T> invoke(page: Page<T>): PageResponse<T> {
            return PageResponse(page.number, page.totalElements, page.totalPages, page.content)
        }
    }
}

fun <T> Page<T>.toResponse(): PageResponse<T> = PageResponse(this)

fun <T, X> Page<T>.toResponse(transform: (item: T) -> X): PageResponse<X> = PageResponse(this, transform)