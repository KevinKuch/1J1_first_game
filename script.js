

//Récupérer la balise canvas et définir son contexte de dessin en 2d
let leCanvas = document.querySelector("canvas");
let ctx = leCanvas.getContext("2d");

//Afficher l'image d'intro dans le canvas
leCanvas.style.backgroundImage = "url('images/menuIntro.png')";


//Personnage 1
let perso = {
    img: new Image(),
    //image perso :https://blog.naver.com/PostView.naver?blogId=niceboatsoss&logNo=222152746133&categoryNo=402&parentCategoryNo=&from=thumbnailList
    urlImage: "images/arretDroite.png",
    x: 0,
    y: 0,
    largeur: 140,
    hauteur: 160,
    nbVignettes: 4,
    indexVignette: 0,
    sourceX: 0,
    vitesseX: 5,
    //Propriétées ajoutées pour la gestion du saut
    estEnSaut: false,
    //Propriétées ajoutées pour la gestion accroupi
    estAccroupi: false,
    vitesseY: 0,
    gravite: 1.5
}

//Charger l'image de l'animation
perso.img.src = perso.urlImage;

//Le positionner sur l'axe des X et des Y
perso.x = 0 + perso.largeur;
perso.y = leCanvas.height * 0.50;



//Gestion des vies du perso
let vie = {
    img: new Image(),
    urlImage: "images/vie.png",
    x: 0,
    y: 0,
    largeur: 60,
    hauteur: 60
}

//Charger les vies
vie.img.src = vie.urlImage;

//Déterminer le nombre de vie: debut 3
let nombreVies = 3;

//Obejet pour gerer les touches flechees du clavier
let touches = {
    bas: false,
    gauche: false,
    droite: false,
    espace: false,
    c: false,
}

//Tableau pour stocker les monstres
let lesMonstres = [];

//Le paysage qui défilera
let paysage = {
    img: new Image(),
    //paysage pris de : https://free-game-assets.itch.io/free-horizontal-game-backgrounds
    urlImage: "images/paysage.png",
    largeur: leCanvas.width,
    vitesseX: 6,
    decalageX: 0
}

//Charger l'image du paysage
paysage.img.src = paysage.urlImage;

//Déclaration de la variable coeur de type Objet
let coeur = {
    img: new Image(),
    urlImage: "images/petiteVie.png",
    x: leCanvas.width / 2,
    y: leCanvas.height * 0.50,
    largeur: 30,
    hauteur: 30
}

//Charger l'image du coeur
coeur.img.src = coeur.urlImage;


//Variable pour gérer la fin du jeu
let finJeu = false;


//Les sons du jeu : 
let sonGagne = new Audio("sons/sonGagne.mp3");
let sonPerd = new Audio("sons/sonPerd.mp3");
let sonAmbiance = new Audio("sons/sonAmbiance.mp3");
let sonTouche = new Audio("sons/sonTouche.mp3");
let sonPrendre = new Audio("sons/sonPrendre.mp3");

//Variable pour gérer le début du jeu : debutJeu
let debutJeu = false;



////////////////////////////// DÉMARRAGE ET ÉVÉNEMENTS DU JEU ///////////////////////////////////


//Actualisation du jeu à une cadence de 60 ips
let intervalJeuID; //Sera définit plus tard

//Changer l'image du perso à une cadence de 12 ips
let intervalImagePersoID; //Sera définit plus tard

//Changer l'image du perso à une cadence de 6 ips
let intervalImageMonstreID; //Sera définit plus tard


//Mettre un premier monstre
mettreUnMonstre();


//Écouteur sur le document pour détecter si des touches de clavier sont appuyées ou relâchées
document.addEventListener("keydown", presserTouche);
document.addEventListener("keyup", relacherTouche);

//////////////  LES FONCTIONS //////////////////////

//Fonction pour actualiser l'affichage du jeu     
function actualiserLeJeu() {
    //Effacer le canvas
    ctx.clearRect(0, 0, leCanvas.width, leCanvas.height);

    //Dessiner l'image du coeur
    ctx.drawImage(coeur.img, coeur.x, coeur.y);

    //Afficher les vies
    afficherLesVies();

    //Deplacer le perso
    deplacerLePerso();

    //Deplacer les monstres
    deplacerLesMonstres();


    //S'il y a une collision entre le perso et le monstre
    //C'est la fin du jeu et le perso perd...

    for (let unMonstre of lesMonstres) {
        let siCollisionMonstreEtPerso = detecterCollision(unMonstre, perso);
        if (siCollisionMonstreEtPerso == true) {
            //On enlève du tableau 
            let index = lesMonstres.indexOf(unMonstre);
            lesMonstres.splice(index, 1);
            //Diminuer de 1 du coeur lorsqu'il est touché par un monstre
            nombreVies--;

            //Faire jouer le son lorsque le monstre touche le perso
            sonTouche.play();

        }

    }


    //Collision entre perso et coeur pour reprendre des vies
    let collisionPersoEtCoeur = detecterCollision(coeur, perso);

    if (collisionPersoEtCoeur) {
        //Modifier la position en X au hasard du coeur dans les limites du canvas
        coeur.x = Math.random() * (leCanvas.width - coeur.largeur);

        //Augmenter de 1 le nombre de coeur ramassés
        nombreVies++;

        //Jouer son de la collecte
        sonPrendre.play();
    }


}

function debuterJeu() {
    //On met l'image d'arrière-plan pour le jeu
    leCanvas.style.backgroundImage = "url('images/paysage.png')";

    //On part les setInterval du jeu
    intervalJeuID = setInterval(actualiserLeJeu, 1000 / 60);
    intervalImagePersoID = setInterval(gererImageDuPerso, 1000 / 6);
    intervalImageMonstreID = setInterval(deplacerLesMonstres, 1000 / 12);
    intervalImageMonstreID = setInterval(mettreUnMonstre, 1000 / 1);

    //On fait jouer le son d'ambiance en boucle
    sonAmbiance.loop = true;
    sonAmbiance.play();


}


//Afficher l'image de vie plusieurs fois selon la valeur de la variable nombreVies
function afficherLesVies() {
    for (let index = 0; index < nombreVies; index++) {
        vie.x = index * (vie.largeur + 20);
        // console.log(vie.x);
        ctx.drawImage(vie.img, vie.x, vie.y);
    }


}




//Function pour ajouter des monstres
function mettreUnMonstre() {
    let unMonstre = {
        img: new Image(),
        urlImage: "images/monstre.png",
        x: leCanvas.width + 73,
        y: entierHasard(150, leCanvas.height - 52 * 2),
        largeur: 73,
        hauteur: 52,
        nbVignettes: 6,
        indexVignette: 0,
        sourceX: 0,
        vitesseX: 6

    }

    //Charger l'image du monstre
    unMonstre.img.src = unMonstre.urlImage;

    //Mettre un monstre dans le tableau des monstres
    lesMonstres.push(unMonstre);


}

//////////////////// Déplacer et gérer le perso ///////////////////////////

//Fonction pour déplacer le perso
function deplacerLePerso() {

    //Calculer les futures positions du perso et définir la feuille de sprites à afficher
    if (touches.droite) {
        perso.x += perso.vitesseX;
        perso.img.src = "images/courseDroite.png";

    }
    if (touches.gauche) {
        perso.x -= perso.vitesseX;
        perso.img.src = "images/courseGauche.png";

    }

    //limite gauche et droite
    //----- Axe horizontal
    //Limite gauche
    if (perso.x < 0) {
        perso.x = 0
    }

    //Limite droite
    let xMax = leCanvas.width - perso.largeur;
    if (perso.x > xMax) {
        perso.x = xMax;
    }

    //Ajuster sa position verticale si le personnage est en train de sauter
    if (perso.estEnSaut == true) {
        perso.y += perso.vitesseY;
        //Appliquer un effet de décélération/accélération
        perso.vitesseY += perso.gravite;
        //Si le personnage est retombé...ou revient près de sa position d'origine,
        //on arrête la descente
        if (perso.y >= leCanvas.height * 0.50) {
            perso.estEnSaut = false;
        }
    }

    //Dessiner le perso
    ctx.drawImage(perso.img, perso.sourceX, 0, perso.largeur, perso.hauteur, perso.x, perso.y,
        perso.largeur, perso.hauteur);
}






//Fonction pour gérer la vignette  à afficher pour l'animation du perso
function gererImageDuPerso() {
    //Définir la coordonnée sourceX de la vignette à afficher
    perso.sourceX = perso.indexVignette * perso.largeur;

    //Incrémenter et gérer l’index de la prochaine vignette à afficher
    perso.indexVignette++;

    if (perso.indexVignette == perso.nbVignettes) {
        perso.indexVignette = 0;
    }

}

/////////////////////////////// Gestion des monstres ////////////////////////////////////


//Function pour dessiner les monstres
function deplacerLesMonstres() {
    //Les monstres se deplace vers la gauche
    for (let unMonstre of lesMonstres) {
        //Incrémenter sa vitesse sur l'axe des X
        unMonstre.x -= unMonstre.vitesseX;

        //Animer les monstres
        unMonstre.sourceX = unMonstre.indexVignette * unMonstre.largeur;
        unMonstre.indexVignette++;

        if (unMonstre.indexVignette == unMonstre.nbVignettes) {
            unMonstre.indexVignette = 0;
        }

        //Dessiner les monstres
        ctx.drawImage(unMonstre.img, unMonstre.sourceX, 0.50, unMonstre.largeur, unMonstre.hauteur, unMonstre.x,
            unMonstre.y,
            unMonstre.largeur, unMonstre.hauteur);

        if (unMonstre.x < 0) {
            let index = lesMonstres.indexOf(unMonstre);
            //Retirer les monstres du tableau
            lesMonstres.splice(index, 1)
        }




        //Gestion des vies lorsqu'il y a une collision entre perso et coeur: Perdant
        if (nombreVies == 0) {
            ctx.clearRect(0, 0, leCanvas.width, leCanvas.height);
            //On arrête l'actualisation
            //On change le fond du jeu perdant
            leCanvas.style.backgroundImage = "url('images/finJeuPerdu.png')";
            clearInterval(intervalJeuID);
            clearInterval(intervalImageMonstreID);
            clearInterval(intervalImagePersoID);

            //Mettre en pause le son ambiant
            sonAmbiance.pause();

            //son Perdant
            sonPerd.play();

            //On mémorise que le jeu est terminé
            finJeu = true;
            break;
        }

        //Gestion des vies lorsqu'il y a une collision entre perso et coeur: Gagnant
        if (nombreVies == 10) {
            ctx.clearRect(0, 0, leCanvas.width, leCanvas.height);
            //On arrête l'actualisation
            //On change le fond du jeu gagnant
            leCanvas.style.backgroundImage = "url('images/finJeuGagne.png')";
            clearInterval(intervalJeuID);
            clearInterval(intervalImageMonstreID);
            clearInterval(intervalImagePersoID);

            //Mettre en pause le son ambiant
            sonAmbiance.pause();


            //Son gagnant
            sonGagne.play();

            //On mémorise que le jeu est terminé
            finJeu = true;
            break;
        }

    }
}


//Fonction pour calculer un nombre entier au hasard entre 2 valeurs
function entierHasard(nbMin, nbMax) {
    let intervalle = nbMax - nbMin;
    return nbMin + Math.round((Math.random() * intervalle));
}


// Détecte quelles touches sont appuyées
function presserTouche(event) {

    //Empêcher le comportement par défaut du navigateur avec les touches fléchées
    event.preventDefault();

    //Enregistrer si une touche gauche/droite est pressée
    if (event.keyCode == 39 && perso.estAccroupi == false) { //flèche droite
        touches.droite = true;
        touches.gauche = false;



    }
    if (event.keyCode == 37 && perso.estAccroupi == false) { //flèche gauche
        touches.gauche = true;
        touches.droite = false;



    }

    //Faire sauter le personnage S'IL ne sautait pas
    //On empêche au perso de s'accoupir lorsqu'il saute
    if (event.keyCode == 32 && perso.estAccroupi == false) { //espace
        if (perso.estEnSaut == false) {
            perso.estEnSaut = true;
            perso.vitesseY = -30;

        }
    }


    //Enregistrer si une touche bas est pressée
    //On empêche au perso de sauter
    if (event.keyCode == 40 && perso.estEnSaut == false) {
        if (perso.estAccroupi == false) {
            perso.estAccroupi = true;
            touches.droite = false;
            touches.gauche = false;
        }
        perso.y = leCanvas.height * 0.65;
        //perso accroupit
        if (perso.img.src.includes("images/arretDroite.png") || perso.img.src.includes(
                "images/courseDroite.png")) {
            perso.img.src = "images/accroupirDroite.png";
        }

        if (perso.img.src.includes("images/arretGauche.png") || perso.img.src.includes(
                "images/courseGauche.png")) {
            perso.img.src = "images/accroupirGauche.png";
        }

    }

    //Enregistrer si une touche r est pressée, gestion fin jeu pour recommancer
    if (event.keyCode == 82 && finJeu == true) {
        document.location.reload();
    }


}

// Détecte quelles touches sont relâcheée
function relacherTouche(event) {

    //Empêcher le comportement par défaut du navigateur avec les touches fléchées
    event.preventDefault();

    //Enregistrer si une touche gauche/droite est relâchée
    if (event.keyCode == 39 && perso.estAccroupi == false) { //flèche droite
        touches.droite = false;

        perso.img.src = "images/arretDroite.png";


    }
    if (event.keyCode == 37 && perso.estAccroupi == false) { //flèche gauche
        touches.gauche = false;

        perso.img.src = "images/arretGauche.png"


    }


    //Enregistrer si une touche bas est relâchée
    //On empêche au perso de sauter
    if (event.keyCode == 40 && !perso.estEnSaut == true) {
        if (perso.estAccroupi == true) {
            perso.estAccroupi = false;

        }

        perso.img.src = "images/arretDroite.png";
        perso.y = leCanvas.height * 0.50;

    }



    //On débute le jeu s'il n'est pas commencé: touche C
    if (!debutJeu && event.keyCode == 67) {
        debuterJeu();
        debutJeu = true;
    }

}

//Fonction pour permettre au joueur de rejouer/reéssayer un click de la souris sur le canvas
function rejouerleJeu() {
    if (finJeu == true) {
        //Recherger la page HTML
        document.location.reload();
    }
}


//Fonction pour détecter si deux objets de forme rectangulaire se touchent
function detecterCollision(rectangle1, rectangle2) {
    if (rectangle1.x < rectangle2.x + rectangle2.largeur &&
        rectangle1.x + rectangle1.largeur > rectangle2.x &&
        rectangle1.y < rectangle2.y + rectangle2.hauteur &&
        rectangle1.y + rectangle1.hauteur > rectangle2.y) {
        return true;
    } else {
        return false;
    }
}