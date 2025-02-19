package com.skolopendra.yacht.features.job

import com.skolopendra.lib.Patchable
import org.hibernate.validator.constraints.Length
import org.hibernate.validator.constraints.URL
import javax.persistence.Embeddable

@Embeddable
@Patchable
class JobBody(
        @get:Length(max = 2048)
        var tasks: String = "",

        @get:Length(max = 2048)
        var workConditions: String = "",

        @get:Length(max = 2048)
        var requirements: String = "",

        @get:Length(max = 256)
        @get:URL
        var image: String? = null
)