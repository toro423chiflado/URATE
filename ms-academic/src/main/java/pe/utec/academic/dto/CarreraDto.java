package pe.utec.academic.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

// ═══════════════════════════════════════════════════════════════
// CARRERA
// ═══════════════════════════════════════════════════════════════
public class CarreraDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "El nombre es requerido")
        @Size(max = 120)
        private String nombre;

        @NotBlank(message = "El código es requerido")
        @Size(max = 10)
        private String codigo;

        private String imgUrl;
        private Boolean activa;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Integer id;
        private String  nombre;
        private String  codigo;
        private String  imgUrl;
        private Boolean activa;
        private Integer totalCursos;
    }
}
