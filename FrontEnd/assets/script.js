// I. Récupération et affichage des travaux depuis l'API pour la galerie du site web
let allProjects = [];

// // Fonction pour récupérer les projets depuis l'API et les afficher dans la galerie du site web
function fetchProjects() {
  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((data) => {
      console.log("Projects fetched successfully:", data);
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
    figure.dataset.id = project.id;
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

// // Gestion de la Sélection et Affichage des Catégories de Projets
document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    // Supprime la classe active de tous les boutons de filtre de catégorie
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active-filter-btn");
    });

    // Ajoute la classe active au bouton cliqué pour le mettre en surbrillance
    button.classList.add("active-filter-btn");

    const category = button.getAttribute("data-category");
    filterProjectsByCategory(category);
  });
});

// //Fonction pour filtrer les projets par catégorie et les afficher dans la galerie du site web
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

// Sélectionne le bouton "Tous" par défaut au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
  const allButton = document.querySelector(".filter-btn[data-category='Tous']");
  if (allButton) {
    allButton.classList.add("active-filter-btn");
  }
});

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
  categoryFilters = document.getElementById("category-filters");

  if (authToken) {
    // Utilisateur connecté
    categoryFilters.style.display = "none"; //
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
// fonction pour ouvrir la fenêtre modale lors du clic sur le bouton "Modifier" et afficher les projets dans la fenêtre modale
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const closeButton = document.querySelector(".close-button");
  goToAddPhoto = document.getElementById("goToAddPhoto");
  backToGalleryArrow = document.querySelector(
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

    // // Empecher la fermeture de la fenetre modale "Galerie Photo" lors de la suppression d'un projet (en cliquant sur l'icone poubelle)
    // document
    //   .querySelector("#modal-gallery-view")
    //   .addEventListener("click", (event) => {
    //     event.stopPropagation(); // Empêche la propagation de l'événement pour éviter la fermeture de la fenêtre modale lors de la suppression d'un projet (en cliquant sur l'icône de poubelle)
    //   });

    // // Empecher la fermeture de la fenetre modale "Ajouter une photo" lors de l'ajout d'un projet
    // document
    //   .querySelector("#modal-add-photo-view")
    //   .addEventListener("click", (event) => {
    //     event.stopPropagation();
    //   });
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
    figure.dataset.id = project.id; // Ajoute un attribut data-id avec l'ID du projet

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

    // Supprimer un projet en cliquant sur l'icône de poubelle dans la fenêtre modale (sans recharger la page) en utilisant l'API
    deleteIcon.addEventListener("click", function (event) {
      event.stopPropagation(); // Empêche la propagation de l'événement pour éviter la fermeture de la fenêtre modale lors de la suppression d'un projet (en cliquant sur l'icône de poubelle)
      deleteProject(project.id);
    });

    modalContainer.appendChild(figure);
  });
}

// // Supprimer un projet et mettre à jour l'interface utilisateur sans recharger la page. Je veux pas que la fenetre modale se ferme pendant la suppression et je veux pas que la page se recharge après la suppression d'un projet (je veux que le projet disparaisse de l'interface utilisateur sans recharger la page)

// fonction pour supprimer un projet en utilisant l'API et mettre à jour l'interface utilisateur sans recharger la page
function deleteProject(projectId) {
  fetch(`http://localhost:5678/api/works/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Problème avec la réponse de l'API");
      }
      console.log("Projet supprimé avec succès");

      // Supprime le projet du tableau allProjects et du DOM comme avant
      allProjects = allProjects.filter((project) => project.id !== projectId);
      const figureToDelete = document.querySelector(
        `figure[data-id="${projectId}"]`
      );
      if (figureToDelete) {
        figureToDelete.remove();
      }
    })

    .catch((error) =>
      console.error("Erreur lors de la suppression du projet :", error)
    );
}

// Gestion de l'ajout de photo et de la bascule entre les vues modales (Galerie et Ajouter une Photo) dans la fenêtre modale sans recharger la page
// Ajout des écouteurs d'événements pour éviter la fermeture de la fenêtre modale "Ajouter une photo" lors de l'ajout d'un projet
// document.addEventListener("DOMContentLoaded", function () {
//   const goToAddPhotoButton = document.getElementById("goToAddPhoto");
//   const backButton = document.querySelector(
//     "#modal-add-photo-view .fa-arrow-left"
//   );
//   const form = document.getElementById("photoAddForm");

//   // Ouvrir la vue "Ajouter une photo"
//   goToAddPhotoButton.addEventListener("click", function (event) {
//     event.stopPropagation(); // Empêche la fermeture inattendue de la modale
//     toggleModalViews("addPhoto");
//   });

//   // Retour à la vue galerie depuis "Ajouter une photo"
//   backButton.addEventListener("click", function (event) {
//     event.stopPropagation(); // Empêche la fermeture inattendue de la modale
//     toggleModalViews("gallery");
//   });

//   // Soumission du formulaire d'ajout de photo
//   form.addEventListener("submit", function (event) {
//     event.preventDefault(); // Empêche le rechargement de la page
//     event.stopPropagation(); // Empêche la fermeture inattendue de la modale
//   });
// });

// Fonction pour basculer Entre Vues Modales (Galerie et Ajouter une Photo) dans la fenêtre modale
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

  //Fonction pour activer le bouton "Valider"
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

  // Attache des écouteurs d'événements sur les champs pour vérifier l'état du formulaire et activer le bouton "Valider"
  if (titleInput)
    titleInput.addEventListener("input", checkFormAndToggleSubmitButton);
  if (categorySelect)
    categorySelect.addEventListener("change", checkFormAndToggleSubmitButton);
  if (photoInput)
    // Vérifie si une image a été sélectionnée
    photoInput.addEventListener("change", checkFormAndToggleSubmitButton);

  checkFormAndToggleSubmitButton();
});

////VII. Envoi des données du formulaire à l'API pour ajouter un nouveau projet
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("photoAddForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Déplacer la récupération des valeurs du formulaire ici, juste avant la requête fetch
    let photoInput = document.getElementById("file").files[0];
    let titleInput = document.getElementById("title").value;
    let categorySelect = document.getElementById("category").value;

    if (!photoInput) {
      // Vérifie si une image a été sélectionnée
      alert("Veuillez sélectionner une image");
      return;
    }

    // Créez un FormData ici pour inclure les valeurs récupérées
    let formData = new FormData();
    formData.append("image", photoInput);
    formData.append("title", titleInput);
    formData.append("category", categorySelect);

    fetch("http://localhost:5678/api/works", {
      // Envoie les données du formulaire à l'API pour ajouter un nouveau projet à la base de données
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Problème avec la réponse de l'API");
        }
        return response.json();
      })
      .then((newProject) => {
        // Ajoute le nouveau projet au tableau des projets existants
        allProjects.push(newProject);

        // Crée et ajoute le projet à la galerie
        const newGalleryItem = createGalleryItem(newProject);
        document.querySelector(".gallery").appendChild(newGalleryItem);

        // Crée et ajoute le projet à la modale
        const newModalItem = createModalItem(newProject);
        document
          .querySelector("#modal-projects-container")
          .appendChild(newModalItem);

        alert("Projet ajouté avec succès !");
      });
  });
});

// Crée un élément de galerie pour un projet
function createGalleryItem(project) {
  const figure = document.createElement("figure");
  const img = document.createElement("img");
  img.src = project.imageUrl;
  img.alt = project.title;
  const figcaption = document.createElement("figcaption");
  figcaption.textContent = project.title;
  figure.appendChild(img);
  figure.appendChild(figcaption);
  return figure;
}

// Crée un élément de la modale pour un projet
function createModalItem(project) {
  const figure = document.createElement("figure");
  figure.classList.add("project-figure");
  const img = document.createElement("img");
  img.src = project.imageUrl;
  img.alt = project.title;
  figure.appendChild(img);

  // Crée un conteneur pour l'icône de corbeille avec le fond noir et le bord arrondi
  const iconContainer = document.createElement("div");
  iconContainer.classList.add("Rectangle20");
  figure.appendChild(iconContainer);

  // Ajoute une icône de poubelle pour chaque projet
  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-regular", "fa-trash-can");
  deleteIcon.setAttribute("data-id", project.id);
  deleteIcon.style.cursor = "pointer";
  iconContainer.appendChild(deleteIcon);

  deleteIcon.addEventListener("click", function () {
    deleteProject(project.id);
  });

  return figure;
}
