package com.example.demo;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface CommandeRepository extends ReactiveMongoRepository<Commande, String> {
}
