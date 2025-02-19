package com.skolopendra.yacht.access.voters

import org.springframework.security.access.ConfigAttribute

open class CustomConfigAttribute : ConfigAttribute {
    override fun getAttribute(): String? = null
}