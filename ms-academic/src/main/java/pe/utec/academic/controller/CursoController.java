package pe.utec.academic.controller;

import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pe.utec.academic.dto.*;
import pe.utec.academic.service.CursoService;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Cursos", description = "Gestión de cursos por carrera")
public class CursoController {

    private final CursoService cursoService;

    // ── GET /cursos (con paginación y filtros) ────────────────
    @GetMapping("/cursos")
    @Operation(summary = "Listar cursos con filtros opcionales")
    public ResponseEntity<PageResponse<CursoDto.Response>> listar(
            @RequestParam(required = false) Integer carreraId,
            @RequestParam(required = false) String  q,
            @RequestParam(defaultValue = "1")  int pagina,
            @RequestParam(defaultValue = "20") int limite) {
        return ResponseEntity.ok(cursoService.listar(carreraId, q, pagina, limite));
    }

    // ── GET /carreras/:id/cursos (shortcut para el frontend) ─
    @GetMapping("/carreras/{carreraId}/cursos")
    @Operation(summary = "Listar cursos de una carrera específica")
    public ResponseEntity<List<CursoDto.Response>> listarPorCarrera(
            @PathVariable Integer carreraId) {
        return ResponseEntity.ok(cursoService.listarPorCarrera(carreraId));
    }

    // ── GET /cursos/:id ──────────────────────────────────────
    @GetMapping("/cursos/{id}")
    @Operation(summary = "Obtener curso por ID")
    public ResponseEntity<CursoDto.Response> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(cursoService.obtenerPorId(id));
    }

    // ── POST /cursos ─────────────────────────────────────────
    @PostMapping("/cursos")
    @Operation(summary = "Crear curso (solo ADMIN)")
    public ResponseEntity<CursoDto.Response> crear(
            @Valid @RequestBody CursoDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(cursoService.crear(req));
    }

    // ── PUT /cursos/:id ──────────────────────────────────────
    @PutMapping("/cursos/{id}")
    @Operation(summary = "Actualizar curso (solo ADMIN)")
    public ResponseEntity<CursoDto.Response> actualizar(
            @PathVariable Integer id,
            @RequestBody  CursoDto.Request req) {
        return ResponseEntity.ok(cursoService.actualizar(id, req));
    }

    // ── DELETE /cursos/:id ───────────────────────────────────
    @DeleteMapping("/cursos/{id}")
    @Operation(summary = "Desactivar curso (soft delete, solo ADMIN)")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        cursoService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
