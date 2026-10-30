package com.example.demo;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;
    private final BackpressureDemoService backpressureDemoService;

    public OrderController(OrderService orderService, BackpressureDemoService backpressureDemoService) {
        this.orderService = orderService;
        this.backpressureDemoService = backpressureDemoService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<Commande> findAll() {
        return orderService.findAll();
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<Commande>> stream() {
        return orderService.nouvellesCommandes()
                .map(commande -> ServerSentEvent.builder(commande)
                        .id(commande.id())
                        .event("order-created")
                        .build());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<Commande>> create(@RequestBody CreateOrderRequest request) {
        log.info("Demande de commande reçue pour la pizza {}", request.pizzaId());
        return orderService.create(request.pizzaId())
                .map(order -> {
                    log.info("Commande {} créée pour la pizza {}", order.id(), order.pizza().name());
                    return ResponseEntity.status(201).body(order);
                })
                .onErrorMap(PizzaNotFoundException.class,
                        error -> new ResponseStatusException(HttpStatus.NOT_FOUND, error.getMessage()));
    }

    @PostMapping(path = "/backpressure-demo", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<BackpressureReport> runBackpressureDemo() {
        return backpressureDemoService.run();
    }

    @PostMapping(path = "/backpressure-demo/fast-source", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<BackpressureReport> runFastSourceDemo() {
        return backpressureDemoService.runFastSource();
    }
}
