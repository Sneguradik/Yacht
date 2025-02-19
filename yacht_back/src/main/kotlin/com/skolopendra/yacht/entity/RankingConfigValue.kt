package com.skolopendra.yacht.entity

import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "ranking_config")
class RankingConfigValue(
        @Id
        val id: String,

        var value: Float
)