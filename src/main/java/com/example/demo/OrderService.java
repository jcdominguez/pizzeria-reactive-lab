package com.example.demo;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class OrderService {

    private final MenuService menuService;
    private final CommandeRepository commandeRepository;

    public OrderService(MenuService menuService, CommandeRepository commandeRepository) {
        this.menuService = menuService;
        this.commandeRepository = commandeRepository;
    }

    public Mono<Commande> create(String pizzaId) {
        return menuService.findById(pizzaId)
                .switchIfEmpty(Mono.error(new PizzaNotFoundException(pizzaId)))
                .flatMap(pizza -> commandeRepository.save(Commande.create(pizza)));
    }

    public reactor.core.publisher.Flux<Commande> findAll() {
        return commandeRepository.findAll();
    }
}
