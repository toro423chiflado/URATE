package pe.utec.academic.controller;

import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pe.utec.academic.dto.CarreraDto;
import pe.utec.academic.service.CarreraService;
import java.util.List;

@RestController
@RequestMapping("/carreras")
@RequiredArgsConstructor
@Tag(name = "Carreras", description = "Gestión de carreras universitarias")
public class CarreraController {

    private final CarreraService carreraService;

    @GetMapping
    @Operation(summary = "Listar todas las carreras activas")
    public ResponseEntity<List<CarreraDto.Response>> listar() {
        return ResponseEntity.ok(carreraService.listarTodas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener carrera por ID")
    public ResponseEntity<CarreraDto.Response> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(carreraService.obtenerPorId(id));
    }

    @PostMapping
    @Operation(summary = "Crear carrera (solo ADMIN)")
    public ResponseEntity<CarreraDto.Response> crear(
            @Valid @RequestBody CarreraDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(carreraService.crear(req));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar carrera (solo ADMIN)")
    public ResponseEntity<CarreraDto.Response> actualizar(
            @PathVariable Integer id,
            @RequestBody  CarreraDto.Request req) {
        return ResponseEntity.ok(carreraService.actualizar(id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar carrera (soft delete, solo ADMIN)")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        carreraService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
