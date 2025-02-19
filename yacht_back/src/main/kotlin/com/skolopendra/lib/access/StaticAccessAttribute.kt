package com.skolopendra.lib.access

import com.skolopendra.yacht.access.voters.CustomConfigAttribute
import kotlin.reflect.KClass

class StaticAccessAttribute(
        val type: KClass<*>,
        val permission: String
) : CustomConfigAttribute()