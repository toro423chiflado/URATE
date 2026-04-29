package pe.utec.academic.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;

@RestController
@Tag(name = "Sistema")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status",    "ok",
            "service",   "ms-academic",
            "version",   "1.0.0",
            "timestamp", Instant.now().toString()
        ));
    }
}
