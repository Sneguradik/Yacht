package com.skolopendra.lib

import org.springframework.core.convert.converter.Converter

@Suppress("UNCHECKED_CAST")
class CustomEnumConverter<T : Enum<*>>(val clazz: Class<T>) : Converter<String, T> {
    companion object {
        private val RE_CAMELCASE = Regex("([A-Z][a-z]+)")
        private val RE_SEPARATORS = Regex("[-_]")

        private fun splitName(name: String): Collection<String> {
            if (name.contains(RE_SEPARATORS))
                return name.split(RE_SEPARATORS)
            return name.replace(RE_CAMELCASE, " $1 ").split(' ').filter { it.isNotEmpty() }
        }

        fun normalizeEnumName(name: String): String {
            return splitName(name).joinToString("-").lowercase()
        }
    }

    val values: Map<String, T>

    init {
        values = clazz.declaredFields.filter { it.isEnumConstant }.associate { normalizeEnumName(it.name) to it.get(null) as T }
    }

    override fun convert(source: String): T {
        return values.getOrElse(normalizeEnumName(source)) { throw IllegalArgumentException("\"$source\" is not a value of ${clazz.simpleName}") }
    }
}
