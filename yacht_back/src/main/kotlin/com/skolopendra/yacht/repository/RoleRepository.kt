package com.skolopendra.yacht.repository

import com.skolopendra.yacht.entity.access.Role
import org.springframework.data.jpa.repository.JpaRepository

interface RoleRepository : JpaRepository<Role, String> {
    fun findFirstByName(name: String): Role?
}