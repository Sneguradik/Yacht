package com.skolopendra.lib.access

import org.springframework.security.access.ConfigAttribute
import org.springframework.security.access.method.AbstractMethodSecurityMetadataSource
import org.springframework.security.access.method.MethodSecurityMetadataSource
import java.lang.reflect.Method

class CompositeMethodSecurityMetadataSource(
        private val sources: List<MethodSecurityMetadataSource>
) : AbstractMethodSecurityMetadataSource() {
    override fun getAllConfigAttributes(): MutableCollection<ConfigAttribute> =
            sources.mapNotNull { it.allConfigAttributes }.flatten().toMutableList()

    override fun getAttributes(method: Method?, targetClass: Class<*>?): MutableCollection<ConfigAttribute> =
            sources.mapNotNull { it.getAttributes(method, targetClass) }.flatten().toMutableList()
}