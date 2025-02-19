package com.skolopendra.yacht.features.job

import com.skolopendra.lib.Patchable
import org.hibernate.validator.constraints.Length
import javax.persistence.Embeddable
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.validation.constraints.Email

@Embeddable
@Patchable
class JobInfo(
        @get:Length(max = 128)
        var name: String = "",

        @get:Length(max = 64)
        var minSalary: String? = null,

        @get:Length(max = 64)
        var maxSalary: String? = null,

        @Enumerated(EnumType.ORDINAL)
        var currency: Job.Currency = Job.Currency.RUB,

        @Enumerated(EnumType.ORDINAL)
        var type: Job.Type = Job.Type.FULL,

        @Enumerated(EnumType.ORDINAL)
        var place: Job.Place = Job.Place.OFFICE,

        @get:Length(max = 128)
        var city: String? = null,

        @get:Length(max = 128)
        var recruiterName: String? = null,

        @get:Email
        @get:Length(max = 255)
        var email: String? = null
)