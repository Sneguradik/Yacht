package com.skolopendra.yacht.service.seed

import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class MainSeeder(
        private val groupSeed: GroupSeed
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        groupSeed.run()
    }

}