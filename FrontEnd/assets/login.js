//  1. Récupérer les données du formulaire de connexion utilisateur (email et mot de passe) et les envoyer à l'API pour vérification.
let messageError = document.querySelector("#error-message");
console.log(messageError);

// 2. Envoyer les données du formulaire de connexion utilisateur à l'API pour vérification.
document.getElementById("login").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  console.log(email, password);

  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Combinaison utilisateur/mot de passe incorrecte.");
      }
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem("authToken", data.token);
      window.location.href = "index.html";
    })
    .catch((error) => {
      messageError.textContent = error.message;
    });
});
