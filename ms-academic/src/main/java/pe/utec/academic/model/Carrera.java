package pe.utec.academic.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "carrera")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Carrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, unique = true, length = 10)
    private String codigo;

    @Column(name = "img_url", columnDefinition = "TEXT")
    private String imgUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activa = true;

    @OneToMany(mappedBy = "carrera", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Curso> cursos;
}
