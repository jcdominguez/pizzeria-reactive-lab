package com.example.demo;

public class PizzaNotFoundException extends RuntimeException {
    public PizzaNotFoundException(String pizzaId) {
        super("Pizza inconnue : " + pizzaId);
    }
}
