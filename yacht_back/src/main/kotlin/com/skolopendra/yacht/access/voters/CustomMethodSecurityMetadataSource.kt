package com.skolopendra.yacht.access.voters

import com.skolopendra.lib.access.ResourceAccessAttribute
import com.skolopendra.lib.access.StaticAccessAttribute
import com.skolopendra.lib.access.annotations.ResourceAccess
import com.skolopendra.lib.access.annotations.StaticAccess
import com.skolopendra.yacht.access.annotations.CompanyAccount
import com.skolopendra.yacht.access.annotations.Owner
import org.springframework.core.annotation.AnnotationUtils
import org.springframework.security.access.ConfigAttribute
import org.springframework.security.access.SecurityConfig
import org.springframework.security.access.method.AbstractMethodSecurityMetadataSource
import org.springframework.util.ClassUtils
import java.lang.reflect.Method

class CustomMethodSecurityMetadataSource : AbstractMethodSecurityMetadataSource() {
    override fun getAllConfigAttributes(): MutableCollection<ConfigAttribute>? = null

    override fun getAttributes(method: Method, targetClass: Class<*>): MutableCollection<ConfigAttribute> {
        if (method.declaringClass == java.lang.Object::javaClass)
            return mutableListOf()

        val result = mutableListOf<ConfigAttribute>()

        val access = findAnnotation(method, targetClass, StaticAccess::class.java)
        if (access != null)
            result.add(StaticAccessAttribute(access.resourceClass, access.permission))

        val resourceAccess = findAnnotation(method, targetClass, ResourceAccess::class.java)
        if (resourceAccess != null)
            result.add(ResourceAccessAttribute(resourceAccess.resourceType, resourceAccess.permission))

        val isCompanyOwner = findAnnotation(method, targetClass, Owner::class.java)
        if (isCompanyOwner != null)
            result.add(SecurityConfig(OwnerVoter::class.java.name))

        val isCompanyAccount = findAnnotation(method, targetClass, CompanyAccount::class.java)
        if (isCompanyAccount != null)
            result.add(SecurityConfig(CompanyAccountVoter::class.java.name))

        return result
    }

    /**
     * See [org.springframework.security.access.prepost.PrePostAnnotationSecurityMetadataSource.findAnnotation]
     */
    private fun <A : Annotation> findAnnotation(method: Method, targetClass: Class<*>,
                                                annotationClass: Class<A>): A? {
        // The method may be on an interface, but we need attributes from the target
        // class.
        // If the target class is null, the method will be unchanged.
        val specificMethod = ClassUtils.getMostSpecificMethod(method, targetClass)
        var annotation = AnnotationUtils.findAnnotation(specificMethod, annotationClass)
        if (annotation != null) {
            logger.debug("$annotation found on specific method: $specificMethod")
            return annotation
        }
        // Check the original (e.g. interface) method
        if (specificMethod !== method) {
            annotation = AnnotationUtils.findAnnotation(method, annotationClass)
            if (annotation != null) {
                logger.debug("$annotation found on: $method")
                return annotation
            }
        }
        // Check the class-level (note declaringClass, not targetClass, which may not
        // actually implement the method)
        annotation = AnnotationUtils.findAnnotation(specificMethod.declaringClass,
                annotationClass)
        if (annotation != null) {
            logger.debug(annotation.toString() + " found on: "
                    + specificMethod.declaringClass.name)
            return annotation
        }
        return null
    }
}