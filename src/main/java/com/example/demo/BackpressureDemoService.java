package com.example.demo;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.BaseSubscriber;
import org.reactivestreams.Subscription;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class BackpressureDemoService {

    public Mono<List<BackpressureObservation>> run() {
        List<BackpressureObservation> trace = new CopyOnWriteArrayList<>();
        AtomicLong started = new AtomicLong(System.nanoTime());
        return Mono.create(sink -> {
            BaseSubscriber<Integer> subscriber = new BaseSubscriber<>() {
                @Override
                protected void hookOnSubscribe(Subscription subscription) {
                    trace.add(new BackpressureObservation(0, "Consommateur demande 1 élément", elapsed(started)));
                    request(1);
                }

                @Override
                protected void hookOnNext(Integer item) {
                    trace.add(new BackpressureObservation(item, "Élément reçu, traitement en cours", elapsed(started)));
                    Mono.delay(Duration.ofMillis(350)).subscribe(ignored -> {
                        trace.add(new BackpressureObservation(item, "Traitement terminé", elapsed(started)));
                        trace.add(new BackpressureObservation(0, "Consommateur demande l’élément suivant", elapsed(started)));
                        request(1);
                    }, sink::error);
                }

                @Override
                protected void hookOnComplete() {
                    sink.success(List.copyOf(trace));
                }

                @Override
                protected void hookOnError(Throwable error) {
                    sink.error(error);
                }
            };
            sink.onCancel(subscriber::cancel);
            Flux.range(1, 10).doOnRequest(n -> trace.add(
                    new BackpressureObservation(0, "Source reçoit une demande de " + n, elapsed(started))))
                    .subscribe(subscriber);
        });
    }

    public Mono<List<BackpressureObservation>> runFastSource() {
        List<BackpressureObservation> trace = new CopyOnWriteArrayList<>();
        AtomicLong started = new AtomicLong(System.nanoTime());
        AtomicInteger produced = new AtomicInteger();
        AtomicInteger processed = new AtomicInteger();
        AtomicInteger dropped = new AtomicInteger();
        return Flux.interval(Duration.ofMillis(100)).take(20)
                .doOnNext(item -> {
                    produced.incrementAndGet();
                    trace.add(new BackpressureObservation(item.intValue() + 1, "Source rapide produit un élément", elapsed(started)));
                })
                .onBackpressureDrop(item -> {
                    dropped.incrementAndGet();
                    trace.add(new BackpressureObservation(item.intValue() + 1, "ÉLÉMENT ABANDONNÉ", elapsed(started)));
                })
                .concatMap(item -> Mono.delay(Duration.ofMillis(350)).doOnNext(ignored -> {
                    processed.incrementAndGet();
                    trace.add(new BackpressureObservation(item.intValue() + 1, "Traitement terminé", elapsed(started)));
                }), 1)
                .then(Mono.fromSupplier(() -> {
                    trace.add(new BackpressureObservation(0, "BILAN : produits=" + produced.get()
                            + ", traités=" + processed.get() + ", abandonnés=" + dropped.get(), elapsed(started)));
                    return List.copyOf(trace);
                }));
    }

    private long elapsed(AtomicLong started) {
        return Duration.ofNanos(System.nanoTime() - started.get()).toMillis();
    }
}
