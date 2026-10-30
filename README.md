# TP fil rouge : La Pizzeria

## Parcours

- **Étape facultative — Découvrir la maquette** : consulter la version statique publiée sous le tag `etape-1-v1`. Elle ne demande que Git et un navigateur.
- **Étape 1 — Lancer la pizzeria avec Spring Boot** : point de départ obligatoire du TP. Le projet Spring Boot sert la même interface depuis son classpath.
- **Étape 2 — Afficher le menu avec WebFlux** : le navigateur charge les pizzas depuis `GET /api/pizzas`, dont le contrôleur renvoie un `Flux<Pizza>`.
- **Étape 2bis — Voir les pizzas arriver progressivement** : un bouton ouvre un flux SSE qui envoie les mêmes pizzas une à une, avec une seconde d'intervalle.

Les commandes restent des démonstrations locales au navigateur. Le menu est fourni par le serveur en mémoire ; aucune base de données n'est encore utilisée.

## Ce que contient le projet à l'étape 2bis

- `pom.xml` : projet Maven, Spring Boot 4.1.1, Java 25 et le starter WebFlux.
- `src/main/java/com/example/demo/DemoApplication.java` : point d'entrée qui démarre Spring Boot.
- `src/main/resources/static/index.html` : interface client et cuisine, servie par Spring Boot.
- `src/main/resources/static/styles.css` : présentation de la page.
- `src/main/java/com/example/demo/Pizza.java` : données d'une pizza du menu.
- `src/main/java/com/example/demo/MenuService.java` : menu fixe fourni sous forme de `Flux<Pizza>`.
- `src/main/java/com/example/demo/PizzaController.java` : routes `GET /api/pizzas` et `GET /api/pizzas/stream`.
- `src/main/resources/static/index.html` : bouton qui déclenche l'expérience SSE.
- `src/main/resources/static/app.js` : chargement JSON du menu et réception SSE avec `EventSource` ; les commandes de démonstration restent gardées en mémoire dans la page.

Spring Boot sert les ressources placées sous `src/main/resources/static` à partir du classpath ; `index.html` est la page d'accueil. Voir la [documentation officielle sur le contenu statique avec WebFlux](https://docs.spring.io/spring-boot/reference/web/reactive.html#web.reactive.webflux.static-content).

## Récupérer le point de départ

Prérequis : Git, un JDK 25 et Maven. Le dépôt est public ; un compte GitHub n'est pas nécessaire pour le cloner.

Depuis le dossier où tu conserves les projets de formation :

```bash
git clone --branch etape-2bis-sse-menu https://github.com/jcdominguez/pizzeria-reactive-lab.git pizzeria-lab
```

```bash
cd pizzeria-lab
```

Crée ta branche de travail à partir de ce point de reprise :

```bash
git switch -c mon-travail
```

## Démarrer l'application

Depuis la racine du projet, lance Spring Boot avec Maven :

```bash
mvn spring-boot:run
```

Quand le serveur a démarré, ouvre <http://localhost:8080>. Pour arrêter le serveur, reviens au Terminal et appuie sur `Ctrl+C`.

## Parcours de découverte

1. Avant de lancer l'application, repère `PizzaController`, `MenuService` et le dossier `static`.
2. Démarre l'application et ouvre l'adresse `http://localhost:8080`.
3. Repère les trois pizzas chargées depuis l'API et le passe-plat vide.
4. Clique sur « Voir les pizzas arriver une par une » : le menu se vide puis chaque carte apparaît, à une seconde d'intervalle.
5. Clique sur « Ajouter à la commande » : une commande de démonstration apparaît dans la vue cuisine.
6. Recharge la page : les commandes disparaissent, car elles sont conservées uniquement dans la mémoire du navigateur.

Pour vérifier directement l'API, laisse l'application démarrée et exécute dans un second Terminal :

```bash
curl -i http://localhost:8080/api/pizzas
```

La réponse attendue est `200 OK` avec un tableau JSON contenant les trois pizzas. L'API est aussi consultable dans un navigateur à l'adresse <http://localhost:8080/api/pizzas>.

## Ce que cette étape permet de comprendre

Spring Boot démarre le serveur WebFlux et rend les fichiers de la page accessibles par HTTP. Le navigateur demande le document HTML, puis ses fichiers CSS et JavaScript ; le serveur les retrouve dans le classpath et les renvoie.

La route JSON renvoie un `Flux<Pizza>`, mais le navigateur reçoit un tableau complet avant de dessiner le menu. Le bouton SSE ouvre `EventSource` sur `GET /api/pizzas/stream` : la réponse `text/event-stream` transmet chaque pizza séparément, et le navigateur l'affiche dès sa réception. `delayElements` espace les émissions sans bloquer un thread pendant l'attente ; la seconde d'intervalle est une simulation pédagogique.

Cette expérience montre la diffusion progressive. Elle ne montre pas encore la backpressure de bout en bout : `EventSource` ne permet pas au JavaScript de demander directement un nombre d'éléments à recevoir. Le flux SSE servira plus tard à pousser les nouvelles commandes vers la cuisine.

## Résultat attendu

L'application démarre sans erreur, la page est accessible à `http://localhost:8080`, le menu initial se charge depuis `/api/pizzas`, et le bouton SSE fait apparaître les mêmes pizzas une à une. Un clic ajoute une commande à la vue cuisine ; un rechargement vide à nouveau cette vue.

## Limites volontaires

- Les vues client et cuisine partagent une seule page et un seul navigateur.
- Les pizzas sont fixes et créées en mémoire par `MenuService` ; les commandes de démonstration vivent dans le JavaScript. Rien n'est encore stocké dans MongoDB.
- Aucun compte, rôle ou appel à un service externe n'est encore configuré.
- Les polices DM Sans et Playfair Display sont chargées depuis Google Fonts ; des polices système prennent le relais hors ligne.

Documentation officielle : [méthodes de contrôleur réactives](https://docs.spring.io/spring-framework/reference/7.0/web/webflux/controller/ann-methods/responsebody.html) et [sérialisation JSON dans WebFlux](https://docs.spring.io/spring-framework/reference/7.0/web/webflux/reactive-spring.html#webflux-codecs-jackson).

Pour les flux SSE, voir aussi la [documentation WebFlux sur les réponses réactives](https://docs.spring.io/spring-framework/reference/7.0/web/webflux/controller/ann-methods/responsebody.html) et le [format Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html).
