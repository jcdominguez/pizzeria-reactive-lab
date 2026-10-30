package com.example.demo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

@Document("orders")
public record Commande(
        @Id
        long number,
        Pizza pizza,
        String status,
        Instant createdAt
) {
    private static final AtomicLong NEXT_NUMBER = new AtomicLong();

    public static Commande create(Pizza pizza) {
        return new Commande(NEXT_NUMBER.incrementAndGet(), pizza, "RECEIVED", Instant.now());
    }
}
