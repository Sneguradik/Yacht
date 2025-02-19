package com.skolopendra.yacht.access.voters

import com.skolopendra.yacht.features.auth.getUser
import org.aopalliance.intercept.MethodInvocation
import org.springframework.security.access.AccessDecisionVoter
import org.springframework.security.access.ConfigAttribute
import org.springframework.security.core.Authentication

class CompanyAccountVoter : AccessDecisionVoter<MethodInvocation> {
    override fun vote(authentication: Authentication, invocation: MethodInvocation, attributes: MutableCollection<ConfigAttribute>): Int {
        if (authentication.getUser().user.company.isCompany)
            return AccessDecisionVoter.ACCESS_GRANTED
        return AccessDecisionVoter.ACCESS_DENIED
    }

    override fun supports(attribute: ConfigAttribute): Boolean = attribute.attribute == javaClass.name

    override fun supports(clazz: Class<*>): Boolean = clazz.isAssignableFrom(MethodInvocation::class.java)
}