# Simulateur du service de livraison

Cette petite application WebFlux démarre un serveur HTTP indépendant sur le port `8081`. La pizzeria l'appelle avec `POST /api/delivery/estimate` pour obtenir une estimation de livraison déterministe de 25 minutes.

Depuis ce dossier, démarrer le simulateur avec `mvn spring-boot:run`. Laisser ce terminal ouvert pendant que Spring Boot démarre dans le dossier parent. Pour observer le comportement de repli, arrêter le simulateur avec `Ctrl+C`, puis créer une commande depuis le dashboard.
