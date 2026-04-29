package pe.utec.academic.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Respuesta EXACTA de GET /usuarios/:id del MS1 real.
 *
 * El MS1 devuelve:
 * { id, nombre, apellido, correo, rol, activo, foto,
 *   github, linkedin, createdAt }
 *
 * @JsonIgnoreProperties(ignoreUnknown=true) por si el MS1
 * agrega campos nuevos — no rompe la deserialización.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class UsuarioMs1Dto {
    private String  id;
    private String  nombre;
    private String  apellido;
    private String  correo;
    private String  rol;         // "ADMIN" | "PROFESOR" | "ESTUDIANTE"
    private Boolean activo;
    private String  foto;
    private String  github;
    private String  linkedin;
}
