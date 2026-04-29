package pe.utec.academic.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class ProfesorCursoDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "profesorId es requerido (UUID del MS1)")
        private String profesorId;

        @NotNull(message = "cursoId es requerido")
        private Integer cursoId;

        @NotBlank(message = "El semestre es requerido (ej: 2025-1)")
        @Pattern(regexp = "^\\d{4}-(1|2)$", message = "Formato de semestre inválido. Usa: 2025-1 o 2025-2")
        private String semestre;

        @Size(max = 5)
        private String seccion;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Integer id;
        private String  profesorId;
        // Datos del profesor enriquecidos desde MS1
        private String  profesorNombre;
        private String  profesorApellido;
        private String  profesorFoto;
        private Integer cursoId;
        private String  cursoNombre;
        private String  cursoCodigo;
        private String  cursoColorHex;
        private String  carreraNombre;
        private String  semestre;
        private String  seccion;
        private Boolean activo;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ResumenResponse {
        private Integer id;
        private String  profesorId;
        private String  profesorNombre;
        private String  profesorApellido;
        private String  profesorFoto;
        private String  semestre;
        private String  seccion;
        private Boolean activo;
    }
}
