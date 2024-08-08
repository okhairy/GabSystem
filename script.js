// Données des utilisateurs
const utilisateurs = [
    { id: 123456, firstName: "Ousmane", lastName: "Fall", password: "00000", balance: 100000, attempts: 3 , bloque: false},
    { id: 234567, firstName: "Ahmadou Bamba", lastName: "Diop", password: "11111", balance: 200000, attempts: 3 , bloque: false},
    { id: 345678, firstName: "Oumou Khairy", lastName: "Ndiaye", password: "22222", balance: 300000, attempts: 3, bloque: false },
    { id: 456789, firstName: "Bamba Mbacké", lastName: "Thiam", password: "33333", balance: 400000, attempts: 3, bloque: false },
    { id: 567890, firstName: "Ousmane Eldiey", lastName: "Sow", password: "44444", balance: 500000, attempts: 3, bloque: false },
    { id: 678901, firstName: "Leo", lastName: "Moumba", password: "44444", balance: 500000, attempts: 3, bloque: false }

];
// Enregistrer le tableau d'utilisateurs dans le localStorage
localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));

// Récupérer les utilisateurs depuis le localStorage
const usersString = localStorage.getItem('users');

// Convertir la chaîne de caractères JSON en objet JavaScript
const users = JSON.parse(usersString);

// Afficher les utilisateurs
console.log(users);
// Récupération de l'utilisateur actuellement connecté depuis le stockage local
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Initialisation du numéro de reçu, récupéré depuis le stockage local ou initialisé à 1
let receiptNumber = parseInt(localStorage.getItem('receiptNumber')) || 1;

// Initialisation du minuteur d'inactivité
let inactivityTimer;

// Réinitialisation du minuteur d'inactivité
function resetInactivityTimer() {
    clearTimeout(inactivityTimer); // Efface le minuteur actuel
    inactivityTimer = setTimeout(() => {
        logout(); // Déconnecte l'utilisateur après 30 secondes d'inactivité
    }, 30000); // 30000 millisecondes = 30 secondes
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem('currentUser'); // Supprime l'utilisateur courant du stockage local
    window.location.href = 'index.html'; // Redirige vers la page de connexion
}

// Ajout d'écouteurs pour détecter les actions de l'utilisateur
document.addEventListener('mousemove', resetInactivityTimer); // Réinitialise le minuteur sur mouvement de la souris
document.addEventListener('keypress', resetInactivityTimer); // Réinitialise le minuteur sur pression d'une touche

// Fonction pour afficher un modal avec un message
function showModal(message) {
    const modal = document.getElementById('messageModal'); // Sélectionne le modal
    const modalMessage = document.getElementById('modalMessage'); // Sélectionne l'élément pour le message
    modalMessage.textContent = message; // Définit le message du modal
    modal.style.display = 'block'; // Affiche le modal
}

// Fonction de gestion du formulaire de connexion
function handleLoginForm(e) {
    e.preventDefault(); // Empêche l'envoi par défaut du formulaire

    const cardId = parseInt(document.getElementById('cardId').value); // Récupère l'ID de la carte
    const password = document.getElementById('password').value; // Récupère le mot de passe

    // Recherche de l'utilisateur correspondant à l'ID de la carte
    const user = users.find(user => user.id === cardId);

    if (user) {
        if (user.password === password) {
            if (user.bloque == true){
                showModal('Votre compte est bloqué. Veuillez vous rapprocher au service client');
            } else{
                currentUser = user; // Stocke l'utilisateur courant
                user.attempts = 3; // Réinitialise les tentatives
                localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Stocke l'utilisateur dans le localStorage
                window.location.href = 'welcome.html'; // Redirige vers la page d'accueil
            }
            
        }else  {
            user.attempts--; // Décrémente les tentatives restantes
            if (user.attempts > 0) {
                showModal(`Mot de passe incorrect. Tentatives restantes: ${user.attempts}`);
            } else {
                showModal('Votre compte est bloqué.');
                user.bloque = true
                localStorage.setItem('users', JSON.stringify(users));
            }
        }
    } else {
        showModal('Numéro de carte invalide. Veuillez réessayer.');
    }
}

// Fonction de gestion des options de retrait
function handleWithdraw(amount) {
    if (amount > currentUser.balance) {
        showModal('Montant insuffisant pour effectuer le retrait.'); // Vérifie le solde suffisant
        return;
    }

    currentUser.balance -= amount; // Déduit le montant du solde de l'utilisateur
    localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Met à jour le localStorage
    showModal(`Vous avez effectué un retrait de ${amount} francs. Nouveau solde : ${currentUser.balance} francs.`);

    const receipt = {
        receiptNumber: receiptNumber++, // Incrémente le numéro de reçu
        cardId: currentUser.id,
        amount: amount,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    localStorage.setItem('receiptNumber', receiptNumber); // Sauvegarde le numéro de reçu
    generatePDF(receipt); // Génère le PDF du reçu

    // Redirection après un délai pour permettre à l'utilisateur de voir le message
    setTimeout(() => {
        window.location.href = 'welcome.html'; // Redirige vers la page d'accueil
    }, 7000); // Délai de 2 secondes avant redirection
}

// Fonction pour générer un PDF pour le reçu
function generatePDF(receipt) {
    const { jsPDF } = window.jspdf; // Importation de la bibliothèque jsPDF
    const doc = new jsPDF();

    // Création du contenu du PDF
    doc.text(`Reçu de retrait`, 20, 20);
    doc.text(`N° reçu : GCash_${receipt.receiptNumber}`, 20, 30);
    doc.text(`N° card ID : ${receipt.cardId}`, 20, 40);
    doc.text(`Montant retiré : ${receipt.amount} francs`, 20, 50);
    doc.text(`Date : ${receipt.date}`, 20, 60);
    doc.text(`Heure : ${receipt.time}`, 20, 70);

    // Affichage d'un bouton pour télécharger le PDF
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Télécharger le reçu';
    downloadButton.addEventListener('click', function() {
        doc.save(`recu_${receipt.receiptNumber}.pdf`); // Téléchargement du PDF
    });

    // Ajout du bouton au modal
    document.getElementById('modalMessage').appendChild(downloadButton);
}

// Ajout d'écouteurs d'événements après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Sélection du modal et de son message
    const modal = document.getElementById('messageModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeModal = document.getElementsByClassName('close')[0];

    // Fonction de fermeture du modal
    closeModal.onclick = function() {
        modal.style.display = 'none';
    };

    // Vérification si on est sur la page de connexion
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', handleLoginForm);
    } else if (document.getElementById('welcomeMessage')) {
        // Vérification si on est sur la page d'accueil
        if (!currentUser) {
            window.location.href = 'index.html'; // Redirige vers la page de connexion si aucun utilisateur n'est connecté
            return;
        }

        // Affichage du message de bienvenue
        document.getElementById('welcomeMessage').textContent = `Bienvenue ${currentUser.firstName} ${currentUser.lastName}`;

        // Ajout d'écouteurs d'événements pour les boutons de la page d'accueil
        document.getElementById('checkBalanceButton').addEventListener('click', function() {
            showModal(`Votre solde est de : ${currentUser.balance} francs`);
        });

        document.getElementById('withdrawButton').addEventListener('click', function() {
            window.location.href = 'withdraw.html'; // Redirige vers la page de retrait
        });

        document.getElementById('logoutButton').addEventListener('click', function() {
            logout(); // Déconnexion de l'utilisateur
        });

        // Réinitialisation du minuteur d'inactivité pour la page d'accueil
        resetInactivityTimer();
    } else if (document.querySelector('.withdrawOption')) {
        // Vérification si on est sur la page de retrait
        if (!currentUser) {
            window.location.href = 'index.html'; // Redirige vers la page de connexion si aucun utilisateur n'est connecté
            return;
        }

        // Ajout d'écouteurs d'événements pour les options de retrait par défaut
        document.querySelectorAll('.withdrawOption').forEach(button => {
            button.addEventListener('click', function() {
                handleWithdraw(parseInt(button.dataset.amount)); // Gestion du retrait pour le montant sélectionné
            });
        });

        // Ajout d'un écouteur d'événement pour le bouton de retrait personnalisé
        document.getElementById('withdrawButton').addEventListener('click', function() {
            const amount = parseInt(document.getElementById('customAmount').value); // Récupération du montant personnalisé
            if (isNaN(amount) || amount < 1000 || amount % 1000 !== 0 || amount != flo) {
                showModal('Le montant doit être un multiple de 1000 et supérieur ou égal à 1000.');
            } else {
                handleWithdraw(amount); // Gestion du retrait pour le montant personnalisé


            }
        });

        // Ajout d'un écouteur d'événement pour le bouton de déconnexion
        document.getElementById('logoutButton').addEventListener('click', function() {
            logout(); // Déconnexion de l'utilisateur
        });

        // Réinitialisation du minuteur d'inactivité pour la page de retrait
        resetInactivityTimer();
    }
});
