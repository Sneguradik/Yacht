package com.skolopendra.yacht.event

import com.skolopendra.yacht.features.user.User
import org.springframework.context.ApplicationEvent

class UserRegisterEvent(source: User) : ApplicationEvent(source)