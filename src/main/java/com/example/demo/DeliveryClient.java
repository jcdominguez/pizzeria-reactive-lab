package com.example.demo;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class DeliveryClient {

    private final WebClient webClient;
    private final Duration timeout;

    public DeliveryClient(WebClient deliveryWebClient,
                          @Value("${delivery.service.timeout}") Duration timeout) {
        this.webClient = deliveryWebClient;
        this.timeout = timeout;
    }

    public Mono<DeliveryEstimate> estimate(Commande commande) {
        DeliveryRequest request = new DeliveryRequest(commande.id(), commande.pizza().id());
        return webClient.post()
                .uri("/api/delivery/estimate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(DeliveryEstimate.class)
                .timeout(timeout);
    }
}
