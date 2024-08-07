// Données des utilisateurs
const users = [
    { id: 123456, firstName: "Ousmane", lastName: "Fall", password: "00000", balance: 100000, attempts: 3 },
    { id: 234567, firstName: "Khadim", lastName: "Thiam", password: "11111", balance: 200000, attempts: 3 },
    { id: 345678, firstName: "Oumou Khairy", lastName: "Ndiaye", password: "22222", balance: 300000, attempts: 3 },
    { id: 456789, firstName: "Ousmane Eldiey", lastName: "Sow", password: "33333", balance: 400000, attempts: 3 },
    { id: 567890, firstName: "Khadim Bamba", lastName: "Diop", password: "44444", balance: 500000, attempts: 3 }
];

let currentUser = JSON.parse(localStorage.getItem('currentUser'));

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) {
        // Page d'identification
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const cardId = parseInt(document.getElementById('cardId').value);
            const password = document.getElementById('password').value;
            const messageElement = document.getElementById('message');

            const user = users.find(user => user.id === cardId);

            if (user) {
                if (user.password === password) {
                    currentUser = user;
                    user.attempts = 3;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    window.location.href = 'welcome.html';
                } else {
                    user.attempts--;
                    if (user.attempts > 0) {
                        messageElement.textContent = `Mot de passe incorrect. Tentatives restantes: ${user.attempts}`;
                    } else {
                        messageElement.textContent = 'Votre compte est bloqué.';
                    }
                }
            } else {
                messageElement.textContent = 'Numéro de carte invalide. Veuillez réessayer.';
            }
        });
    } else if (document.getElementById('welcomeMessage')) {
        // Page de bienvenue
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('welcomeMessage').textContent = `Bienvenue ${currentUser.firstName} ${currentUser.lastName}`;

        document.getElementById('checkBalanceButton').addEventListener('click', function() {
            document.getElementById('balanceMessage').textContent = `Votre solde est de : ${currentUser.balance} francs`;
        });

        document.getElementById('withdrawButton').addEventListener('click', function() {
            window.location.href = 'withdraw.html';
        });

        document.getElementById('logoutButton').addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    } else if (document.querySelector('.withdrawOption')) {
        // Page de retrait
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        document.querySelectorAll('.withdrawOption').forEach(button => {
            button.addEventListener('click', function() {
                handleWithdraw(parseInt(button.dataset.amount));
            });
        });

        document.getElementById('withdrawButton').addEventListener('click', function() {
            const amount = parseInt(document.getElementById('customAmount').value);
            if (isNaN(amount) || amount % 1000 !== 0) {
                document.getElementById('message').textContent = 'Le montant doit être un multiple de 1000.';
                return;
            }
            handleWithdraw(amount);
        });

        document.getElementById('logoutButton').addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});

function handleWithdraw(amount) {
    const messageElement = document.getElementById('message');
    if (amount > currentUser.balance) {
        messageElement.textContent = 'Montant insuffisant pour effectuer le retrait.';
        return;
    }

    currentUser.balance -= amount;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    messageElement.textContent = 'Vous avez effectué un retrait avec succès.';

    const receipt = {
        receiptNumber: Math.floor(Math.random() * 1000000),
        cardId: currentUser.id,
        amount: amount,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    generatePDF(receipt);
}

function generatePDF(receipt) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(`Reçu de retrait`, 20, 20);
    doc.text(`N° reçu : ${receipt.receiptNumber}`, 20, 30);
    doc.text(`N° card ID : ${receipt.cardId}`, 20, 40);
    doc.text(`Montant retiré : ${receipt.amount} francs`, 20, 50);
    doc.text(`Date : ${receipt.date}`, 20, 60);
    doc.text(`Heure : ${receipt.time}`, 20, 70);

    doc.save(`recu_${receipt.receiptNumber}.pdf`);
}
