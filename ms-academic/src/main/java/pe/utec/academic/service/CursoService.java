package pe.utec.academic.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.utec.academic.dto.*;
import pe.utec.academic.exception.*;
import pe.utec.academic.model.*;
import pe.utec.academic.repository.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CursoService {

    private final CursoRepository   cursoRepo;
    private final CarreraRepository  carreraRepo;

    public PageResponse<CursoDto.Response> listar(
            Integer carreraId, String q, int pagina, int limite) {

        Pageable pageable = PageRequest.of(pagina - 1, limite, Sort.by("nombre"));
        Page<Curso> page  = cursoRepo.buscar(carreraId, q, pageable);

        return PageResponse.<CursoDto.Response>builder()
            .data(page.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
            .total(page.getTotalElements())
            .pagina(pagina)
            .limite(limite)
            .paginas(page.getTotalPages())
            .build();
    }

    public List<CursoDto.Response> listarPorCarrera(Integer carreraId) {
        if (!carreraRepo.existsById(carreraId))
            throw new ResourceNotFoundException("Carrera no encontrada: " + carreraId);
        return cursoRepo.findByCarreraIdAndActivoTrue(carreraId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public CursoDto.Response obtenerPorId(Integer id) {
        return toResponse(buscarOFallar(id));
    }

    @Transactional
    public CursoDto.Response crear(CursoDto.Request req) {
        Carrera carrera = carreraRepo.findById(req.getCarreraId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Carrera no encontrada: " + req.getCarreraId()));

        if (cursoRepo.existsByCodigo(req.getCodigo().toUpperCase()))
            throw new ConflictException("Ya existe un curso con el código: " + req.getCodigo());

        Curso curso = Curso.builder()
            .carrera(carrera)
            .nombre(req.getNombre())
            .codigo(req.getCodigo().toUpperCase())
            .colorHex(req.getColorHex() != null ? req.getColorHex() : "#6366F1")
            .imgUrl(req.getImgUrl())
            .creditos(req.getCreditos() != null ? req.getCreditos() : 3)
            .build();

        return toResponse(cursoRepo.save(curso));
    }

    @Transactional
    public CursoDto.Response actualizar(Integer id, CursoDto.Request req) {
        Curso curso = buscarOFallar(id);

        if (req.getNombre()   != null) curso.setNombre(req.getNombre());
        if (req.getColorHex() != null) curso.setColorHex(req.getColorHex());
        if (req.getImgUrl()   != null) curso.setImgUrl(req.getImgUrl());
        if (req.getCreditos() != null) curso.setCreditos(req.getCreditos());

        if (req.getCarreraId() != null) {
            Carrera carrera = carreraRepo.findById(req.getCarreraId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Carrera no encontrada: " + req.getCarreraId()));
            curso.setCarrera(carrera);
        }

        return toResponse(cursoRepo.save(curso));
    }

    @Transactional
    public void desactivar(Integer id) {
        Curso curso = buscarOFallar(id);
        curso.setActivo(false);
        cursoRepo.save(curso);
    }

    // ── Helpers ──────────────────────────────────────────────
    Curso buscarOFallar(Integer id) {
        return cursoRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado: " + id));
    }

    CursoDto.Response toResponse(Curso c) {
        return CursoDto.Response.builder()
            .id(c.getId())
            .carreraId(c.getCarrera().getId())
            .carreraNombre(c.getCarrera().getNombre())
            .nombre(c.getNombre())
            .codigo(c.getCodigo())
            .colorHex(c.getColorHex())
            .imgUrl(c.getImgUrl())
            .creditos(c.getCreditos())
            .activo(c.getActivo())
            .build();
    }
}
