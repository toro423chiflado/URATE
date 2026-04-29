package pe.utec.academic.controller;

import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pe.utec.academic.dto.ProfesorCursoDto;
import pe.utec.academic.service.ProfesorCursoService;
import java.util.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "ProfesorCurso", description = "Asignación de profesores a cursos por semestre")
public class ProfesorCursoController {

    private final ProfesorCursoService profesorCursoService;

    // ── GET /cursos/:id/profesores ────────────────────────────
    @GetMapping("/cursos/{cursoId}/profesores")
    @Operation(summary = "Lista todos los profesores de un curso (enriquecido con datos MS1)")
    public ResponseEntity<List<ProfesorCursoDto.Response>> listarPorCurso(
            @PathVariable Integer cursoId,
            HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        return ResponseEntity.ok(profesorCursoService.listarPorCurso(cursoId, bearer));
    }

    // ── GET /profesores/:profesorId/cursos ────────────────────
    @GetMapping("/profesores/{profesorId}/cursos")
    @Operation(summary = "Lista todos los cursos activos de un profesor")
    public ResponseEntity<List<ProfesorCursoDto.Response>> listarPorProfesor(
            @PathVariable String profesorId,
            HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        return ResponseEntity.ok(profesorCursoService.listarPorProfesor(profesorId, bearer));
    }

    // ── GET /profesor-curso/:id ───────────────────────────────
    @GetMapping("/profesor-curso/{id}")
    @Operation(summary = "Obtener asignación específica por ID (usado por MS4 para validar)")
    public ResponseEntity<ProfesorCursoDto.Response> obtener(
            @PathVariable Integer id,
            HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        return ResponseEntity.ok(profesorCursoService.obtenerPorId(id, bearer));
    }

    // ── GET /profesor-curso/:id/existe ────────────────────────
    // MS4 llama esto para verificar que el profesor_curso_id es válido
    // antes de registrar una calificación
    @GetMapping("/profesor-curso/{id}/existe")
    @Operation(summary = "Verifica si un ProfesorCurso existe y está activo (para MS4)")
    public ResponseEntity<Map<String, Boolean>> existe(@PathVariable Integer id) {
        boolean existe = profesorCursoService.existeYActivo(id);
        return ResponseEntity.ok(Map.of("existe", existe, "activo", existe));
    }

    // ── POST /profesor-curso ──────────────────────────────────
    @PostMapping("/profesor-curso")
    @Operation(summary = "Asignar profesor a curso (solo ADMIN — valida en MS1)")
    public ResponseEntity<ProfesorCursoDto.Response> asignar(
            @Valid @RequestBody ProfesorCursoDto.Request req,
            HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(profesorCursoService.asignar(req, bearer));
    }

    // ── DELETE /profesor-curso/:id ────────────────────────────
    @DeleteMapping("/profesor-curso/{id}")
    @Operation(summary = "Desactivar asignación (soft delete, solo ADMIN)")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        profesorCursoService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
