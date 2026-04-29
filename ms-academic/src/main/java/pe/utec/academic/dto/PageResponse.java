package pe.utec.academic.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> data;
    private long    total;
    private int     pagina;
    private int     limite;
    private int     paginas;
}
