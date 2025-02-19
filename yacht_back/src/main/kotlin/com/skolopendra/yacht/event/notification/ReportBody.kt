package com.skolopendra.yacht.event.notification

import com.skolopendra.yacht.entity.Report
import com.skolopendra.yacht.service.ReportService

class ReportBody(
        report: Report,
        val id: Long = report.id,
        val type: ReportService.ReportEntityType = report.reportObjectType,
        val itemId: Long = report.reportObjectId,
        val message: String? = report.message,
        val owner: UserBody = UserBody(report.user)
) : INotification
