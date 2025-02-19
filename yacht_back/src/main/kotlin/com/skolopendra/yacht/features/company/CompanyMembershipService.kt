package com.skolopendra.yacht.features.company

import com.skolopendra.lib.graph.GraphQuery
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserGraph
import com.skolopendra.yacht.jooq.Tables
import org.jooq.JoinType
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CompanyMembershipService(
        val memberships: CompanyMembershipRepository,
        val companies: UserGraph
) {
    fun add(company: User, member: User) {
        require(company.id != member.id)
        require(!member.company.isCompany)
        memberships.save(CompanyMembership(user = member, company = company))
    }

    @Transactional
    fun remove(company: User, member: User) {
        memberships.deleteByCompanyAndUser(company, member)
    }

    fun listMembersGraph(company: User, forUser: Long?): GraphQuery {
        return companies.get(forUser, null).apply {
            query.addJoin(
                    Tables.COMPANY_MEMBERSHIP,
                    JoinType.LEFT_SEMI_JOIN,
                    Tables.COMPANY_MEMBERSHIP.USER_ID.eq(Tables.USER.ID),
                    Tables.COMPANY_MEMBERSHIP.COMPANY_ID.eq(company.id)
            )
        }
    }
}