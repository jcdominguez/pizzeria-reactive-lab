package com.example.demo;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    private final MenuService menuService;
    private final AtomicLong nextNumber = new AtomicLong();

    public OrderService(MenuService menuService) {
        this.menuService = menuService;
    }

    public Mono<Commande> create(String pizzaId) {
        return menuService.findById(pizzaId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Pizza inconnue : " + pizzaId)))
                .map(pizza -> new Commande(
                        nextNumber.incrementAndGet(),
                        pizza,
                        "RECEIVED",
                        Instant.now()));
    }
}
