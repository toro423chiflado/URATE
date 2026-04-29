package pe.utec.academic.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class AppConfig implements WebMvcConfigurer {

    // ── CORS ─────────────────────────────────────────────────
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOriginPatterns("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(false);
    }

    // ── OpenAPI / Swagger ─────────────────────────────────────
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("MS2 — Academic API")
                .description("""
                    Microservicio académico de UTEC Rate.
                    Gestiona Carreras, Cursos y la asignación Profesor–Curso.

                    **Consume MS1** para validar que el usuario tiene rol PROFESOR
                    antes de asignarlo a un curso.

                    El header `Authorization: Bearer <token>` se reenvía a MS1.
                    """)
                .version("1.0.0")
                .contact(new Contact().name("UTEC Rate Team")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
