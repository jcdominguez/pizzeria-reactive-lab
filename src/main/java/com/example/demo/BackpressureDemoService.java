package com.example.demo;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class BackpressureDemoService {

    public Mono<List<BackpressureObservation>> run() {
        List<BackpressureObservation> trace = new CopyOnWriteArrayList<>();
        AtomicLong started = new AtomicLong(System.nanoTime());
        return Flux.range(1, 10)
                .doOnRequest(n -> trace.add(new BackpressureObservation(0, "Demande de " + n + " élément(s)", elapsed(started))))
                .concatMap(item -> {
                    trace.add(new BackpressureObservation(item, "Élément reçu", elapsed(started)));
                    return Mono.delay(Duration.ofMillis(350))
                            .doOnNext(ignored -> trace.add(new BackpressureObservation(item, "Traitement terminé", elapsed(started))))
                            .thenReturn(item);
                }, 1)
                .then(Mono.fromSupplier(() -> List.copyOf(trace)));
    }

    private long elapsed(AtomicLong started) {
        return Duration.ofNanos(System.nanoTime() - started.get()).toMillis();
    }
}
