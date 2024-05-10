// Variable globale pour stocker tous les projets
let tousLesProjets = [];

// Récupère et affiche les projets depuis l'API à l'aide de la méthode fetch et de l'URL de l'API
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

// Affiche les projets dans la galerie en utilisant la méthode map pour générer le code HTML pour chaque projet récupéré depuis l'API et les afficher dans la galerie
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

// Filtre et affiche les projets par catégorie
function filtrerProjetsParCategorie(categorie) {
  const projetsFiltres =
    categorie === "Tous"
      ? tousLesProjets
      : tousLesProjets.filter((projet) => projet.category.name === categorie);
  afficherProjets(projetsFiltres);
}

// Active le bouton de filtre
function activerBoutonFiltre(button) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.classList.remove("active-filter-btn"));
  button.classList.add("active-filter-btn");
}

// Récupération des catégories depuis l'API et création des boutons de filtre de catégorie pour filtrer les projets par catégorie
async function creerMenuCategories() {
  try {
    const urlApiCategories = "http://localhost:5678/api/categories";
    const response = await fetch(urlApiCategories);
    const categories = await response.json();
    const menuCategories = document.querySelector("#category-filters");

    let categoriesHtml = `<button class="filter-btn active-filter-btn" data-category="Tous">Tous</button>`;
    categoriesHtml += categories
      .map(
        (categorie) =>
          `<button class="filter-btn" data-category="${categorie.name}">${categorie.name}</button>`
      )
      .join("");

    menuCategories.innerHTML = categoriesHtml;
    configurerBoutonsFiltre();
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
  }
}

//Configuration des Écouteurs d'Événements pour les Boutons de Filtre de Catégorie
function configurerBoutonsFiltre() {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      activerBoutonFiltre(button);
      filtrerProjetsParCategorie(button.getAttribute("data-category"));
    });
  });
}

// Gestion de la connexion/déconnexion utilisateur
function gestionConnexionUtilisateur() {
  const authToken = sessionStorage.getItem("authToken");
  const modifierButton = document.getElementById("open-modal");
  const loginLogoutButton = document.getElementById("login-logout");
  const categoryFilters = document.getElementById("category-filters");

  if (authToken) {
    // Si un token d'authentification est stocké dans le sessionStorage, l'utilisateur est connecté
    categoryFilters.style.display = "none";
    modifierButton.style.display = "block";
    loginLogoutButton.textContent = "Déconnecter";
    loginLogoutButton.onclick = function () {
      sessionStorage.removeItem("authToken");
      window.location.reload();
    };
  } else {
    // Si aucun token d'authentification n'est stocké dans le sessionStorage, l'utilisateur est déconnecté
    modifierButton.style.display = "none";
    loginLogoutButton.textContent = "Connexion";
    loginLogoutButton.onclick = function () {
      window.location.href = "login.html";
    };
  }
}

// Initialise la fonctionnalité de la modale et gère l'ouverture et la fermeture de la modale
function configurerModale() {
  const modale = document.getElementById("modal");
  const ouvrirModaleBouton = document.getElementById("open-modal");
  const fermerBouton = document.querySelector(".close-button");

  ouvrirModaleBouton.addEventListener(
    "click",
    () => (modale.style.display = "block")
  );
  fermerBouton.addEventListener("click", () => (modale.style.display = "none"));
  modale.addEventListener("click", (evenement) => {
    if (evenement.target === modale) modale.style.display = "none";
  });
}

// Affiche les projets dans la modale et gère la suppression sans rechargement de la page après la suppression du projet dans la galerie et la modale
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
  // Ajoute un écouteur d'événements pour chaque icône de corbeille pour supprimer un projet en cliquant sur l'icône de corbeille
  conteneurModal.querySelectorAll(".fa-trash-can").forEach((icon) => {
    icon.addEventListener("click", function (event) {
      supprimerProjet(icon.getAttribute("data-id"), event);
    });
  });
}

// Supprime un projet en fonction de l'ID du projet sans rechargement de la page après la suppression du projet dans la galerie et la modale
async function supprimerProjet(projectId, event) {
  event.stopPropagation();

  try {
    console.log("Tentative de suppression du projet avec l'ID :", projectId);

    const reponse = await fetch(
      `http://localhost:5678/api/works/${projectId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      }
    );

    if (!reponse.ok)
      throw new Error(`Erreur lors de la suppression: ${reponse.statusText}`);

    console.log(
      "Le projet avec l'ID",
      projectId,
      "a été supprimé avec succès."
    );

    // Supprime l'élément du DOM correspondant au projet supprimé de la galerie en fonction de l'ID du projet
    document.querySelector(`figure[data-id="${projectId}"]`).remove();
    // Supprime l'élément du DOM correspondant au projet supprimé de la modale en fonction de l'ID du projet
    document.querySelector(`.project-figure[data-id="${projectId}"]`).remove();

    // Mettre à jour l'array tousLesProjets après la suppression du projet
    tousLesProjets = tousLesProjets.filter((projet) => projet.id !== projectId);
  } catch (erreur) {
    console.error("Erreur lors de la suppression du projet :", erreur);
  }
}

// Gère l'ajout de photos et la navigation entre les vues de la modale
function configurerNavigationModale() {
  const boutonAjoutPhoto = document.getElementById("goToAddPhoto");
  const boutonRetour = document.querySelector(
    "#modal-add-photo-view .fa-arrow-left"
  );

  // Ajoute des écouteurs d'événements pour les boutons de navigation de la modale pour basculer entre les vues de la modale (galerie et ajout de photo)
  boutonAjoutPhoto.addEventListener("click", () =>
    basculerVuesModale("addPhoto")
  );
  boutonRetour.addEventListener("click", () => basculerVuesModale("gallery"));
}

// Bascule entre les vues de la modale (galerie et ajout de photo) en fonction du paramètre de vue fourni (gallery ou addPhoto)
function basculerVuesModale(vue) {
  const vueGalerie = document.getElementById("modal-gallery-view");
  const vueAjoutPhoto = document.getElementById("modal-add-photo-view");
  // Affiche la vue de la galerie
  vueGalerie.style.display = vue === "addPhoto" ? "none" : "flex";
  // Affiche la vue d'ajout de photo
  vueAjoutPhoto.style.display = vue === "addPhoto" ? "block" : "none";
}

// Récupère et affiche les catégories depuis l'API pour afficher les catégories dans le menu déroulant du formulaire d'ajout de photo
async function recupererEtAfficherCategories() {
  try {
    const reponse = await fetch("http://localhost:5678/api/categories");
    if (!reponse.ok) throw new Error("Erreur API");
    const categories = await reponse.json();
    const select = document.getElementById("category");

    // Création de chaîne de caractères HTML pour les options du menu déroulant à partir des catégories récupérées
    select.innerHTML = categories
      .map(
        (categorie) =>
          `<option value="${categorie.id}">${categorie.name}</option>`
      )
      .join("");
  } catch (erreur) {
    console.error("Erreur lors de la récupération des catégories :", erreur);
  }
}
// Ajoute un projet via le formulaire d'ajout de photo en envoyant les données du formulaire à l'API pour ajouter un nouveau projet
async function ajouterProjetViaFormulaire() {
  const formulaire = document.getElementById("photoAddForm");
  formulaire.addEventListener("submit", async (event) => {
    event.preventDefault();
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
      reinitialiserFormulaireAjoutImage();
    } catch (erreur) {
      console.error("Erreur lors de l'ajout du projet :", erreur);
    }
  });
}

// Fonction pour réinitialiser le formulaire d'ajout d'image
function reinitialiserFormulaireAjoutImage() {
  const formulaire = document.getElementById("photoAddForm");
  const previewImg = document.querySelector("#addPhotoForm img.image-preview");
  const labelAjouterPhoto = document.querySelector(
    "#addPhotoForm label.AjouterPhoto"
  );
  const iconImage = document.querySelector("#addPhotoForm .fa-image");

  // Réinitialise le formulaire après l'ajout
  formulaire.reset();
  previewImg.src = "#";
  previewImg.style.display = "none";
  labelAjouterPhoto.style.display = "block"; //
  iconImage.style.display = "block";
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

  // Affiche l'image sélectionnée dans le formulaire d'ajout de photo en tant que prévisualisation de l'image avant l'ajout du projet
  inputFile.addEventListener("change", function () {
    const fichier = inputFile.files[0];
    if (fichier) {
      // Vérifie si un fichier est sélectionné pour l'ajout de la photo avant de l'afficher en tant que prévisualisation de l'image dans le formulaire d'ajout de photo
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
        labelAjouterPhoto.style.display = "none";
        iconImage.style.display = "none";
        // Vérifie l'état du formulaire après la sélection de l'image pour activer/désactiver le bouton de soumission en fonction de l'état du formulaire (rempli ou non)
        checkFormAndToggleSubmitButton();
      };
      reader.readAsDataURL(fichier);
    } else {
      // Réinitialise le formulaire si aucun fichier n'est sélectionné
      previewImg.style.display = "none";
      labelAjouterPhoto.style.display = "block";
      iconImage.style.display = "block";
      checkFormAndToggleSubmitButton();
    }
  });

  // Vérifie l'état du formulaire et active/désactive le bouton de soumission en fonction de l'état du formulaire (rempli ou non)
  function checkFormAndToggleSubmitButton() {
    if (
      titleInput.value.trim() &&
      inputFile.files.length > 0 &&
      categorySelect.value
    ) {
      submitButton.style.backgroundColor = "#1D6154";
      submitButton.disabled = false;
    } else {
      submitButton.style.backgroundColor = "#a7a7a7";
      submitButton.disabled = true;
    }
  }

  // Ajoute des écouteurs d'événements pour les champs du formulaire pour vérifier l'état du formulaire après chaque modification du champ
  titleInput.addEventListener("input", checkFormAndToggleSubmitButton);
  categorySelect.addEventListener("change", checkFormAndToggleSubmitButton);
  inputFile.addEventListener("change", checkFormAndToggleSubmitButton);

  checkFormAndToggleSubmitButton();
}

// Exécute le code JavaScript après le chargement du DOM
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
  creerMenuCategories();
});
