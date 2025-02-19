package com.skolopendra.yacht.entity.access

import javax.persistence.Entity
import javax.persistence.Id

@Entity
class Role(
        @Id
        val name: String
)