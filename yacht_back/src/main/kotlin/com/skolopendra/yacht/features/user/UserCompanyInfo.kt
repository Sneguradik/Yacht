package com.skolopendra.yacht.features.user

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import com.skolopendra.lib.Patchable
import org.hibernate.validator.constraints.Length
import javax.persistence.Column
import javax.persistence.Embeddable

@Embeddable
@JsonInclude(JsonInclude.Include.NON_NULL)
class UserCompanyInfo(
        @property:Patchable
        @get:JsonProperty("name")
        @get:Length(max = 26)
        @Column(name = "company_name")
        var name: String?,

        @Column(name = "company_confirmed")
        var isConfirmed: Boolean?,

        @get:JsonProperty("isCompany")
        @Column(name = "is_company")
        var isCompany: Boolean
) {
    constructor() : this(null, null, false)
}
