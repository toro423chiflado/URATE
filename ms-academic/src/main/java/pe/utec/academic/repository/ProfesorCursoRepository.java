package pe.utec.academic.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import pe.utec.academic.model.ProfesorCurso;
import java.util.List;
import java.util.Optional;

public interface ProfesorCursoRepository extends JpaRepository<ProfesorCurso, Integer> {

    // Todos los profesores de un curso (activos)
    List<ProfesorCurso> findByCursoIdAndActivoTrue(Integer cursoId);

    // Todos los cursos de un profesor (activos)
    List<ProfesorCurso> findByProfesorIdAndActivoTrue(String profesorId);

    // Todos los cursos de un profesor en un semestre
    List<ProfesorCurso> findByProfesorIdAndSemestreAndActivoTrue(
        String profesorId, String semestre
    );

    // Verificar duplicado antes de insertar
    boolean existsByProfesorIdAndCursoIdAndSemestre(
        String profesorId, Integer cursoId, String semestre
    );

    // Buscar uno específico (para validación externa: MS4 pregunta si existe)
    Optional<ProfesorCurso> findByIdAndActivoTrue(Integer id);

    @Query("""
        SELECT pc FROM ProfesorCurso pc
        JOIN pc.curso c
        JOIN c.carrera ca
        WHERE ca.id = :carreraId
        AND pc.activo = true
        AND (:semestre IS NULL OR pc.semestre = :semestre)
        """)
    List<ProfesorCurso> findByCarreraIdAndSemestre(
        @Param("carreraId") Integer carreraId,
        @Param("semestre")  String  semestre
    );
}
