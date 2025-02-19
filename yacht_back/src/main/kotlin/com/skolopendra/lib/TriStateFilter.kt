package com.skolopendra.lib

enum class TriStateFilter(val value: Boolean?) {
    INCLUDE(null),
    EXCLUDE(false),
    ONLY(true);
}
