package com.example.delivery;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    private static final Logger log = LoggerFactory.getLogger(DeliveryController.class);

    @PostMapping("/estimate")
    public Mono<DeliveryEstimate> estimate(@RequestBody DeliveryRequest request) {
        log.info("Estimation demandée pour la commande {} (pizza {})",
                request.orderId(), request.pizzaId());
        return Mono.just(new DeliveryEstimate(25, "Délai estimé"));
    }

    public record DeliveryRequest(String orderId, String pizzaId) {
    }

    public record DeliveryEstimate(int estimatedMinutes, String message) {
    }
}
