package com.skolopendra.yacht

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Info
import io.swagger.v3.oas.annotations.servers.Server
import org.springframework.context.annotation.Configuration

@OpenAPIDefinition(
        servers = [
            Server(url = "https://api.yachtsmanjournal.com", description = "Production server"),
            Server(url = "https://api.pre.yachtsmanjournal.com/", description = "Preprod server"),
            Server(url = "https://localhost:8080", description = "Development (local, https)"),
            Server(url = "http://localhost:8080", description = "Development (local)")
        ],
        info = Info(
                title = "YachtsmanJournal",
                version = "0.10.0"
        )
)
@Configuration
class OpenApiConfig
