package pe.utec.academic.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import pe.utec.academic.model.Carrera;
import java.util.List;
import java.util.Optional;

public interface CarreraRepository extends JpaRepository<Carrera, Integer> {

    Optional<Carrera> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<Carrera> findByActivaTrue();

    @Query("SELECT c FROM Carrera c WHERE LOWER(c.nombre) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Carrera> buscarPorNombre(@Param("q") String q);
}
