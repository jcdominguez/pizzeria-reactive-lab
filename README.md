# TP fil rouge : La Pizzeria

## Parcours

- **Étape facultative — Découvrir la maquette** : consulter la version statique publiée sous le tag `etape-1-v1`. Elle ne demande que Git et un navigateur.
- **Étape 1 — Lancer la pizzeria avec Spring Boot** : point de départ obligatoire du TP. Le projet Spring Boot sert la même interface depuis son classpath.

Le projet évoluera ensuite pour que le menu provienne d'une route WebFlux. À cette étape, le menu et les commandes de démonstration restent dans le JavaScript du navigateur : aucune API métier ni base de données n'existe encore.

## Ce que contient l'étape 1

- `pom.xml` : projet Maven, Spring Boot 4.1.1, Java 25 et le starter WebFlux.
- `src/main/java/com/example/demo/DemoApplication.java` : point d'entrée qui démarre Spring Boot.
- `src/main/resources/static/index.html` : interface client et cuisine, servie par Spring Boot.
- `src/main/resources/static/styles.css` : présentation de la page.
- `src/main/resources/static/app.js` : menu de démonstration et commandes gardées en mémoire dans la page.

Spring Boot sert les ressources placées sous `src/main/resources/static` à partir du classpath ; `index.html` est la page d'accueil. Voir la [documentation officielle sur le contenu statique avec WebFlux](https://docs.spring.io/spring-boot/reference/web/reactive.html#web.reactive.webflux.static-content).

## Récupérer le point de départ

Prérequis : Git, un JDK 25 et Maven. Le dépôt est public ; un compte GitHub n'est pas nécessaire pour le cloner.

Depuis le dossier où tu conserves les projets de formation :

```bash
git clone --branch etape-1-spring-boot https://github.com/jcdominguez/pizzeria-reactive-lab.git pizzeria-lab
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

1. Avant de lancer l'application, repère `DemoApplication` et le dossier `static`.
2. Démarre l'application et ouvre l'adresse `http://localhost:8080`.
3. Repère les trois pizzas et le passe-plat vide.
4. Ajoute une pizza : une commande de démonstration apparaît dans la vue cuisine.
5. Recharge la page : les commandes disparaissent, car elles sont conservées uniquement dans la mémoire du navigateur.

## Ce que cette étape permet de comprendre

Spring Boot démarre le serveur WebFlux et rend les fichiers de la page accessibles par HTTP. Le navigateur demande le document HTML, puis ses fichiers CSS et JavaScript ; le serveur les retrouve dans le classpath et les renvoie.

La présence de WebFlux ne signifie pas encore que le menu est une API réactive. À cette étape, le serveur renvoie des fichiers statiques ; le JavaScript contient toujours les pizzas et crée localement les commandes. Les `Mono`, les `Flux` et les routes métier arrivent ensuite.

## Résultat attendu

L'application démarre sans erreur, la page est accessible à `http://localhost:8080`, et son comportement correspond à la maquette facultative : trois pizzas s'affichent, un clic ajoute une commande à la vue cuisine, et un rechargement vide à nouveau cette vue.

## Limites volontaires

- Les vues client et cuisine partagent une seule page et un seul navigateur.
- Les données de menu et les commandes vivent dans le JavaScript ; elles ne sont pas stockées dans une API ni dans MongoDB.
- Aucun compte, rôle ou appel à un service externe n'est encore configuré.
- Les polices DM Sans et Playfair Display sont chargées depuis Google Fonts ; des polices système prennent le relais hors ligne.
