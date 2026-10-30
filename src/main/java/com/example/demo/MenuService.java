package com.example.demo;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class MenuService {

    public Flux<Pizza> findAll() {
        return Flux.just(
                new Pizza("marguerite", "La Marguerite", "Tomate, mozzarella fondante, basilic frais", 10.5, "🍅"),
                new Pizza("reine", "La Reine du four", "Jambon, champignons, mozzarella", 12.0, "🍄"),
                new Pizza("flammekueche", "La Flammekueche", "Crème, oignons doux, fromage, lardons", 13.5, "🧅")
        );
    }
}
