package com.skolopendra.yacht.features.company

import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.yacht.access.annotations.Owner
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.features.auth.currentUserId
import com.skolopendra.yacht.features.user.PrivateUserController
import com.skolopendra.yacht.features.user.User
import com.skolopendra.yacht.features.user.UserGraph
import com.skolopendra.yacht.features.user.UserService
import com.skolopendra.yacht.jooq.Tables
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import javax.imageio.ImageIO
import javax.persistence.EntityNotFoundException

@RestController
@Owner
@Secured(Roles.CHIEF_EDITOR)
@RequestMapping("/companies")
class CompanyEditController(
        private val userService: UserService,
        private val companyService: CompanyService,
        private val companyRepository: UserGraph
) {
    companion object {
        val FULL_GRAPH = PrivateUserController.FULL_GRAPH with {
            +"jobCount"
            +"eventCount"
        }
    }

    // TODO: Company by username

    // should return full company data if one with id exists
    // should throw if it doesn't exist
    // should not allow people who are not owner of company to view this
    @GetMapping("{id}/full")
    fun getFull(@PathVariable id: Long): GraphResult {
        if(currentUser().isDeleted)
            throw EntityNotFoundException("User not found")
        return companyRepository.get(currentUserId(), null).apply { query.addConditions(Tables.USER.ID.eq(id)) }.fetchSingle(FULL_GRAPH)
    }

    // should update company data
    // should not allow people who are not owner of company to do this
    @Secured(Roles.CHIEF_EDITOR)
    @PatchMapping("{id}")
    fun patch(@PathVariable("id") company: User, @RequestBody patch: Map<String, Any?>): GraphResult {
        if(company.isDeleted)
            throw EntityNotFoundException("User not found")
        userService.patch(company, patch)
        return companyRepository.get(currentUserId(), null).apply { query.addConditions(Tables.USER.ID.eq(company.id)) }.fetchSingle(FULL_GRAPH)
    }

    data class UpdateLogoResponse(
            val url: String
    )

    // should process and upload company logo
    // should not allow people who are not owner of company to do this
    @PutMapping("{id}/logo")
    fun updateLogo(@PathVariable("id") company: User, @RequestParam(required = false) logo: MultipartFile?): UpdateLogoResponse {
        if(company.isDeleted)
            throw EntityNotFoundException("User not found")
        if (logo != null) {
            require(!logo.isEmpty)
            userService.changePicture(company, ImageIO.read(logo.inputStream))
        } else {
            userService.deletePicture(company)
        }

        return UpdateLogoResponse(company.profilePictureUrl!!)
    }

    // should delete company with id if it exists
    // should throw if it doesn't exist
    // should not allow people who are not owner of company to do this
    @DeleteMapping("{id}")
    fun delete(@PathVariable id: Long) {
        companyService.delete(id)
    }
}
