package com.skolopendra.yacht.features.user

import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.skolopendra.yacht.util.TrimCase
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import javax.validation.Valid
import javax.validation.constraints.Email
import javax.validation.constraints.NotNull
import javax.validation.constraints.Size

@Validated
@RestController
@RequestMapping("/users/reset")
class UserRecoveryController(
        private val userRecoveryService: UserRecoveryService
) {
    data class DataReset(
            @JsonDeserialize(using = TrimCase::class)
            @get:Email
            @get:NotNull
            val email: String
    )

    data class DataChange(
            @JsonDeserialize(using = TrimCase::class)
            @get:Email
            @get:NotNull
            val email: String,

            @get:NotNull
            @get:Size(min = 8, max = 128)
            val password: String,

            @get:NotNull
            @get:Size(min = 64, max = 64)
            val hash: String
    )

    @PostMapping
    fun reset(@Valid @RequestBody data: DataReset) {
        userRecoveryService.createRecovery(data.email.lowercase())
    }

    @GetMapping
    fun check(
            @RequestParam("email")
            @JsonDeserialize(using = TrimCase::class) email: String,
            @RequestParam("hash") hash: String) {
        userRecoveryService.checkRecovery(email, hash)
    }

    @PostMapping("change")
    fun change(@Valid @RequestBody data: DataChange) {
        return userRecoveryService.useRecovery(email = data.email.lowercase(), hash = data.hash, password = data.password)
    }
}
