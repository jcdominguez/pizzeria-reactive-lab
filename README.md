# TP fil rouge : la pizzeria

Le dépôt contient l’application de la pizzeria et un simulateur local du service de livraison. Ce sont deux applications Spring Boot indépendantes, conservées dans le même dépôt Git et démarrées séparément.

## Applications

| Dossier | Application | Port par défaut |
|---|---|---:|
| Racine du dépôt | Pizzeria, API WebFlux, MongoDB et dashboard | 8080 |
| `delivery-simulator/` | Simulateur du service HTTP de livraison | 8081 |

Le simulateur expose `POST /api/delivery/estimate` et renvoie une estimation déterministe de 25 minutes. La pizzeria l’appelle avec `WebClient`. Le navigateur n’appelle jamais directement le simulateur.

## Démarrer les applications

Prérequis : Git, Java 25, Maven et Docker Desktop.

Depuis la racine du dépôt, démarrer MongoDB :

```bash
docker compose up -d
```

Dans un premier Terminal, depuis la racine du dépôt, démarrer la pizzeria :

```bash
mvn spring-boot:run
```

Dans un second Terminal, depuis la racine du dépôt, démarrer le simulateur :

```bash
cd delivery-simulator
```

```bash
mvn spring-boot:run
```

Ouvrir <http://localhost:8080>. Une commande appelle le service de livraison sur le port `8081`, enregistre l’estimation avec la commande dans MongoDB, puis la diffuse aux pages connectées par SSE. Pour observer le repli, arrêter le simulateur avec `Ctrl+C`, puis créer une nouvelle commande. La pizzeria enregistre et diffuse quand même cette commande avec le message « Délai de livraison indisponible ».

Arrêter chaque application dans son propre Terminal avec `Ctrl+C`. MongoDB peut être arrêté depuis la racine du dépôt avec `docker compose stop`.

## Étape 6 : rush HTTP et expérience Reactor

Le dashboard présente deux expériences distinctes.

**Expérience 1, rush HTTP.** Le navigateur envoie de vrais `POST /api/orders` à une cadence choisie. Le tableau sépare les requêtes envoyées, en cours, terminées avec estimation, terminées avec repli, en erreur et reçues par SSE, avec les durées de réponse médiane, dernière et maximale. « Arrêter les envois » empêche tout nouvel envoi ; les requêtes déjà parties terminent normalement.

Sur une machine locale, le simulateur répond en quelques millisecondes : le rush ne produit alors aucun effet visible. Pour observer la charge, démarrer le simulateur avec une **capacité limitée simulée** : un seul estimateur, occupé 400 ms par estimation, soit environ 2,5 estimations par seconde. Depuis `delivery-simulator/` :

```bash
DELIVERY_PROCESSING_MS=400 mvn spring-boot:run
```

Le Terminal affiche `SIMULATION : capacité limitée`. Pizzeria abandonne un appel au-delà de 3 secondes (`DELIVERY_TIMEOUT`, `3s` par défaut) et enregistre la commande avec le message de repli. Sans la variable, le simulateur répond immédiatement.

**Expérience 2, Reactor isolé.** `POST /api/orders/backpressure-demo` et `POST /api/orders/backpressure-demo/fast-source` renvoient la trace et le bilan `produced`, `processed`, `dropped`. Ces éléments de démonstration ne sont pas des commandes : ils ne passent ni par MongoDB ni par SSE.
