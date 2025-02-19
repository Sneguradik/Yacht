package com.skolopendra.yacht.access.voters

import com.skolopendra.lib.access.*
import com.skolopendra.lib.access.annotations.PermissionCheck
import com.skolopendra.lib.access.annotations.ResourceId
import org.aopalliance.intercept.MethodInvocation
import org.springframework.security.access.AccessDecisionVoter
import org.springframework.security.access.ConfigAttribute
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.lang.reflect.Method
import java.lang.reflect.ParameterizedType
import java.lang.reflect.Type

@Component
class CustomAccessDecisionVoter(
        val checks: List<IPermissionChecks<*>>
) : AccessDecisionVoter<MethodInvocation> {
    override fun vote(authentication: Authentication, target: MethodInvocation, attributes: MutableCollection<ConfigAttribute>): Int {
        val staticAccessAttribute = attributes.find { it is StaticAccessAttribute } as StaticAccessAttribute?
        if (staticAccessAttribute != null) {
            val resolver = findResourceResolver(staticAccessAttribute.type.javaObjectType)

            val explicitCheck = findPermissionCheck(resolver.javaClass, staticAccessAttribute.permission)
            if (explicitCheck != null) {
                require(explicitCheck.parameterCount == 1)
                require(explicitCheck.parameterTypes[0].isAssignableFrom(Authentication::class.java))
                return decide(explicitCheck.invoke(resolver, authentication) as Boolean)
            }

            if (resolver is ITargetAccessChecker<*>) {
                val hasPermission = resolver.javaClass.declaredMethods.find { it.name == "hasPermission" && signatureMatches(target.method, Boolean::class.java, Authentication::class.java, String::class.java) }
                if (hasPermission != null) {
                    val result = hasPermission.invoke(resolver, authentication, staticAccessAttribute.permission) as Boolean
                    return decide(result)
                }
            }
        }

        val resourceAccessAttribute = attributes.find { it is ResourceAccessAttribute } as ResourceAccessAttribute?
        if (resourceAccessAttribute != null) {
            val resolver = findResourceResolver(resourceAccessAttribute.type.java)
            val targetResource = getResource(target, resourceAccessAttribute.type.java)
                    ?: throw NoSuchElementException("resource is null")

            val explicitCheck = findPermissionCheck(resolver.javaClass, resourceAccessAttribute.permission)
            if (explicitCheck != null) {
                require(explicitCheck.parameterCount == 2)
                require(explicitCheck.parameterTypes.zip(arrayOf(Authentication::class.java, resourceAccessAttribute.type.java)).all { it.first.isAssignableFrom(it.second) })
                return decide(explicitCheck.invoke(resolver, authentication, targetResource) as Boolean)
            }

            if (resolver is IStaticAccessChecker<*>) {
                val hasPermission = resolver.javaClass.declaredMethods.find { it.name == "hasPermission" && signatureMatches(target.method, Boolean::class.java, Authentication::class.java, resourceAccessAttribute.type.java, String::class.java) }
                if (hasPermission != null) {
                    val result = hasPermission.invoke(resolver, authentication, targetResource, resourceAccessAttribute.permission) as Boolean
                    return decide(result)
                }
            }
        }

        return AccessDecisionVoter.ACCESS_ABSTAIN
    }

    fun signatureMatches(method: Method, returnType: Type, vararg parameters: Type): Boolean {
        if (method.returnType != returnType)
            return false
        if (method.parameterCount != parameters.size)
            return false
        return method.parameterTypes.zip(parameters).all {
            it.first == it.second ||
                    it.second is Class<*> && it.first.isAssignableFrom(it.second as Class<*>)
        }
    }

    fun getResource(target: MethodInvocation, type: Class<*>): Any? {
        val method = target.method
        if (method.typeParameters.singleOrNull()?.javaClass == type)
            return target.arguments[0]

        val resourceParameter = method.parameterAnnotations.indexOfFirst { it.any { annotation -> annotation.javaClass == ResourceId::class.java } }
        if (resourceParameter >= 0)
            return target.arguments[resourceParameter]

        val typeMatchingParameter = method.parameterTypes.indexOfFirst { it.isAssignableFrom(type) }
        if (typeMatchingParameter >= 0)
            return target.arguments[typeMatchingParameter]

        throw IllegalStateException("Cannot find resource argument for method ${method.name}")
    }

    fun decide(result: Boolean): Int =
            if (result) AccessDecisionVoter.ACCESS_GRANTED else AccessDecisionVoter.ACCESS_DENIED

    override fun supports(attribute: ConfigAttribute?): Boolean = attribute is CustomConfigAttribute

    override fun supports(clazz: Class<*>): Boolean = MethodInvocation::class.java.isAssignableFrom(clazz)

    fun findResourceResolver(type: Class<*>): IPermissionChecks<*> {
        return checks.find { impl -> impl.javaClass.genericInterfaces.any { it is ParameterizedType && it.rawType == IPermissionChecks::class.java && it.actualTypeArguments[0] == type } }
                ?: throw IllegalStateException("No resolver set for type ${type.name}")
    }

    fun findPermissionCheck(type: Class<*>, permission: String): Method? =
            type.declaredMethods.find {
                val check = it.getAnnotation(PermissionCheck::class.java)
                check != null && check.value.any { c -> c == permission }
            }
}