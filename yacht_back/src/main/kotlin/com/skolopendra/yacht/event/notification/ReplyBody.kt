package com.skolopendra.yacht.event.notification

class ReplyBody(
        val reply: CommentBody,
        val parent: CommentBody
) : INotification