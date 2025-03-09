// Sélectionne le conteneur principal du chat
const chatContainer = document.querySelector('.chat-container');

// Sélectionne l'input où l'utilisateur tape son message
const userInput = document.getElementById('user-input');

// Sélectionne la boîte de chat où les messages sont affichés
const chatBox = document.getElementById('chat-box');

// Sélectionne le conteneur de l'input et du bouton d'envoi
const inputContainer = document.querySelector('.input-container');

// Sélectionne le bouton d'envoi à l'intérieur du conteneur de l'input
const sendButton = inputContainer.querySelector("button");

// Fonction pour interagir avec l'API Gemini
async function getResponse() {
    // Clé API pour accéder à l'API Gemini
    const apiKey = "AIzaSyBlXel5eMboRE3w7-J50WMLwYQjuXAUnOI"; // Gemini API KEY

    // URL de l'API Gemini pour générer du contenu
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Création du corps de la requête
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: `
                            Tu es CuistoBot, un expert en cuisine et en nutrition.
                            Tu aides les utilisateurs à concevoir des recettes adaptées à leurs besoins et leur fournis des conseils alimentaires précis et professionnels.

                            **Rôle et compétences :**
                            - Crée des recettes originales et attrayantes en t’inspirant de la cuisine internationale.
                            - Adapte des plats existants aux contraintes alimentaires des utilisateurs (allergies, régimes, intolérances, etc.).
                            - Fournis des conseils personnalisés pour une alimentation équilibrée.
                            - Explique les bienfaits des aliments et des nutriments lorsque cela est demandé.

                            **Règles à suivre :**
                            - Adopte un ton professionnel, accueillant, respectueux et poli.
                            - Sois clair et concis : ne répète pas ta présentation après la première interaction.
                            - Structure bien tes réponses : utilise des sauts de ligne et des tirets pour améliorer la lisibilité.
                            - Réponds uniquement aux questions sur la cuisine et la nutrition. Ignore tout autre sujet.
                            - Ne donne pas d’opinions personnelles : base-toi uniquement sur des faits avérés et des ingrédients existants.
                            - Limite tes réponses à un maximum de 200 mots pour rester précis et pertinent.
                            - Ne réponds à aucune question sur tout personnage qui n'a rien avoir avec le monde de la cuisine.
                            - Tu parles toutes les langues et Tu répondras toujours dans la langue que tu auras détecté dans le message de l'utilisateur.
                        `,
                    },
                    { text: userInput.value }, // Ajoute le texte de l'utilisateur à la requête
                ],
            },
        ],
    };

    // Envoi de la requête API
    try {
        // Envoie une requête POST à l'API Gemini
        const response = await fetch(apiUrl, {
            method: "POST", // Méthode HTTP POST
            headers: { "Content-Type": "application/json" }, // En-tête indiquant que le corps est en JSON
            body: JSON.stringify(requestBody), // Convertit le corps de la requête en JSON
        });

        // Attend la réponse de l'API et la convertit en JSON
        const result = await response.json();
        return result; // Retourne la réponse de l'API

    } catch (error) {
        // En cas d'erreur, affiche l'erreur dans la console
        console.error("Erreur API :", error);
        return null; // Retourne null en cas d'erreur
    }
}

// Gestion de l'événement "click" du bouton d'envoi
sendButton.addEventListener('click', (event) => {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire (rechargement de la page)
    displayContent(); // Appelle la fonction pour afficher le contenu
});

// Fonction displayContent pour afficher la conversation
async function displayContent() {
    // Vérifie si l'input de l'utilisateur est vide ou ne contient que des espaces
    if (!userInput.value.trim()) return; // Si vide, ne fait rien

    // Création du message de l'utilisateur
    const userMessage = document.createElement('div'); // Crée un nouvel élément div
    userMessage.className = 'message user'; // Ajoute la classe CSS pour le style du message utilisateur
    userMessage.innerHTML = `<div class="message-content">${userInput.value}</div>`; // Ajoute le texte de l'utilisateur dans le div
    chatBox.appendChild(userMessage); // Ajoute le message de l'utilisateur à la boîte de chat

    // Affichage d'un message temporaire du bot
    const botMessage = document.createElement('div'); // Crée un nouvel élément div pour le message du bot
    botMessage.className = 'message bot'; // Ajoute la classe CSS pour le style du message bot
    botMessage.innerHTML = `<div class="message-content">...</div>`; // Affiche un message temporaire ("...")
    chatBox.appendChild(botMessage); // Ajoute le message temporaire du bot à la boîte de chat

    // Faire défiler le chat vers le bas pour montrer le nouveau message
    chatBox.scrollTop = chatBox.scrollHeight;

    // Récupération de la réponse du bot ou de l'API
    try {
        // Appelle la fonction getResponse pour obtenir la réponse de l'API
        const result = await getResponse();

        // Vérifie si la réponse est valide et contient des candidats
        if (result && result.candidates && result.candidates.length > 0) {
            console.log("Réponse API :", result); // Affiche la réponse de l'API dans la console
            const response = result.candidates[0].content.parts[0].text; // Extrait le texte de la réponse

            // Formatage de la réponse du bot
            const formattedResponse = formatBotResponse(response);

            // Effet "machine à écrire" pour afficher progressivement la réponse du bot
            let index = 0;
            const interval = setInterval(() => {
                // Affiche progressivement le texte de la réponse
                botMessage.innerHTML = `<div class="message-content">${formattedResponse.slice(0, index++)}</div>`;

                // Arrête l'effet une fois que tout le texte est affiché
                if (index > formattedResponse.length) clearInterval(interval);
            }, 10); // Intervalle de 10 ms entre chaque caractère

        } else {
            // Si la réponse de l'API est invalide, affiche un message d'erreur
            botMessage.innerHTML = `<div class="message-content">Je n'ai pas compris ta demande. Assure-toi que ta question concerne la cuisine et la nutrition.</div>`;
        }

    } catch (error) {
        // En cas d'erreur, affiche un message d'erreur dans le chat
        botMessage.innerHTML = `<div class="message-content">Erreur: ${error.message}</div>`;
    }

    // Réinitialisation du champ de saisie
    userInput.value = ""; // Vide l'input de l'utilisateur
    chatBox.scrollTop = chatBox.scrollHeight; // Fait défiler le chat vers le bas pour montrer le dernier message
}

// Fonction pour formater les réponses du bot
function formatBotResponse(response) {
    // Remplace les doubles astérisques par du gras
    response = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Ajoute des sauts de ligne entre les paragraphes
    response = response.replace(/\n/g, '<br>');

    // Ajoute des listes non numérotées pour les sous-sections
    response = response.replace(/- (.*?)(\n|$)/g, '<li>$1</li>');
    response = response.replace(/<li>/g, '<ul><li>').replace(/<\/li>/g, '</li></ul>');

    return response;
}
















































































































































































































// SCRIPT INITIAL A PARTIR DUQUEL J'AI TRAVAILLE
// // Sélection des éléments HTML
// const chatContainer = document.querySelector('.chat-container');
// const userInput = document.getElementById('user-input');
// const chatBox = document.getElementById('chat-box');
// const inputContainer = document.querySelector('.input-container');
// const sendButton = inputContainer.querySelector("button");

// // Fonction pour interagir avec l'API Gemini
// async function getResponse() {
//     const apiKey = "AIzaSyBlXel5eMboRE3w7-J50WMLwYQjuXAUnOI"; // Gemini API KEY
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

//     // Création du corps de la requête
//     const requestBody = {
//         contents: [
//             {
//                 parts: [
//                     {
//                         text: `
//                             Tu es CuistoBot, un expert en cuisine et en nutrition.
//                             Tu aides les utilisateurs à concevoir des recettes adaptées à leurs besoins et leur fournis des conseils alimentaires précis et professionnels.
//                                 Rôle et compétences :
//                             - Crée des recettes originales et attrayantes en t’inspirant de la cuisine internationale.
//                             - Adapte des plats existants aux contraintes alimentaires des utilisateurs (allergies, régimes, intolérances, etc.).
//                             - Fournis des conseils personnalisés pour une alimentation équilibrée.
//                             - Explique les bienfaits des aliments et des nutriments lorsque cela est demandé.
//                                 Règles à suivre :
//                             - Adopte un ton professionnel, accueillant, respectueux et poli.
//                             - Sois clair et concis : ne répète pas ta présentation après la première interaction.
//                             - Structure bien tes réponses : utilise des sauts de ligne et des tirets pour améliorer la lisibilité.
//                             - Réponds uniquement aux questions sur la cuisine et la nutrition. Ignore tout autre sujet.
//                             - Ne donne pas d’opinions personnelles : base-toi uniquement sur des faits avérés et des ingrédients existants.
//                             - Limite tes réponses à un maximum de 200 mots pour rester précis et pertinent.
//                             - Ne réponds à aucune question sur tout personnage qui n'a rien avoir avec le monde de la cuisine.


//                         `,
//                     },
//                     { text: userInput.value }, // Correction ici (Text -> text)
//                 ],
//             },
//         ],
//     };

//     // Envoi de la requête API
//     try {
//         const response = await fetch(apiUrl, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(requestBody),
//         });
//         const result = await response.json();
//         return result;

//     } catch (error) {
//         console.error("Erreur API :", error);
//         return null;
//     }
// }

// // Gestion de l'événement "click" du bouton d'envoi
// sendButton.addEventListener('click', (event) => {
//     event.preventDefault();
//     displayContent();
// });


// // Fonction displayContent pour afficher la conversation
// async function displayContent() {
//     if (!userInput.value.trim()) return; // Empêche d'envoyer un message vide

//     // Création du message de l'utilisateur
//     const userMessage = document.createElement('div');
//     userMessage.className = 'message user';
//     userMessage.innerHTML = `<div class="message-content">${userInput.value}</div>`;
//     chatBox.appendChild(userMessage);

//     // Affichage d'un message temporaire du bot
//     const botMessage = document.createElement('div');
//     botMessage.className = 'message bot';
//     botMessage.innerHTML = `<div class="message-content">...</div>`;
//     chatBox.appendChild(botMessage);

//     // Faire défiler le chat vers le bas
//     chatBox.scrollTop = chatBox.scrollHeight;

//     // Récupération de la réponse du bot ou de l'API
//     try {
//         const result = await getResponse();
//         if (result && result.candidates && result.candidates.length > 0) {
//             console.log("Réponse API :", result);
//             const response = result.candidates[0].content.parts[0].text; // Correction ici (part -> parts)

//             // Effet "machine à écrire" pour afficher progressivement la réponse du bot
//             let index = 0;
//             const interval = setInterval(() => {
//                 botMessage.innerHTML = `<div class="message-content">${response.slice(0, index++)}</div>`;
//                 if (index > response.length) clearInterval(interval);
//             }, 10);

//         } else {
//             botMessage.innerHTML = `<div class="message-content">Je n'ai pas compris ta demande. Assure-toi que ta question concerne la cuisine et la nutrition.</div>`;
//         }

//     } catch (error) {
//         botMessage.innerHTML = `<div class="message-content">Erreur: ${error.message}</div>`;
//     }

//     // Réinitialisation du champ de saisie
//     userInput.value = "";
//     chatBox.scrollTop = chatBox.scrollHeight;
// }