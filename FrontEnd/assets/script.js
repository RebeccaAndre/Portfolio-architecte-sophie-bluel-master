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

  if (authToken) { // Si un token d'authentification est stocké dans le sessionStorage, l'utilisateur est connecté
    categoryFilters.style.display = "none";
    modifierButton.style.display = "block";
    loginLogoutButton.textContent = "Déconnecter";
    loginLogoutButton.onclick = function () {
      sessionStorage.removeItem("authToken");
      window.location.reload();
    };
  } else { // Si aucun token d'authentification n'est stocké dans le sessionStorage, l'utilisateur est déconnecté
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

  ouvrirModaleBouton.addEventListener(
    "click",
    () => (modale.style.display = "block")
  );
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
  // Ajoute un écouteur d'événements pour chaque icône de corbeille pour supprimer un projet en cliquant sur l'icône de corbeille
  conteneurModal.querySelectorAll(".fa-trash-can").forEach((icon) => {
   
    icon.addEventListener("click", function (event) {
      
      supprimerProjet(icon.getAttribute("data-id"), event); 
    }); 
  });
}

// Supprime un projet sans rechargement de la page après la suppression du projet dans la galerie et la modale
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

    // Supprime l'élément du DOM correspondant au projet supprimé de la galerie
    document.querySelector(`figure[data-id="${projectId}"]`).remove();
    document.querySelector(`.project-figure[data-id="${projectId}"]`).remove();

    // Mettre à jour l'array tousLesProjets après la suppression
    tousLesProjets = tousLesProjets.filter((projet) => projet.id !== projectId);
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

  boutonAjoutPhoto.addEventListener("click", () =>
    basculerVuesModale("addPhoto")
  );
  boutonRetour.addEventListener("click", () => basculerVuesModale("gallery"));
}

// Bascule entre les vues de la modale (galerie et ajout de photo) en fonction du paramètre de vue fourni (gallery ou addPhoto)
function basculerVuesModale(vue) {
  const vueGalerie = document.getElementById("modal-gallery-view");
  const vueAjoutPhoto = document.getElementById("modal-add-photo-view");
  vueGalerie.style.display = vue === "addPhoto" ? "none" : "flex";
  vueAjoutPhoto.style.display = vue === "addPhoto" ? "block" : "none";
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
      reinitialiserFormulaireAjoutImage(); // Réinitialise le formulaire après l'ajout
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
  labelAjouterPhoto.style.display = "block";
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
      // Vérifie si un fichier est sélectionné
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
        labelAjouterPhoto.style.display = "none";
        iconImage.style.display = "none";
        checkFormAndToggleSubmitButton(); // Vérifie l'état du formulaire après le changement
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
});
