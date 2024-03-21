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
