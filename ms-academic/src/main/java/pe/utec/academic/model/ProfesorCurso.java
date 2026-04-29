package pe.utec.academic.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "profesor_curso",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"profesor_id", "curso_id", "semestre"},
        name = "uk_profesor_curso_semestre"
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfesorCurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // UUID del profesor en MS1 (PostgreSQL auth_db)
    // No es FK real — se valida por código llamando a MS1
    @Column(name = "profesor_id", nullable = false, length = 36)
    private String profesorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Curso curso;

    // Formato: "2025-1", "2025-2"
    @Column(nullable = false, length = 7)
    private String semestre;

    @Column(length = 5)
    private String seccion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
