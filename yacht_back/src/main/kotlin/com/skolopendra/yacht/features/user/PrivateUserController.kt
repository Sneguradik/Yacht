package com.skolopendra.yacht.features.user

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.skolopendra.lib.graph.GraphResult
import com.skolopendra.yacht.access.annotations.Owner
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.controller.common.UrlResponse
import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.jooq.Tables
import com.skolopendra.yacht.service.social.FacebookService
import com.skolopendra.yacht.util.TrimCase
import org.springframework.http.HttpStatus
import org.springframework.security.access.annotation.Secured
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.util.*
import javax.imageio.ImageIO
import javax.persistence.EntityNotFoundException
import javax.validation.Valid
import javax.validation.constraints.Email
import javax.validation.constraints.Size

@RestController
@Owner
@Secured(Roles.CHIEF_EDITOR)
@RequestMapping("/users/me", "/users/private/{id}")
class PrivateUserController(
        val userService: UserService,
        val userRepositoryCustom: UserGraph
) {
    companion object {
        val FULL_GRAPH = UserController.PROFILE with {
            +"privateEmail"
        }
    }

    fun isUserPresented(user: Optional<User>): User {
        return user.orElse(currentUser())
    }

    fun isPinned(user: User) {
        if (user.isPinned) throw IllegalArgumentException("User is pinned and can't be edited")
    }

    /**
     * Returns data about current logged in user
     */
    @GetMapping
    fun me(@PathVariable("id") user: Optional<User>): GraphResult {
        if(isUserPresented(user).isDeleted)
            throw EntityNotFoundException("User not found")
        val id = isUserPresented(user).id
        return userRepositoryCustom.get(id, null).apply { query.addConditions(Tables.USER.ID.eq(id)) }.fetchSingle(FULL_GRAPH)
    }

    @PutMapping("cover")
    @ResponseStatus(HttpStatus.OK)
    fun updateCover(@PathVariable("id") user: Optional<User>, @RequestParam("file") file: MultipartFile?) {
        if(isUserPresented(user).isDeleted)
            throw EntityNotFoundException("User not found")
        val currentUser = isUserPresented(user)
        isPinned(currentUser)
        userService.changeCover(currentUser, file)
    }

    @PutMapping("picture")
    @ResponseStatus(HttpStatus.OK)
    fun updatePicture(@PathVariable("id") user: Optional<User>, @RequestParam("file", required = false) file: MultipartFile?) {
        if(isUserPresented(user).isDeleted)
            throw EntityNotFoundException("User not found")
        val currentUser = isUserPresented(user)
        isPinned(currentUser)
        if (file != null) {
            require(!file.isEmpty)
            userService.changePicture(currentUser, ImageIO.read(file.inputStream))
        } else {
            userService.deletePicture(currentUser)
        }
    }

    @PutMapping("picture/import/facebook")
    fun importPictureFromFacebook(
            @PathVariable("id") user: Optional<User>,
            @Valid @RequestBody body: FacebookService.FacebookAuth
    ): UrlResponse {
        if(isUserPresented(user).isDeleted)
            throw EntityNotFoundException("User not found")
        val currentUser = isUserPresented(user)

        isPinned(currentUser)
        userService.importPictureFromFacebook(currentUser, body)

        return UrlResponse(currentUser.profilePictureUrl!!)
    }

    @PatchMapping
    fun patchUser(@PathVariable("id") user: Optional<User>, @RequestBody patch: Map<String, Any?>): GraphResult {
        if(isUserPresented(user).isDeleted)
            throw EntityNotFoundException("User not found")
        val currentUser = isUserPresented(user)
        isPinned(currentUser)
        val patchedUser = userService.patch(currentUser, patch)
        return userRepositoryCustom.get(patchedUser.id, null).apply { query.addConditions(Tables.USER.ID.eq(patchedUser.id)) }.fetchSingle(FULL_GRAPH)

    }

    data class UsernameUpdateRequest(
            @get:javax.validation.constraints.Pattern(regexp = "^((?!^id\\d))[a-zA-Z_][a-zA-Z_0-9]{2,31}\$")
            val username: String?
    )

    @PutMapping("username")
    fun username(@PathVariable("id") user: Optional<User>, @Valid @RequestBody request: UsernameUpdateRequest) {
        if(isUserPresented(user).isDeleted)
            throw EntityNotFoundException("User not found")
        val currentUser = isUserPresented(user)
        isPinned(currentUser)
        userService.changeUsername(currentUser, request.username)
    }

    data class EmailUpdateRequest(
            @JsonDeserialize(using = TrimCase::class)
            @get:Email
            val email: String
    )

    @PutMapping("email")
    fun updateEmail(@PathVariable("id") user: Optional<User>, @Valid @RequestBody request: EmailUpdateRequest) {
        if(isUserPresented(user).isDeleted)
            throw EntityNotFoundException("User not found")
        val currentUser = isUserPresented(user)
        // TODO: Proper email normalization
        isPinned(currentUser)
        val normalizedEmail = request.email.lowercase()
        userService.changeAddress(currentUser, normalizedEmail)

    }

    data class PasswordUpdateRequest(
            @get:Size(min = 8, max = 128)
            val password: String
    )

    @PutMapping("password")
    fun updatePassword(@PathVariable("id") user: Optional<User>, @Valid @RequestBody request: PasswordUpdateRequest) {
        if(isUserPresented(user).isDeleted)
            throw EntityNotFoundException("User not found")
        val currentUser = isUserPresented(user)
        isPinned(currentUser)
        userService.changePassword(isUserPresented(user), request.password)
    }
}
