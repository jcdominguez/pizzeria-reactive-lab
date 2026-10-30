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
        Instant createdAt
) {
    public static Commande create(Pizza pizza) {
        return new Commande(UUID.randomUUID().toString(), pizza, "RECEIVED", Instant.now());
    }
}
