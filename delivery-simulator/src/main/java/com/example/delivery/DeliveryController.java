package com.example.delivery;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    private static final Logger log = LoggerFactory.getLogger(DeliveryController.class);

    // SIMULATION : un seul estimateur, occupé processingMillis par estimation.
    // Une demande qui arrive pendant qu'il est occupé attend son tour, sans bloquer de thread.
    private final long processingMillis;
    private final AtomicLong nextFreeAt = new AtomicLong();

    public DeliveryController(@Value("${delivery.simulated-processing-ms}") long processingMillis) {
        this.processingMillis = processingMillis;
        if (processingMillis > 0) {
            log.warn("SIMULATION : capacité limitée à un estimateur, {} ms par estimation (environ {} estimations par seconde)",
                    processingMillis, String.format("%.1f", 1000.0 / processingMillis));
        }
    }

    @PostMapping("/estimate")
    public Mono<DeliveryEstimate> estimate(@RequestBody DeliveryRequest request) {
        DeliveryEstimate estimate = new DeliveryEstimate(25, "Délai estimé");
        if (processingMillis <= 0) {
            log.info("Estimation demandée pour la commande {} (pizza {})",
                    request.orderId(), request.pizzaId());
            return Mono.just(estimate);
        }
        long now = System.currentTimeMillis();
        long finishedAt = nextFreeAt.updateAndGet(free -> Math.max(now, free) + processingMillis);
        long waitMillis = finishedAt - now;
        log.info("SIMULATION : commande {} (pizza {}) estimée dans {} ms, dont {} ms d’attente de l’estimateur",
                request.orderId(), request.pizzaId(), waitMillis, waitMillis - processingMillis);
        return Mono.delay(Duration.ofMillis(waitMillis)).thenReturn(estimate);
    }

    public record DeliveryRequest(String orderId, String pizzaId) {
    }

    public record DeliveryEstimate(int estimatedMinutes, String message) {
    }
}
