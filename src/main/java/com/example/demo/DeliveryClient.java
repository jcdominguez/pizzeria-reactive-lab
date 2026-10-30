package com.example.demo;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class DeliveryClient {

    private final WebClient webClient;

    public DeliveryClient(WebClient deliveryWebClient) {
        this.webClient = deliveryWebClient;
    }

    public Mono<DeliveryEstimate> estimate(Commande commande) {
        DeliveryRequest request = new DeliveryRequest(commande.id(), commande.pizza().id());
        return webClient.post()
                .uri("/api/delivery/estimate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(DeliveryEstimate.class);
    }
}
