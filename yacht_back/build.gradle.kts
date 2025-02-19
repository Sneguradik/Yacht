import nu.studer.gradle.jooq.JooqEdition
import nu.studer.gradle.jooq.JooqGenerate
import org.jetbrains.kotlin.cli.jvm.main
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.jooq.meta.jaxb.Property
import org.testcontainers.containers.JdbcDatabaseContainer
import org.testcontainers.containers.PostgreSQLContainerProvider

plugins {
    id("org.springframework.boot") version "2.7.17"
    id("io.spring.dependency-management") version "1.0.15.RELEASE"
    kotlin("jvm") version "1.8.21"
    kotlin("plugin.spring") version "1.8.21"
    id("org.liquibase.gradle") version "2.0.2"
    id("nu.studer.jooq") version "7.2"
    kotlin("plugin.jpa") version "1.8.21"
    kotlin("kapt") version "1.8.21"
}

group = "com.skolopendra"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_11
}

sourceSets {
    test {
        resources {
            setSrcDirs(arrayOf("src/test/resources").toMutableList())
        }
    }
}

buildscript {
    dependencies {
        classpath("org.liquibase:liquibase-gradle-plugin:2.2.0")
        classpath("org.jooq:jooq-codegen:3.16.22")
        classpath("nu.studer:gradle-jooq-plugin:7.2")
        classpath("org.testcontainers:postgresql:1.17.1")
    }

    configurations["classpath"].resolutionStrategy.eachDependency {
        if (requested.group == "org.jooq") {
            useVersion("3.16.22")
        }
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jooq", "jooq", "3.16.22")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-jooq")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("com.fasterxml.jackson.module:jackson-module-jaxb-annotations:2.15.3")
    implementation("com.vladmihalcea:hibernate-types-52:2.21.1")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    implementation("org.imgscalr:imgscalr-lib:4.2")
    implementation(platform("com.amazonaws:aws-java-sdk-bom:1.12.570"))
    implementation("com.amazonaws:aws-java-sdk-s3")
    implementation("com.google.api-client:google-api-client:2.2.0")
    implementation("org.springframework.social:spring-social-core:1.1.6.RELEASE")
    implementation("org.springframework.social:spring-social-facebook:2.0.3.RELEASE")
    implementation("org.springframework.social:spring-social-facebook-web:2.0.3.RELEASE")
    implementation("com.googlecode.owasp-java-html-sanitizer:owasp-java-html-sanitizer:20220608.1")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
    annotationProcessor("org.hibernate:hibernate-jpamodelgen:5.2.17.Final")
    implementation("io.jsonwebtoken:jjwt:0.9.1")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    implementation("org.reflections:reflections:0.9.11")
    runtimeOnly("org.postgresql:postgresql")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.testcontainers:testcontainers:1.15.1")
    testImplementation("org.testcontainers:postgresql:1.15.1")
    implementation("org.yaml", "snakeyaml", "1.15")
    implementation("org.liquibase", "liquibase-core", "3.8.1")

    liquibaseRuntime(files("src/main/resources"))
//    liquibaseRuntime(sourceSets.getByName("main").compileClasspath)
//    liquibaseRuntime(sourceSets.getByName("main").output)
    liquibaseRuntime("org.liquibase:liquibase-core")
    liquibaseRuntime("org.postgresql:postgresql")
    liquibaseRuntime("info.picocli:picocli:4.6.1")
    liquibaseRuntime("ch.qos.logback:logback-core:1.2.3")

    jooqGenerator("org.postgresql:postgresql:42.6.0")
    jooqGenerator("org.jooq:jooq-meta-extensions:3.16.22")
    jooqGenerator("org.jooq:jooq-meta-extensions-liquibase")
    jooqGenerator("jakarta.xml.bind:jakarta.xml.bind-api:3.0.1")
    jooqGenerator(files("src/main/resources"))
    jooqGenerator("org.testcontainers:postgresql:1.17.1")
    jooqGenerator("org.slf4j:slf4j-jdk14:1.7.30")

    implementation("org.springdoc:springdoc-openapi-ui:1.7.0")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.security:spring-security-messaging")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf(
            "-Xjsr305=strict",
            "-Xjvm-default=all",
            "-progressive",
            "-Xskip-prerelease-check",
            "-opt-in=kotlin.time.ExperimentalTime",
            "-opt-in=io.kotest.common.ExperimentalKotest"
        )
        jvmTarget = "11"
    }
}

tasks.withType<Test> {
    this.testLogging {
        this.showStandardStreams = true
    }
}

// starting container
var postgres: JdbcDatabaseContainer<*> = PostgreSQLContainerProvider().newInstance("14-alpine")
postgres.start()

val containerStop by tasks.registering {
    if (postgres.isRunning) {
        println("STOPPING DATABASE CONTAINER")
        postgres.stop()
    }
}

liquibase {
    activities.register("main") {
        this.arguments = mapOf(
            "logLevel" to "info",
            "classpath" to "${projectDir}/",
            "changeLogFile" to "db/changelog/master.xml",
            "url" to postgres.jdbcUrl,
            "username" to postgres.username,
            "password" to postgres.password,
            "driver" to "org.postgresql.Driver"
        )
    }
    runList = "main"
//    activities.register("local") {
//        this.arguments = mapOf(
//            "logLevel" to "info",
//            "changeLogFile" to "src/main/resources/db/changelog/master.xml",
//            "url" to "jdbc:postgresql://localhost:5432/yacht_second",
//            "username" to "yacht",
//            "password" to "local",
//            "referenceUrl" to "jdbc:postgresql://localhost:5432/yacht_third?user=yacht&password=local"
//        )
//    }
//    runList = "local"
}

tasks.named("update") {
    doLast {
        tasks.named("generateJooq").get()
    }
}

tasks.withType<JooqGenerate> {
    doLast {
        containerStop.get()
    }
}

jooq {
    edition.set(JooqEdition.OSS)

    configurations {
        create("main") {
            generateSchemaSourceOnCompilation.set(true)

            jooqConfiguration.apply {
                logging = org.jooq.meta.jaxb.Logging.WARN

                jdbc.apply {
                    driver = "org.postgresql.Driver"
                    url = postgres.jdbcUrl
                    user = postgres.username
                    password = postgres.password
                }

                generator.apply {
                    name = "org.jooq.codegen.DefaultGenerator"

                    target.apply {
                        packageName = "com.skolopendra.yacht.jooq"
                        directory = "$buildDir/generated2/jooq"
                    }

                    database.apply {
                        inputSchema = "public"
                        excludes = "job_event_views"
                        name = "org.jooq.meta.postgres.PostgresDatabase"
                    }
                    strategy.name = "org.jooq.codegen.DefaultGeneratorStrategy"
                }
            }
        }
    }
}


tasks.named("generateJooq") {
    dependsOn(tasks.named("update").get())
}
