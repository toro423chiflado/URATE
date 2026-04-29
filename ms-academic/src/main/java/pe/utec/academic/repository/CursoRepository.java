package pe.utec.academic.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import pe.utec.academic.model.Curso;
import java.util.List;
import java.util.Optional;

public interface CursoRepository extends JpaRepository<Curso, Integer> {

    Optional<Curso> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<Curso> findByCarreraIdAndActivoTrue(Integer carreraId);

    List<Curso> findByActivoTrue();

    @Query("""
        SELECT c FROM Curso c
        JOIN c.carrera ca
        WHERE c.activo = true
        AND (:carreraId IS NULL OR ca.id = :carreraId)
        AND (:q IS NULL OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
             OR LOWER(c.codigo) LIKE LOWER(CONCAT('%', :q, '%')))
        """)
    Page<Curso> buscar(
        @Param("carreraId") Integer carreraId,
        @Param("q")         String  q,
        Pageable pageable
    );

    long countByCarreraId(Integer carreraId);
}
