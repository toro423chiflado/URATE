package pe.utec.academic.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class CursoDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotNull(message = "carreraId es requerido")
        private Integer carreraId;

        @NotBlank(message = "El nombre es requerido")
        @Size(max = 120)
        private String nombre;

        @NotBlank(message = "El código es requerido")
        @Size(max = 12)
        private String codigo;

        private String  colorHex;
        private String  imgUrl;

        @Min(1) @Max(10)
        private Integer creditos;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Integer id;
        private Integer carreraId;
        private String  carreraNombre;
        private String  nombre;
        private String  codigo;
        private String  colorHex;
        private String  imgUrl;
        private Integer creditos;
        private Boolean activo;
    }
}
