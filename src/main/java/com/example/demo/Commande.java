package com.example.demo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.UUID;

@Document("orders")
public record Commande(
        @Id
        String id,
        Pizza pizza,
        String status,
        Instant createdAt,
        Integer estimatedDeliveryMinutes,
        String deliveryMessage
) {
    public static Commande create(Pizza pizza) {
        return new Commande(UUID.randomUUID().toString(), pizza, "RECEIVED", Instant.now(), null, null);
    }

    public Commande withDeliveryEstimate(DeliveryEstimate estimate) {
        return new Commande(id, pizza, status, createdAt,
                estimate.estimatedMinutes(), estimate.message());
    }
}
