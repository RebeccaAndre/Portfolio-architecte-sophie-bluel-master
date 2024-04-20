// Variable globale pour stocker tous les projets
let tousLesProjets = [];

// Récupère et affiche les projets depuis l'API
async function recupererEtAfficherProjets() {
  try {
    const reponse = await fetch("http://localhost:5678/api/works");
    if (!reponse.ok) throw new Error("Échec de la récupération des projets");
    const donnees = await reponse.json();
    tousLesProjets = donnees;
    afficherProjets(donnees);
    afficherProjetsDansModale(donnees);
  } catch (erreur) {
    console.error("Erreur lors de la récupération des données : ", erreur);
  }
}

// Affiche les projets dans la galerie
function afficherProjets(projects) {
  const galerie = document.querySelector(".gallery");
  galerie.innerHTML = projects
    .map(
      (projet) => `
    <figure data-id="${projet.id}">
      <img src="${projet.imageUrl}" alt="${projet.title}">
      <figcaption>${projet.title}</figcaption>
    </figure>
  `
    )
    .join("");
}

// Gestion de la connexion/déconnexion utilisateur
function gestionConnexionUtilisateur() {
  const authToken = sessionStorage.getItem("authToken");
  const modifierButton = document.getElementById("open-modal");
  const loginLogoutButton = document.getElementById("login-logout");
  const categoryFilters = document.getElementById("category-filters");

  if (authToken) {
    categoryFilters.style.display = "none";
    modifierButton.style.display = "block";
    loginLogoutButton.textContent = "Déconnecter";
    loginLogoutButton.onclick = function () {
      sessionStorage.removeItem("authToken");
      window.location.reload();
    };
  } else {
    modifierButton.style.display = "none";
    loginLogoutButton.textContent = "Connexion";
    loginLogoutButton.onclick = function () {
      window.location.href = "login.html";
    };
  }
}

// Filtre et affiche les projets par catégorie
function filtrerProjetsParCategorie(categorie) {
  const projetsFiltres =
    categorie === "Tous"
      ? tousLesProjets
      : tousLesProjets.filter((projet) => projet.category.name === categorie);
  afficherProjets(projetsFiltres);
}

// Active le bouton de filtre et met à jour les projets affichés en fonction de la catégorie sélectionnée
function activerBoutonFiltre(button) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.classList.remove("active-filter-btn"));
  button.classList.add("active-filter-btn");
}

// Configure les écouteurs d'événements pour les boutons de filtre et filtre les projets par catégorie
function configurerBoutonsFiltre() {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      activerBoutonFiltre(button);
      const categorie = button.getAttribute("data-category");
      filtrerProjetsParCategorie(categorie);
    });
  });
}

// Initialise la fonctionnalité de la modale et gère l'ouverture et la fermeture de la modale
function configurerModale() {
  const modale = document.getElementById("modal");
  const ouvrirModaleBouton = document.getElementById("open-modal");
  const fermerBouton = document.querySelector(".close-button");

  // Ouvrir la modale en cliquant sur le bouton "Modifier"
  ouvrirModaleBouton.addEventListener(
    "click",
    () => (modale.style.display = "block")
  );

  // Fermer la modale en cliquant sur le bouton de fermeture ou en dehors de la modale (sur le fond)
  fermerBouton.addEventListener("click", () => (modale.style.display = "none"));
  modale.addEventListener("click", (evenement) => {
    if (evenement.target === modale) modale.style.display = "none";
  });
}

// Affiche les projets dans la modale et gère la suppression sans rechargement de la page
function afficherProjetsDansModale(projects) {
  let conteneurModal = document.querySelector("#modal-projects-container");
  conteneurModal.innerHTML = projects
    .map(
      (projet) => `
    <figure class="project-figure" data-id="${projet.id}">
      <img src="${projet.imageUrl}" alt="${projet.title}">
      <div class="Rectangle20">
        <i class="fa-regular fa-trash-can" data-id="${projet.id}" style="cursor: pointer;"></i>
      </div>
    </figure>
  `
    )
    .join("");

  // Ajoute des écouteurs d'événements pour la suppression de projets dans la modale
  conteneurModal.querySelectorAll(".fa-trash-can").forEach((icon) => {
    icon.addEventListener("click", function (event) {
      supprimerProjet(icon.getAttribute("data-id"), event); // Passez l'événement ici
    });
  });
}

// Supprime un projet en utilisant l'API sans recharger la page et met à jour les projets affichés dans la galerie et la modale
async function supprimerProjet(projectId, event) {
  event.preventDefault();
  event.stopPropagation();
  try {
    const reponse = await fetch(
      `http://localhost:5678/api/works/${projectId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      }
    );
    if (!reponse.ok) throw new Error("Problème avec la réponse de l'API");

    // Mettre à jour la liste des projets affichés dans la galerie et la modale après la suppression du projet
    // tousLesProjets = tousLesProjets.filter((projet) => projet.id !== projectId);
    // afficherProjets(tousLesProjets);
    // afficherProjetsDansModale(tousLesProjets);

    // Garder la modale ouverte après la suppression du projet
    const modal = document.getElementById("modal");
    modal.style.display = "block";
  } catch (erreur) {
    console.error("Erreur lors de la suppression du projet :", erreur);
  }
}

// Gère l'ajout de photos et la navigation entre les vues de la modale
function configurerNavigationModale() {
  const boutonAjoutPhoto = document.getElementById("goToAddPhoto");
  const boutonRetour = document.querySelector(
    "#modal-add-photo-view .fa-arrow-left" // Sélectionne l'icône flèche gauche dans la vue d'ajout de photo de la modale
  );

  // Affiche la vue d'ajout de photo lors du clic sur le bouton "Ajouter une photo"
  boutonAjoutPhoto.addEventListener("click", () =>
    basculerVuesModale("addPhoto")
  ); // Retourne à la vue de la galerie lors du clic sur le bouton de retour
  boutonRetour.addEventListener("click", () => basculerVuesModale("gallery"));
}

// Bascule entre les vues de la modale (galerie et ajout de photo) en fonction du paramètre de vue fourni (gallery ou addPhoto)
function basculerVuesModale(vue) {
  const vueGalerie = document.getElementById("modal-gallery-view");
  const vueAjoutPhoto = document.getElementById("modal-add-photo-view");
  vueGalerie.style.display = vue === "addPhoto" ? "none" : "flex"; // Cache la vue de la galerie si la vue d'ajout de photo est active
  vueAjoutPhoto.style.display = vue === "addPhoto" ? "block" : "none"; // Cache la vue d'ajout de photo si la vue de la galerie est active
}

// Récupère et affiche les catégories depuis l'API
async function recupererEtAfficherCategories() {
  try {
    const reponse = await fetch("http://localhost:5678/api/categories");
    if (!reponse.ok) throw new Error("Erreur API");
    const categories = await reponse.json();
    const select = document.getElementById("category");
    select.innerHTML = categories
      .map(
        (categorie) =>
          `<option value="${categorie.id}">${categorie.name}</option>` // Affiche les catégories dans le menu déroulant du formulaire d'ajout de photo
      )
      .join("");
  } catch (erreur) {
    console.error("Erreur lors de la récupération des catégories :", erreur);
  }
}

// Ajoute un projet via le formulaire
async function ajouterProjetViaFormulaire() {
  const formulaire = document.getElementById("photoAddForm");
  formulaire.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(formulaire);
    try {
      const reponse = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      if (!reponse.ok) throw new Error("Erreur lors de l'ajout du projet");

      const nouveauProjet = await reponse.json();
      tousLesProjets.push(nouveauProjet);
      afficherProjets(tousLesProjets);
      afficherProjetsDansModale(tousLesProjets);
      basculerVuesModale("gallery");
    } catch (erreur) {
      console.error("Erreur lors de l'ajout du projet :", erreur);
    }
  });
}

// Initialise la prévisualisation d'image et vérifie l'état du formulaire
function initialiserPrevisualisationImageEtVerifierFormulaire() {
  const inputFile = document.querySelector("#addPhotoForm input[type='file']");
  const previewImg = document.querySelector("#addPhotoForm img.image-preview");
  const labelAjouterPhoto = document.querySelector(
    "#addPhotoForm label.AjouterPhoto"
  );
  const iconImage = document.querySelector("#addPhotoForm .fa-image");
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");
  const submitButton = document.querySelector(
    "#photoAddForm button[type='submit']"
  );

  // Écouteur d'événement pour afficher l'image sélectionnée dans le formulaire d'ajout de photo et masquer le label et l'icône par défaut du formulaire d'ajout de photo lors de la sélection d'une image à télécharger
  inputFile.addEventListener("change", function () {
    const fichier = inputFile.files[0];
    if (fichier) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
        labelAjouterPhoto.style.display = "none"; // Cache le label
        iconImage.style.display = "none"; // Cache l'icône
        checkFormAndToggleSubmitButton(); // Vérifie l'état du formulaire après le changement
      };
      reader.readAsDataURL(fichier); // Lit le contenu du fichier en tant qu'URL de données
    } else {
      // Réinitialise l'image de prévisualisation et affiche le label et l'icône par défaut du formulaire d'ajout de photo
      previewImg.style.display = "none";
      labelAjouterPhoto.style.display = "block";
      iconImage.style.display = "block";
      checkFormAndToggleSubmitButton(); // Vérifie l'état du formulaire après le changement
    }
  });

  // Fonction pour vérifier l'état du formulaire et activer/désactiver le bouton "Valider" en fonction de l'état du formulaire
  function checkFormAndToggleSubmitButton() {
    if (
      titleInput.value.trim() &&
      inputFile.files.length > 0 &&
      categorySelect.value
    ) {
      submitButton.style.backgroundColor = "#1D6154"; // Couleur lorsque le formulaire est valide
      submitButton.disabled = false;
    } else {
      submitButton.style.backgroundColor = "#a7a7a7"; // Couleur lorsque le formulaire n'est pas valide
      submitButton.disabled = true;
    }
  }

  // Écouteurs d'événements pour vérifier l'état du formulaire à chaque changement
  titleInput.addEventListener("input", checkFormAndToggleSubmitButton);
  categorySelect.addEventListener("change", checkFormAndToggleSubmitButton);
  inputFile.addEventListener("change", checkFormAndToggleSubmitButton);

  // Appel initial à la fonction pour définir l'état initial du bouton "Valider"
  checkFormAndToggleSubmitButton();
}

document.addEventListener("DOMContentLoaded", async () => {
  await recupererEtAfficherProjets();
  configurerBoutonsFiltre();
  configurerModale();
  configurerNavigationModale();
  initialiserPrevisualisationImageEtVerifierFormulaire();
  await recupererEtAfficherCategories();
  ajouterProjetViaFormulaire();
  afficherProjetsDansModale(tousLesProjets);
  gestionConnexionUtilisateur();
});
