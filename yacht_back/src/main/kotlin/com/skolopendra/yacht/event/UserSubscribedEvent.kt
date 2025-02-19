package com.skolopendra.yacht.event

import com.skolopendra.yacht.features.user.User
import org.springframework.context.ApplicationEvent

class UserSubscribedEvent(val source: User, val subscriber: User) : ApplicationEvent(source)