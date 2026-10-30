package com.example.demo;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final MenuService menuService;
    private final CommandeRepository commandeRepository;
    private final Sinks.Many<Commande> nouvellesCommandes =
            Sinks.many().multicast().onBackpressureBuffer();

    public OrderService(MenuService menuService, CommandeRepository commandeRepository) {
        this.menuService = menuService;
        this.commandeRepository = commandeRepository;
    }

    public Mono<Commande> create(String pizzaId) {
        return menuService.findById(pizzaId)
                .switchIfEmpty(Mono.error(new PizzaNotFoundException(pizzaId)))
                .flatMap(pizza -> commandeRepository.save(Commande.create(pizza)))
                .doOnNext(commande -> {
                    Sinks.EmitResult result = nouvellesCommandes.tryEmitNext(commande);
                    if (result.isFailure()) {
                        log.warn("Commande {} enregistrée mais non diffusée au flux SSE : {}", commande.id(), result);
                    }
                });
    }

    public Flux<Commande> findAll() {
        return commandeRepository.findAll();
    }

    public Flux<Commande> nouvellesCommandes() {
        return nouvellesCommandes.asFlux();
    }
}
