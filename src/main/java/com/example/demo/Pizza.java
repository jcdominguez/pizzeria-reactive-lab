package com.example.demo;

public record Pizza(
        String id,
        String name,
        String description,
        double price,
        String emoji
) {
}
