package com.skolopendra.yacht.service

import com.skolopendra.yacht.repository.RoleRepository
import com.skolopendra.yacht.entity.access.Role
import org.springframework.stereotype.Service
import javax.persistence.EntityNotFoundException

@Service
class RoleService(
        private val roleRepository: RoleRepository
) {

    fun getByNameOrThrow(name: String): Role {
        return roleRepository.findFirstByName(name) ?: throw EntityNotFoundException("Role with name $name not found")
    }
}