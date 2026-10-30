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
