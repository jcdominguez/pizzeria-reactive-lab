# TP fil rouge : La Pizzeria

## Parcours

- **Étape facultative — Découvrir la maquette** : consulter la version statique publiée sous le tag `etape-1-v1`. Elle ne demande que Git et un navigateur.
- **Étape 1 — Lancer la pizzeria avec Spring Boot** : point de départ obligatoire du TP. Le projet Spring Boot sert la même interface depuis son classpath.
- **Étape 2 — Afficher le menu avec WebFlux** : le navigateur charge les pizzas depuis `GET /api/pizzas`, dont le contrôleur renvoie un `Flux<Pizza>`.

Les commandes restent des démonstrations locales au navigateur. Le menu est fourni par le serveur en mémoire ; aucune base de données n'est encore utilisée.

## Ce que contient le projet à l'étape 2

- `pom.xml` : projet Maven, Spring Boot 4.1.1, Java 25 et le starter WebFlux.
- `src/main/java/com/example/demo/DemoApplication.java` : point d'entrée qui démarre Spring Boot.
- `src/main/resources/static/index.html` : interface client et cuisine, servie par Spring Boot.
- `src/main/resources/static/styles.css` : présentation de la page.
- `src/main/java/com/example/demo/Pizza.java` : données d'une pizza du menu.
- `src/main/java/com/example/demo/MenuService.java` : menu fixe fourni sous forme de `Flux<Pizza>`.
- `src/main/java/com/example/demo/PizzaController.java` : route `GET /api/pizzas`.
- `src/main/resources/static/app.js` : chargement du menu avec `fetch` ; les commandes de démonstration restent gardées en mémoire dans la page.

Spring Boot sert les ressources placées sous `src/main/resources/static` à partir du classpath ; `index.html` est la page d'accueil. Voir la [documentation officielle sur le contenu statique avec WebFlux](https://docs.spring.io/spring-boot/reference/web/reactive.html#web.reactive.webflux.static-content).

## Récupérer le point de départ

Prérequis : Git, un JDK 25 et Maven. Le dépôt est public ; un compte GitHub n'est pas nécessaire pour le cloner.

Depuis le dossier où tu conserves les projets de formation :

```bash
git clone --branch etape-2-menu-webflux https://github.com/jcdominguez/pizzeria-reactive-lab.git pizzeria-lab
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
4. Ajoute une pizza : une commande de démonstration apparaît dans la vue cuisine.
5. Recharge la page : les commandes disparaissent, car elles sont conservées uniquement dans la mémoire du navigateur.

Pour vérifier directement l'API, laisse l'application démarrée et exécute dans un second Terminal :

```bash
curl -i http://localhost:8080/api/pizzas
```

La réponse attendue est `200 OK` avec un tableau JSON contenant les trois pizzas. L'API est aussi consultable dans un navigateur à l'adresse <http://localhost:8080/api/pizzas>.

## Ce que cette étape permet de comprendre

Spring Boot démarre le serveur WebFlux et rend les fichiers de la page accessibles par HTTP. Le navigateur demande le document HTML, puis ses fichiers CSS et JavaScript ; le serveur les retrouve dans le classpath et les renvoie.

Le contrôleur renvoie un `Flux<Pizza>` sans bloquer pour récupérer les valeurs. La réponse utilise `application/json` : Spring Framework rassemble les pizzas en un tableau JSON, que le navigateur reçoit avant de dessiner le menu. Cette étape montre le type réactif dans une API, pas encore une diffusion progressive des éléments. La création et la persistance des commandes arriveront ensuite.

## Résultat attendu

L'application démarre sans erreur, la page est accessible à `http://localhost:8080`, le menu est chargé depuis `/api/pizzas`, un clic ajoute une commande à la vue cuisine, et un rechargement vide à nouveau cette vue.

## Limites volontaires

- Les vues client et cuisine partagent une seule page et un seul navigateur.
- Les pizzas sont fixes et créées en mémoire par `MenuService` ; les commandes de démonstration vivent dans le JavaScript. Rien n'est encore stocké dans MongoDB.
- Aucun compte, rôle ou appel à un service externe n'est encore configuré.
- Les polices DM Sans et Playfair Display sont chargées depuis Google Fonts ; des polices système prennent le relais hors ligne.

Documentation officielle : [méthodes de contrôleur réactives](https://docs.spring.io/spring-framework/reference/7.0/web/webflux/controller/ann-methods/responsebody.html) et [sérialisation JSON dans WebFlux](https://docs.spring.io/spring-framework/reference/7.0/web/webflux/reactive-spring.html#webflux-codecs-jackson).
