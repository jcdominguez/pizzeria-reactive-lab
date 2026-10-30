package com.example.demo;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/pizzas")
public class PizzaController {

    private final MenuService menuService;

    public PizzaController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<Pizza> findAll() {
        return menuService.findAll();
    }
}
