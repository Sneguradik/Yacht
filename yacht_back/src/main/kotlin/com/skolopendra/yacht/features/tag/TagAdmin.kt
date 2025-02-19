package com.skolopendra.yacht.features.tag

data class TagAdmin(
        val count: Tags
)

data class Tags(
        val all: Int? = null,
        val new: Int? = null
)