package com.skolopendra.yacht.access.config

import com.skolopendra.lib.access.CompositeMethodSecurityMetadataSource
import com.skolopendra.yacht.access.voters.*
import org.springframework.context.annotation.Configuration
import org.springframework.security.access.AccessDecisionManager
import org.springframework.security.access.method.DelegatingMethodSecurityMetadataSource
import org.springframework.security.access.method.MethodSecurityMetadataSource
import org.springframework.security.access.vote.AbstractAccessDecisionManager
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration

@Configuration
@EnableGlobalMethodSecurity(
        securedEnabled = true,
        jsr250Enabled = true,
        prePostEnabled = true
)
class MethodSecurityConfiguration(
        val voter: CustomAccessDecisionVoter
) : GlobalMethodSecurityConfiguration() {
    override fun accessDecisionManager(): AccessDecisionManager {
        val manager = super.accessDecisionManager() as AbstractAccessDecisionManager
        manager.decisionVoters.add(voter)
        manager.decisionVoters.add(SuperuserAccessDecisionVoter())
        manager.decisionVoters.add(OwnerVoter())
        manager.decisionVoters.add(CompanyAccountVoter())
        return manager
    }

    override fun methodSecurityMetadataSource(): MethodSecurityMetadataSource {
        val source = super.methodSecurityMetadataSource() as DelegatingMethodSecurityMetadataSource

        return CompositeMethodSecurityMetadataSource(source.methodSecurityMetadataSources)
    }

    override fun customMethodSecurityMetadataSource(): MethodSecurityMetadataSource {
        return CustomMethodSecurityMetadataSource()
    }
}