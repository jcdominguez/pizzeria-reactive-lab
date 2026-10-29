# TP fil rouge : La Pizzeria

Étape 1 : découvrir l’application avant de construire son API.

## Objectif

Lancer une petite interface qui présente le menu côté client et le passe-plat côté cuisine. Les commandes sont encore gardées uniquement dans la mémoire de la page. Elles disparaissent quand on recharge le navigateur : leur création par une API et leur persistance seront construites dans les étapes suivantes.

## Contenu

- `index.html` : les vues client et cuisine, réunies sur une page.
- `styles.css` : la présentation adaptative de la page.
- `app.js` : le menu de démonstration et un comportement temporaire de commande en mémoire.

## Démarrer

Pour retrouver cette version depuis GitHub, avec Git installé, exécuter les commandes suivantes depuis un dossier de travail. Le dossier `pizzeria-reactive-lab` ne doit pas déjà exister à cet endroit.

```bash
git clone --branch etape-1-v1 https://github.com/jcdominguez/pizzeria-reactive-lab.git pizzeria-reactive-lab
```

```bash
cd pizzeria-reactive-lab
```

Le clone du tag affiche un message « detached HEAD » : il désigne la version figée. Créer une branche personnelle pour travailler dessus :

```bash
git switch -c travail-etape-1
```

Ouvrir `index.html` dans un navigateur récent. Aucun serveur, compte ou logiciel supplémentaire n’est nécessaire.

Le tag `etape-1-v1` conserve la version de référence de cette étape ; il ne doit pas être déplacé. La branche `etape-1-decouverte` donne aussi accès à cette étape, tandis que `main` accueillera la suite du TP. Un correctif de référence recevra un nouveau tag.

## Parcours de découverte

1. Repérer le menu et les prix.
2. Cliquer sur « Ajouter à la commande » pour envoyer une pizza au passe-plat.
3. Constater que la cuisine voit la commande apparaître avec son numéro et son état « Reçue ».
4. Recharger la page et constater que les commandes ont disparu.

## Résultat attendu

Au premier affichage, trois pizzas sont visibles, le compteur indique `0 commande` et le passe-plat affiche « Le calme avant le rush ». Après un clic sur une pizza, le compteur passe à `1 commande` et une carte de commande apparaît côté cuisine.

## Limites volontaires de cette étape

- Les vues client et cuisine sont réunies sur la même page pour faciliter la découverte.
- Le menu et les commandes sont définis dans le navigateur, pas dans une API ni dans MongoDB.
- Le bouton ajoute directement une commande de démonstration ; aucune authentification n’est encore nécessaire.
- Le chargement des polices depuis Google Fonts requiert une connexion Internet ; les polices système assurent une présentation de repli.

À l’étape suivante, le menu sera fourni par une route WebFlux au lieu d’être inscrit dans la page.
