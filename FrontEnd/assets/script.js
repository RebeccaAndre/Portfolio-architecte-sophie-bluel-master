// I. Récupération et affichage des travaux depuis l'API pour la galerie du site web
let allProjects = [];

// // Fonction pour récupérer les projets depuis l'API et les afficher dans la galerie du site web
function fetchProjects() {
  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((data) => {
      allProjects = data;
      displayProjects(data);
    })
    .catch((error) => console.error("Error fetching data: ", error));
}

// // Fonction pour afficher les projets dans la galerie du site web
function displayProjects(projects) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  projects.forEach((project) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = project.imageUrl;
    img.alt = project.title;
    const figcaption = document.createElement("figcaption");
    figcaption.textContent = project.title;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

// //Fonction pour filtrer les projets par catégorie et les afficher
function filterProjectsByCategory(category) {
  if (category === "Tous") {
    displayProjects(allProjects);
  } else {
    // Filtre les projets par catégorie
    let filteredProjects = allProjects.filter(
      (project) => project.category.name === category
    );
    displayProjects(filteredProjects);
  }
}

// // II. Gestion des interactions utilisateur avec les boutons de filtre et la fenêtre modale

// // Attache les écouteurs d'événements après le chargement complet du DOM
document.addEventListener("DOMContentLoaded", function () {
  fetchProjects();

  // Attache les écouteurs d'événements pour les boutons de filtre de catégorie
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.getAttribute("data-category");
      filterProjectsByCategory(category);
    });
  });
});

// // III.Implémentation de la fonctionnalité déconnexion et connexion utilisateur
document.addEventListener("DOMContentLoaded", function () {
  const authToken = sessionStorage.getItem("authToken");
  const modifierButton = document.getElementById("open-modal");
  const loginLogoutButton = document.getElementById("login-logout");

  if (authToken) {
    // Utilisateur connecté
    modifierButton.style.display = "block";
    loginLogoutButton.textContent = "Déconnecter";
    loginLogoutButton.onclick = function () {
      sessionStorage.removeItem("authToken");
      window.location.reload();
    };
  } else {
    // Utilisateur non connecté
    modifierButton.style.display = "none";
    loginLogoutButton.textContent = "Connexion";
    loginLogoutButton.onclick = function () {
      window.location.href = "login.html";
    };
  }
});

// // IV. Gestion de l'apparition et disparition de la fenêtre modale
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const closeButton = document.querySelector(".close-button");
  const goToAddPhoto = document.getElementById("goToAddPhoto");
  const backToGalleryArrow = document.querySelector(
    "#modal-add-photo-view .fa-arrow-left"
  );

  const openModalButton = document.getElementById("open-modal");

  // Ouvrir la modale
  if (openModalButton) {
    openModalButton.addEventListener("click", () => {
      console.log("Ouverture de la modale");
      modal.style.display = "block";
    });
  } else {
    console.log("Erreur: Bouton ouvrir modale non trouvé.");
  }

  // Fermer la modale
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      console.log("Fermeture de la modale via le bouton de fermeture");
      modal.style.display = "none";
    });

    // Fermer la modale en cliquant en dehors
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        console.log("Fermeture de la modale en cliquant à l'extérieur");
        modal.style.display = "none";
      }
    });
  }
});

// Gestionnaire d'événements pour l'ouverture de la modale
document.addEventListener("DOMContentLoaded", () => {
  const openModalButton = document.getElementById("open-modal");
  const modal = document.getElementById("modal");

  openModalButton.addEventListener("click", () => {
    modal.style.display = "block";
    displayProjectsInModal(allProjects);
  });
});

// // V.Affichage des 11 projets dans la fenêtre modale sans les titres et avec les "poubelles" sur chaque image

// Fonction pour afficher les projets dans la fenêtre modale, qui inclut les icônes de poubelle
function displayProjectsInModal(projects) {
  let modalContainer = document.querySelector("#modal-projects-container");
  modalContainer.innerHTML = "";

  projects.forEach((project) => {
    let figure = document.createElement("figure");
    figure.classList.add("project-figure");

    let img = document.createElement("img");
    img.src = project.imageUrl;
    img.alt = project.title;
    figure.appendChild(img);

    // Crée un conteneur pour l'icône de corbeille avec le fond noir et le bord arrondi
    let iconContainer = document.createElement("div");
    iconContainer.classList.add("Rectangle20");
    figure.appendChild(iconContainer);

    // Ajoute une icône de poubelle pour chaque projet
    let deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-regular", "fa-trash-can");
    deleteIcon.setAttribute("data-id", project.id);
    deleteIcon.style.cursor = "pointer";
    iconContainer.appendChild(deleteIcon);

    deleteIcon.addEventListener("click", function () {
      console.log(`Demande de suppression pour le projet ${project.id}`);
      deleteProject(project.id);
    });

    modalContainer.appendChild(figure);
  });
}

// Supprimer une image de la modale
function deleteProject(projectId) {
  // Supprime le projet du tableau allProjects
  allProjects = allProjects.filter((project) => project.id !== projectId);

  // Supprime le projet de la galerie
  const galleryItem = document.querySelector(
    `.gallery figure img[src="http://localhost:5678/api/works/${projectId}/image"]`
  );
  if (galleryItem) {
    galleryItem.parentElement.remove();
  }

  // Rafraîchit l'affichage des projets dans la modale
  displayProjectsInModal(allProjects);

  // Supprime le projet de la base de données
  fetch(`http://localhost:5678/api/works/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  });
}

// Basculer Entre Vues Modales
function toggleModalViews(viewToShow) {
  const galleryView = document.getElementById("modal-gallery-view");
  const addPhotoView = document.getElementById("modal-add-photo-view");

  // Afficher la vue demandée et masquer l'autre
  if (viewToShow === "addPhoto") {
    galleryView.style.display = "none";
    addPhotoView.style.display = "block";
  } else {
    galleryView.style.display = "flex";
    addPhotoView.style.display = "none";
  }
}

// Ajouter un gestionnaire d'événements pour le bouton "Ajouter une photo"
document.querySelector("#goToAddPhoto").addEventListener("click", function () {
  toggleModalViews("addPhoto");
});

// Ajouter un gestionnaire d'événements pour le bouton de retour à la galerie
document
  .querySelector("#modal-add-photo-view .fa-arrow-left")
  .addEventListener("click", function () {
    toggleModalViews("gallery");
  });

// // VI. Gestion de la Prévisualisation d'Image et des Catégories

// Initialisation de la prévisualisation d'image
document.addEventListener("DOMContentLoaded", function () {
  let previewImg = document.querySelector("#addPhotoForm img.image-preview");
  let inputFile = document.querySelector("#addPhotoForm input[type='file']");
  let labelFile = document.querySelector("#addPhotoForm label.AjouterPhoto");
  let iconFile = document.querySelector("#addPhotoForm .fa-image");
  let pFile = document.querySelector("#addPhotoForm .max-file-size");

  // Ecouter les changements sur l'input file pour afficher l'image sélectionnée dans la balise img de la prévisualisation d'image
  inputFile.addEventListener("change", function () {
    let file = inputFile.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = function (e) {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
        labelFile.style.display = "none";
        iconFile.style.display = "none";
        pFile.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });
});

// Récupération des catégories depuis une API pour les afficher dans le formulaire d'ajout de photo
async function getCategorys() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
      throw new Error(`Erreur API : ${response.statusText}`);
    }
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
  }
}

// Affichage des catégories dans le menu déroulant du formulaire d'ajout de photo
async function displayCategoryModal() {
  try {
    const select = document.getElementById("category");
    const categories = await getCategorys();
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur lors de l'affichage des catégories :", error);
  }
}

// Cette fonction est appelée une fois que le DOM est complètement chargé
document.addEventListener("DOMContentLoaded", function () {
  displayCategoryModal();
});

// Fonction pour activer le bouton "Valider" et changer sa couleur en #1D6154 lorsque tous les champs sont remplis
document.addEventListener("DOMContentLoaded", function () {
  let titleInput = document.getElementById("title");
  let categorySelect = document.getElementById("category");
  let photoInput = document.getElementById("file");
  let submitButton = document.querySelector(".valider");

  function checkFormAndToggleSubmitButton() {
    // Vérifie si tous les champs sont remplis pour activer le bouton "Valider"
    if (titleInput.value && photoInput.files.length && categorySelect.value) {
      submitButton.style.backgroundColor = "#1D6154";
      submitButton.disabled = false;
    } else {
      // Désactive le bouton "Valider" si un champ est vide
      submitButton.style.backgroundColor = "#a7a7a7";
      submitButton.disabled = true;
    }
  }

  // Attache des écouteurs d'événements sur les champs pour vérifier l'état du formulaire
  if (titleInput)
    titleInput.addEventListener("input", checkFormAndToggleSubmitButton);
  if (categorySelect)
    categorySelect.addEventListener("change", checkFormAndToggleSubmitButton);
  if (photoInput)
    photoInput.addEventListener("change", checkFormAndToggleSubmitButton);

  checkFormAndToggleSubmitButton();
});
