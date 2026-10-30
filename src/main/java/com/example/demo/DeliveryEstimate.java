package com.example.demo;

public record DeliveryEstimate(Integer estimatedMinutes, String message) {
    public static DeliveryEstimate available(int minutes) {
        return new DeliveryEstimate(minutes, "Délai estimé");
    }

    public static DeliveryEstimate unavailable() {
        return new DeliveryEstimate(null, "Délai de livraison indisponible");
    }
}
