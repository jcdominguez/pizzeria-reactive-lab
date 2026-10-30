package com.example.demo;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<Commande>> create(@RequestBody CreateOrderRequest request) {
        log.info("Demande de commande reçue pour la pizza {}", request.pizzaId());
        return orderService.create(request.pizzaId())
                .map(order -> {
                    log.info("Commande n°{} créée pour la pizza {}", order.number(), order.pizza().name());
                    return ResponseEntity.status(201).body(order);
                })
                .onErrorMap(PizzaNotFoundException.class,
                        error -> new ResponseStatusException(HttpStatus.NOT_FOUND, error.getMessage()));
    }
}
