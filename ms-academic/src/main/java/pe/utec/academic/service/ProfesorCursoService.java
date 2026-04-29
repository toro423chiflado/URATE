package pe.utec.academic.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.utec.academic.client.UserServiceClient;
import pe.utec.academic.dto.*;
import pe.utec.academic.exception.*;
import pe.utec.academic.model.*;
import pe.utec.academic.repository.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ProfesorCursoService {

    private final ProfesorCursoRepository profesorCursoRepo;
    private final CursoRepository         cursoRepo;
    private final UserServiceClient        userClient;

    /**
     * Lista todos los profesores de un curso específico.
     * Enriquece con datos del profesor desde MS1.
     */
    public List<ProfesorCursoDto.Response> listarPorCurso(Integer cursoId, String bearerToken) {
        if (!cursoRepo.existsById(cursoId))
            throw new ResourceNotFoundException("Curso no encontrado: " + cursoId);

        return profesorCursoRepo.findByCursoIdAndActivoTrue(cursoId).stream()
            .map(pc -> toResponse(pc, bearerToken))
            .collect(Collectors.toList());
    }

    /**
     * Lista todos los cursos asignados a un profesor.
     * Usado por MS4 para construir el perfil del profesor.
     */
    public List<ProfesorCursoDto.Response> listarPorProfesor(
            String profesorId, String bearerToken) {
        return profesorCursoRepo.findByProfesorIdAndActivoTrue(profesorId).stream()
            .map(pc -> toResponse(pc, bearerToken))
            .collect(Collectors.toList());
    }

    /**
     * Obtiene un ProfesorCurso por ID.
     * MS4 lo usa para validar que la relación existe antes de registrar una calificación.
     */
    public ProfesorCursoDto.Response obtenerPorId(Integer id, String bearerToken) {
        ProfesorCurso pc = profesorCursoRepo.findByIdAndActivoTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "ProfesorCurso no encontrado: " + id));
        return toResponse(pc, bearerToken);
    }

    /**
     * Verifica si un ProfesorCurso existe y está activo.
     * Endpoint público para que MS4 valide sin necesidad de datos completos.
     */
    public boolean existeYActivo(Integer id) {
        return profesorCursoRepo.findByIdAndActivoTrue(id).isPresent();
    }

    /**
     * Asigna un profesor a un curso en un semestre.
     * SOLO ADMIN puede hacerlo.
     * Valida en MS1 que el usuario existe y tiene rol PROFESOR.
     */
    @Transactional
    public ProfesorCursoDto.Response asignar(
            ProfesorCursoDto.Request req, String bearerToken) {

        // ── 1. Validar curso existe ──────────────────────────────
        Curso curso = cursoRepo.findById(req.getCursoId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Curso no encontrado: " + req.getCursoId()));

        // ── 2. Validar unicidad ──────────────────────────────────
        if (profesorCursoRepo.existsByProfesorIdAndCursoIdAndSemestre(
                req.getProfesorId(), req.getCursoId(), req.getSemestre())) {
            throw new ConflictException(
                "Este profesor ya está asignado a ese curso en el semestre " + req.getSemestre());
        }

        // ── 3. Validar en MS1 que el usuario es PROFESOR ─────────
        boolean esValido = userClient.esProfesorValido(req.getProfesorId(), bearerToken);
        if (!esValido) {
            throw new ForbiddenException(
                "El usuario " + req.getProfesorId() +
                " no existe en MS1 o no tiene rol PROFESOR");
        }

        // ── 4. Crear la asignación ───────────────────────────────
        ProfesorCurso pc = ProfesorCurso.builder()
            .profesorId(req.getProfesorId())
            .curso(curso)
            .semestre(req.getSemestre())
            .seccion(req.getSeccion())
            .build();

        ProfesorCurso guardado = profesorCursoRepo.save(pc);
        log.info("ProfesorCurso creado: id={}, profesor={}, curso={}, semestre={}",
            guardado.getId(), guardado.getProfesorId(),
            curso.getCodigo(), guardado.getSemestre());

        return toResponse(guardado, bearerToken);
    }

    @Transactional
    public void desactivar(Integer id) {
        ProfesorCurso pc = profesorCursoRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Asignación no encontrada: " + id));
        pc.setActivo(false);
        profesorCursoRepo.save(pc);
    }

    // ── Mapeo a DTO ──────────────────────────────────────────
    private ProfesorCursoDto.Response toResponse(ProfesorCurso pc, String bearerToken) {
        Curso curso = pc.getCurso();

        // Intentar enriquecer con datos del profesor desde MS1
        var profesorOpt = userClient.obtenerUsuario(pc.getProfesorId(), bearerToken);

        return ProfesorCursoDto.Response.builder()
            .id(pc.getId())
            .profesorId(pc.getProfesorId())
            .profesorNombre(  profesorOpt.map(UsuarioMs1Dto::getNombre).orElse("—"))
            .profesorApellido(profesorOpt.map(UsuarioMs1Dto::getApellido).orElse("—"))
            .profesorFoto(    profesorOpt.map(UsuarioMs1Dto::getFoto).orElse(null))
            .cursoId(curso.getId())
            .cursoNombre(curso.getNombre())
            .cursoCodigo(curso.getCodigo())
            .cursoColorHex(curso.getColorHex())
            .carreraNombre(curso.getCarrera().getNombre())
            .semestre(pc.getSemestre())
            .seccion(pc.getSeccion())
            .activo(pc.getActivo())
            .build();
    }
}
