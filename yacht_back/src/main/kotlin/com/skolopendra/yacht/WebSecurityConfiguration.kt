package com.skolopendra.yacht

import com.skolopendra.lib.auth.JwtAuthenticationFilter
import com.skolopendra.yacht.access.config.Roles
import com.skolopendra.yacht.features.auth.JwtAuthenticationProvider
import org.springframework.context.annotation.Bean
import org.springframework.core.env.Environment
import org.springframework.core.env.Profiles
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.BeanIds
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@EnableWebSecurity
class WebSecurityConfiguration(
    val jwtAuthenticationProvider: JwtAuthenticationProvider,
    val environment: Environment
) : WebSecurityConfigurerAdapter() {
    @Bean(BeanIds.AUTHENTICATION_MANAGER)
    override fun authenticationManagerBean(): AuthenticationManager {
        return super.authenticationManagerBean()
    }

    fun createCorsConfigurationSource(): CorsConfigurationSource {
        val source = UrlBasedCorsConfigurationSource()
        val configuration = CorsConfiguration().applyPermitDefaultValues()
        configuration.addAllowedMethod("DELETE")
        configuration.addAllowedMethod("PUT")
        configuration.addAllowedMethod("PATCH")
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    fun buildJwtAuthenticationFilter(): JwtAuthenticationFilter {
        val filter = JwtAuthenticationFilter(AntPathRequestMatcher("/**"))
        filter.setAuthenticationManager(authenticationManagerBean())
        return filter
    }

    override fun configure(http: HttpSecurity) {
        // TODO
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        http.anonymous()
            .authorities("ROLE_ANONYMOUS")
            .init(http)
        http.csrf().disable()
        http.cors().configurationSource(createCorsConfigurationSource())
        if (environment.acceptsProfiles(Profiles.of("docs"))) {
            http.authorizeRequests().antMatchers(
                "/",
                "/v3/api-docs/**",
                "/swagger-ui.html",
                "/swagger-ui/**"
            ).permitAll()
        }
        http.addFilterBefore(buildJwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter::class.java)

        val bannedUserRole = Roles.BANNED_USER.substringAfter("ROLE_")

        http.authorizeRequests()
            .antMatchers("/**/favicon.ico").permitAll()
            .antMatchers(HttpMethod.GET, "/search/**").permitAll()
            .antMatchers(HttpMethod.GET, "/feed", "/feed/count").permitAll()

            .antMatchers(HttpMethod.POST, "/token/refresh").permitAll()
            .antMatchers(HttpMethod.POST, "/users/register/**").permitAll()

            .antMatchers(
                HttpMethod.GET,
                "/users",
                "/users/id{userId:\\d+}",
                "/users/{username:\\w+}",
                "/users/{\\d+}/comments",
                "/users/{\\d+}/comments/count"
            ).permitAll()
            .antMatchers(
                HttpMethod.GET,
                "/articles/{\\d+}",
                "/articles/{\\d+}/comments",
                "/comments/{\\d+}"
            ).permitAll()
            .antMatchers(
                HttpMethod.GET,
                "/companies",
                "/companies/id{id:\\d+}",
                "/companies/{\\w+}",
                "/companies/{\\d+}/comments",
                "/companies/{\\d+}/comments/count",
                "/companies/{\\d+}/members",
                "/companies/{\\d+}/jobs",
                "/companies/{\\d+}/events"
            ).permitAll()
            .antMatchers("/companies/me").hasRole("USER")

            .antMatchers(
                HttpMethod.GET,
                "/tags",
                "/tags/{\\d+}",
                "/tags/({(\\d+,?)+})",
                "/topics",
                "/topics/{\\d+}",
                "/topics/({(\\d+,?)+})",
                "/topics/url/**"
            ).permitAll()

            .antMatchers(
                HttpMethod.GET,
                "/jobs",
                "/jobs/{\\d+}",
                "/events",
                "/events/{\\d+}"
            ).permitAll()
            .antMatchers(
                HttpMethod.POST,
                "/jobs/{\\d+}/view",
                "/events/{\\d+}/view",
                "/tags/{\\d+}/view"
            ).permitAll()
            .antMatchers(
                HttpMethod.GET,
                "/administration/events"
            ).permitAll()

            .antMatchers(
                HttpMethod.GET,
                "/advertisement",
                "/advertisement/all",
                "/advertisement/active"
            ).permitAll()

            .antMatchers(
                HttpMethod.POST,
                "/advertisement/click/{\\d+}",
                "/advertisement/view/{\\d+}"
            ).permitAll()

            .antMatchers(HttpMethod.POST, "/users/reset").permitAll()
            .antMatchers(HttpMethod.GET, "/users/reset").permitAll()
            .antMatchers(HttpMethod.POST, "/users/reset/change").permitAll()

            .antMatchers(HttpMethod.GET, "/showcases").permitAll()

            .antMatchers(HttpMethod.GET, "/stories").permitAll()
            .antMatchers(HttpMethod.GET, "/administration/preview/get/**").permitAll()


            .antMatchers("/auth/**").permitAll()
            .antMatchers("/ws/info", "/ws/**").permitAll()
            .antMatchers(HttpMethod.GET).hasAnyRole(bannedUserRole, "USER")
            .antMatchers(
                HttpMethod.POST,
                "/articles/{\\d+}/bookmark",
                "/events/{\\d+}/bookmark",
                "/jobs/{\\d+}/bookmark",
                "/topics/{\\d+}/subscribe",
                "/users/{\\d+}/subscribe",
                "/companies/{\\d+}/subscribe",
                "/users/{\\d+}/hide",
                "/notifications/settings",
                "/notifications/{\\d+}/read"
            ).hasAnyRole(bannedUserRole, "USER")
            .antMatchers(
                HttpMethod.DELETE,
                "/articles/{\\d+}/bookmark",
                "/events/{\\d+}/bookmark",
                "/jobs/{\\d+}/bookmark",
                "/topics/{\\d+}/subscribe",
                "/users/{\\d+}/subscribe",
                "/companies/{\\d+}/subscribe",
                "/users/{\\d+}/hide"
            ).hasAnyRole(bannedUserRole, "USER")
            .antMatchers(
                HttpMethod.PUT,
                "/users/me/password",
                "/users/me/email",
                "/users/me/username",
                "/users/me/picture/import/facebook",
                "/users/me/picture",
                "/users/me/cover"
            ).hasAnyRole(bannedUserRole, "USER")
            .antMatchers(HttpMethod.PATCH, "/users/me").hasAnyRole(bannedUserRole, "USER")

            .anyRequest().hasRole(Roles.USER.substringAfter("ROLE_"))
    }

    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(jwtAuthenticationProvider)
    }
}
