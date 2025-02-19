package com.skolopendra.lib.i18n

import org.jooq.Collation
import org.jooq.impl.DSL

enum class Locale(
        collationName: String,
        val collation: Collation = DSL.collation(collationName)
) {
    RUSSIAN("ru-x-icu"),
    ENGLISH("en-x-icu"),
    ALL("en-x-icu")
}