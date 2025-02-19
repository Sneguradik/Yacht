package com.skolopendra.yacht.access.voters

import com.skolopendra.yacht.access.config.Roles
import org.aopalliance.intercept.MethodInvocation
import org.springframework.security.access.AccessDecisionVoter
import org.springframework.security.access.ConfigAttribute
import org.springframework.security.core.Authentication

class SuperuserAccessDecisionVoter : AccessDecisionVoter<MethodInvocation> {
    override fun vote(authentication: Authentication, target: MethodInvocation, attributes: MutableCollection<ConfigAttribute>): Int {
        if (authentication.authorities.any { it.authority == Roles.SUPERUSER })
            return AccessDecisionVoter.ACCESS_GRANTED
        return AccessDecisionVoter.ACCESS_ABSTAIN
    }

    override fun supports(attribute: ConfigAttribute): Boolean = true

    override fun supports(clazz: Class<*>): Boolean = clazz.isAssignableFrom(MethodInvocation::class.java)
}