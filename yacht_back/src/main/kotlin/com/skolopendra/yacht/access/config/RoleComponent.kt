package com.skolopendra.yacht.access.config

import org.springframework.stereotype.Component

@Suppress("unused", "PropertyName")
@Component("roles")
class RoleComponent {
    val USER = Roles.USER
    val PRIVILEGED_USER = Roles.PRIVILEGED_USER
    val SALES = Roles.SALES
    val CHIEF_EDITOR = Roles.CHIEF_EDITOR
    val SUPERUSER = Roles.SUPERUSER
}