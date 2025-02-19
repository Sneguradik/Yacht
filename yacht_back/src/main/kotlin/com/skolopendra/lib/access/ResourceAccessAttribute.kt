package com.skolopendra.lib.access

import com.skolopendra.yacht.access.voters.CustomConfigAttribute
import kotlin.reflect.KClass

class ResourceAccessAttribute(
        val type: KClass<*>,
        val permission: String
) : CustomConfigAttribute()