package pe.utec.academic.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.utec.academic.dto.CarreraDto;
import pe.utec.academic.exception.*;
import pe.utec.academic.model.Carrera;
import pe.utec.academic.repository.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CarreraService {

    private final CarreraRepository carreraRepo;
    private final CursoRepository   cursoRepo;

    public List<CarreraDto.Response> listarTodas() {
        return carreraRepo.findByActivaTrue().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public CarreraDto.Response obtenerPorId(Integer id) {
        return toResponse(buscarOFallar(id));
    }

    @Transactional
    public CarreraDto.Response crear(CarreraDto.Request req) {
        if (carreraRepo.existsByCodigo(req.getCodigo().toUpperCase()))
            throw new ConflictException("Ya existe una carrera con el código: " + req.getCodigo());

        Carrera carrera = Carrera.builder()
            .nombre(req.getNombre())
            .codigo(req.getCodigo().toUpperCase())
            .imgUrl(req.getImgUrl())
            .activa(req.getActiva() != null ? req.getActiva() : true)
            .build();

        return toResponse(carreraRepo.save(carrera));
    }

    @Transactional
    public CarreraDto.Response actualizar(Integer id, CarreraDto.Request req) {
        Carrera carrera = buscarOFallar(id);

        if (req.getNombre()  != null) carrera.setNombre(req.getNombre());
        if (req.getImgUrl()  != null) carrera.setImgUrl(req.getImgUrl());
        if (req.getActiva()  != null) carrera.setActiva(req.getActiva());

        // Cambio de código solo si no existe ya
        if (req.getCodigo() != null && !req.getCodigo().equalsIgnoreCase(carrera.getCodigo())) {
            if (carreraRepo.existsByCodigo(req.getCodigo().toUpperCase()))
                throw new ConflictException("Ya existe una carrera con ese código");
            carrera.setCodigo(req.getCodigo().toUpperCase());
        }

        return toResponse(carreraRepo.save(carrera));
    }

    // Soft delete
    @Transactional
    public void desactivar(Integer id) {
        Carrera carrera = buscarOFallar(id);
        carrera.setActiva(false);
        carreraRepo.save(carrera);
    }

    // ── Helpers ──────────────────────────────────────────────
    private Carrera buscarOFallar(Integer id) {
        return carreraRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Carrera no encontrada: " + id));
    }

    private CarreraDto.Response toResponse(Carrera c) {
        long totalCursos = cursoRepo.countByCarreraId(c.getId());
        return CarreraDto.Response.builder()
            .id(c.getId())
            .nombre(c.getNombre())
            .codigo(c.getCodigo())
            .imgUrl(c.getImgUrl())
            .activa(c.getActiva())
            .totalCursos((int) totalCursos)
            .build();
    }
}
