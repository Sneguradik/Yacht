package com.skolopendra.yacht.access.voters

import com.skolopendra.yacht.entity.publication.Publication
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.getUser
import com.skolopendra.yacht.features.event.Event
import com.skolopendra.yacht.features.job.Job
import com.skolopendra.yacht.features.user.User
import org.aopalliance.intercept.MethodInvocation
import org.springframework.security.access.AccessDecisionVoter
import org.springframework.security.access.ConfigAttribute
import org.springframework.security.core.Authentication
import java.lang.reflect.ParameterizedType
import java.util.*

class OwnerVoter : AccessDecisionVoter<MethodInvocation> {
    private fun getFallbackTarget(type: Class<*>): Any {
        if (User::class.java.isAssignableFrom(type))
            return currentUser()
        else throw IllegalArgumentException("no fallback for empty optional")
    }

    private fun getTarget(invocation: MethodInvocation): Any {
        val argumentTarget = invocation.arguments.firstOrNull() ?: throw IllegalArgumentException("resource is null")

        return if (argumentTarget is Optional<*>) {
            if (argumentTarget.isPresent)
                return argumentTarget.get()

            val realType = (invocation.method.parameters[0].parameterizedType as ParameterizedType).actualTypeArguments.first() as Class<*>
            getFallbackTarget(realType)
        } else argumentTarget
    }

    override fun vote(authentication: Authentication, invocation: MethodInvocation, attributes: MutableCollection<ConfigAttribute>): Int {
        if (attributes.none { supports(it) })
            return AccessDecisionVoter.ACCESS_ABSTAIN

        val target = getTarget(invocation)
        val user = authentication.getUser()

        if (target is User && target.id == user.id)
            return AccessDecisionVoter.ACCESS_GRANTED
        if (target is Job && target.company.id == user.id)
            return AccessDecisionVoter.ACCESS_GRANTED
        if (target is Event && target.company.id == user.id)
            return AccessDecisionVoter.ACCESS_GRANTED
        if (target is Publication && target.author.id == user.id)
            return AccessDecisionVoter.ACCESS_GRANTED

        return AccessDecisionVoter.ACCESS_DENIED
    }

    override fun supports(attribute: ConfigAttribute): Boolean = attribute.attribute == javaClass.name

    override fun supports(clazz: Class<*>): Boolean = clazz.isAssignableFrom(MethodInvocation::class.java)
}