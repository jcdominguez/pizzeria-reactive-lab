package com.example.demo;

import java.time.Instant;

public record Commande(
        long number,
        Pizza pizza,
        String status,
        Instant createdAt
) {
}
