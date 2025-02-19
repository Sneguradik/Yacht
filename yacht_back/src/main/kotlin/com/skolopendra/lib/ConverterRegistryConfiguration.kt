package com.skolopendra.lib

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.ConverterRegistry

@Configuration
class ConverterRegistryConfiguration {
    @Bean
    fun initConverterRegistry(registry: ConverterRegistry): ConverterRegistry {
        registry.addConverterFactory(CustomEnumConverterFactory())
        return registry
    }
}