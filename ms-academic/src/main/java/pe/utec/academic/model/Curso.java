package pe.utec.academic.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "curso")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Carrera carrera;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, unique = true, length = 12)
    private String codigo;

    // Color hex para la UI (#3B82F6, etc.)
    @Column(name = "color_hex", length = 7)
    @Builder.Default
    private String colorHex = "#6366F1";

    @Column(name = "img_url", columnDefinition = "TEXT")
    private String imgUrl;

    @Column(nullable = false)
    @Builder.Default
    private Integer creditos = 3;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ProfesorCurso> profesorCursos;
}
