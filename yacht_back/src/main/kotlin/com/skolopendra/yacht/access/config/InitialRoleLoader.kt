package com.skolopendra.yacht.access.config

import com.skolopendra.yacht.entity.access.Role
import com.skolopendra.yacht.repository.RoleRepository
import org.springframework.context.ApplicationListener
import org.springframework.context.event.ContextRefreshedEvent
import org.springframework.stereotype.Component
import kotlin.reflect.full.companionObject
import kotlin.reflect.full.memberProperties

@Component
class InitialRoleLoader(
        val roleRepository: RoleRepository
) : ApplicationListener<ContextRefreshedEvent> {
    var flag = false

    override fun onApplicationEvent(event: ContextRefreshedEvent) {
        if (!flag) {
            Roles::class.companionObject!!.memberProperties.filter { it.isConst }.forEach { ensureRole(it.getter.call(null) as String) }
            flag = true
        }
    }

    fun ensureRole(name: String): Role {
        val existing = roleRepository.findFirstByName(name)
        if (existing != null) {
            return existing
        }
        val role = Role(name = name)
        return roleRepository.save(role)
    }
}