package com.example.demo;

import java.util.List;

public record BackpressureReport(List<BackpressureObservation> trace, int produced, int processed, int dropped) {
}
