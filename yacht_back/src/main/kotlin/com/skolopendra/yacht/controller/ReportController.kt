package com.skolopendra.yacht.controller

import com.skolopendra.yacht.features.auth.currentUser
import com.skolopendra.yacht.controller.common.CreateResponse
import com.skolopendra.yacht.service.ReportService
import org.hibernate.validator.constraints.Length
import org.hibernate.validator.constraints.URL
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/report")
class ReportController(
        private val reportService: ReportService
) {
    data class ReportContent(
            val type: ReportService.ReportEntityType,
            val id: Long,
            @get:Length(max = 1024)
            val message: String?
    )

    /**
     * Report an object
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun report(@RequestBody request: ReportContent): CreateResponse {
        return CreateResponse(
                reportService.report(
                        currentUser(),
                        request.type,
                        request.message,
                        request.id
                ).id
        )
    }
}
