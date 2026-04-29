package pe.utec.academic.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.*;
import pe.utec.academic.dto.UsuarioMs1Dto;
import reactor.core.publisher.Mono;
import java.time.Duration;
import java.util.Optional;

/**
 * Llama al MS1 (microservicio_auth) para:
 *   1. Validar que un usuario existe y tiene rol PROFESOR
 *   2. Enriquecer ProfesorCurso con nombre/apellido/foto
 *
 * Endpoints usados del MS1:
 *   GET /usuarios/:id  → requiere Bearer token (JWT del MS1)
 *   Responde: { id, nombre, apellido, correo, rol, activo, foto, github, linkedin }
 *
 * JWT del MS1 firmado con JWT_SECRET="utec_rate_secret_dev_2025"
 * payload: { sub, correo, rol, nombre, apellido }
 *
 * MODO MOCK (MS1_MOCK=true en .env):
 *   No llama al MS1. Útil para probar MS2 solo.
 */
@Component
@Slf4j
public class UserServiceClient {

    private final WebClient webClient;
    private final boolean   mockEnabled;

    public UserServiceClient(
            @Value("${ms1.url:http://localhost:3001}") String ms1Url,
            @Value("${ms1.mock-enabled:false}")        boolean mockEnabled) {

        this.mockEnabled = mockEnabled;
        this.webClient   = WebClient.builder()
            .baseUrl(ms1Url)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();

        if (mockEnabled) {
            log.warn("⚠️  MS1 MOCK activo — nombres de profesores son ficticios");
        } else {
            log.info("✅ MS1 cliente apuntando a: {}", ms1Url);
        }
    }

    /**
     * Obtiene el perfil de un usuario desde MS1.
     *
     * @param usuarioId   UUID del usuario (id en PostgreSQL del MS1)
     * @param bearerToken token JWT con formato "Bearer eyJ..."
     *                    Se reenvía al MS1 para autenticarse.
     */
    public Optional<UsuarioMs1Dto> obtenerUsuario(String usuarioId,
                                                   String bearerToken) {
        if (mockEnabled) {
            return Optional.of(buildMock(usuarioId));
        }

        try {
            UsuarioMs1Dto usuario = webClient.get()
                .uri("/usuarios/{id}", usuarioId)
                // Reenvía el token del request original al MS1
                .header(HttpHeaders.AUTHORIZATION,
                        bearerToken != null ? bearerToken : "")
                .retrieve()
                .onStatus(
                    status -> status.value() == 401 || status.value() == 403,
                    resp -> {
                        log.warn("[MS1] Sin permisos para ver usuario {}", usuarioId);
                        return Mono.empty();
                    }
                )
                .onStatus(
                    status -> status.value() == 404,
                    resp -> {
                        log.warn("[MS1] Usuario no encontrado: {}", usuarioId);
                        return Mono.empty();
                    }
                )
                .bodyToMono(UsuarioMs1Dto.class)
                .timeout(Duration.ofSeconds(5))
                .block();

            return Optional.ofNullable(usuario);

        } catch (Exception ex) {
            log.warn("[MS1] Error al obtener usuario {}: {}", usuarioId, ex.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Verifica que el usuario existe en MS1 y tiene rol=PROFESOR activo.
     * El MS2 llama esto antes de crear un ProfesorCurso.
     */
    public boolean esProfesorValido(String usuarioId, String bearerToken) {
        if (mockEnabled) {
            log.info("[MS1-MOCK] esProfesorValido({}) → true", usuarioId);
            return true;
        }
        return obtenerUsuario(usuarioId, bearerToken)
            .map(u -> "PROFESOR".equals(u.getRol()) && Boolean.TRUE.equals(u.getActivo()))
            .orElse(false);
    }

    // ── Datos mock: coinciden con el seed.js del MS1 ─────────────
    private UsuarioMs1Dto buildMock(String id) {
        return switch (id) {
            // Estos UUIDs coinciden con los de data.sql del MS2
            case "00000000-0000-0000-0000-000000000001" ->
                UsuarioMs1Dto.builder()
                    .id(id).nombre("Juan").apellido("Pérez")
                    .correo("juan.perez@utec.edu.pe")
                    .rol("PROFESOR").activo(true)
                    .foto("https://ui-avatars.com/api/?name=Juan+Perez&background=6366F1&color=fff")
                    .build();
            case "00000000-0000-0000-0000-000000000002" ->
                UsuarioMs1Dto.builder()
                    .id(id).nombre("Ana").apellido("Torres")
                    .correo("ana.torres@utec.edu.pe")
                    .rol("PROFESOR").activo(true)
                    .foto("https://ui-avatars.com/api/?name=Ana+Torres&background=EC4899&color=fff")
                    .build();
            case "00000000-0000-0000-0000-000000000003" ->
                UsuarioMs1Dto.builder()
                    .id(id).nombre("Pedro").apellido("Ruiz")
                    .correo("pedro.ruiz@utec.edu.pe")
                    .rol("PROFESOR").activo(true)
                    .foto("https://ui-avatars.com/api/?name=Pedro+Ruiz&background=10B981&color=fff")
                    .build();
            default ->
                UsuarioMs1Dto.builder()
                    .id(id).nombre("Profesor").apellido("UTEC")
                    .correo("profesor@utec.edu.pe")
                    .rol("PROFESOR").activo(true)
                    .foto("https://ui-avatars.com/api/?name=Prof+UTEC&background=F59E0B&color=fff")
                    .build();
        };
    }
}
