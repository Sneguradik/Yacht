package com.skolopendra.yacht.features.company

import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.lib.graph.StoredJoin
import com.skolopendra.lib.graph.Graph
import com.skolopendra.yacht.features.user.UserSchema
import com.skolopendra.yacht.jooq.Tables
import org.jooq.DSLContext
import org.jooq.JoinType
import org.springframework.stereotype.Repository

@Repository
class CompanyApplicationRepositoryImpl(
        val dsl: DSLContext
) : CompanyApplicationRepositoryCustom {
    companion object {
        val GRAPH = (Graph on Tables.COMPANY_APPLICATION) {
            val companyJoin = StoredJoin(Tables.USER, JoinType.JOIN, Tables.USER.ID.eq(Tables.COMPANY_APPLICATION.COMPANY_ID))

            "meta" embed {
                "id" from Tables.COMPANY_APPLICATION.ID
                "createdAt" from Tables.COMPANY_APPLICATION.CREATED_AT
                "updatedAt" from Tables.COMPANY_APPLICATION.UPDATED_AT
            }
            "application" embed {
                "status" from Tables.COMPANY_APPLICATION.STATUS
                "message" from Tables.COMPANY_APPLICATION.MESSAGE
                "rejectionReason" from Tables.COMPANY_APPLICATION.REJECTION_REASON
            }
            "company" from (UserSchema.GRAPH using companyJoin)
        }
    }

    override fun graph(forUser: Long?): GraphQuery =
            GRAPH.create(dsl, mapOf("user" to forUser))
}
