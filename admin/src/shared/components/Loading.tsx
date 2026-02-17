const loadingMessages = [
  "Chargement...",
  "Chargement en cours...",
  "Chargement qui charge...",
  "Chargement chargé...",
  "Chargement en train de charger...",
  "Chargement à décharge...",
  "Chargement en cours de chargement...",
  "Chargement chiant...",
  "Progrès en progression...",
  "Rotation...",
  "Rotation en cours...",
  "Rotation en train de tourner...",
  "Rotation en cours de rotation...",
  "Rotation en détournement...",
  "Rotation à détourer...",
  "Rotation à dérouter...",
  "Rotation déroutante...",
  "Rotation alarmante...",
  "Rotation accablante...",
  "Rotation atterrante...",
  "Rotation calamiteuse...",
  "Il rame ton site non ?",
  "Ça charge... ça charge...",
  "Ça rame...",
  "Pourquoi je vois ça moi ?",
  "Peut-être les hackers russes...",
  "Peut-être les hackers chinois...",
  "On avance c'est une évidence...",
  "On arrive bientôt...",
  "On est en train de charger...",
  "La routourne elle va tourner...",
  "La suite après la pub...",
  "Euh... tu es bien sûre ?",
  "❤️",
  "You're a queen...",
  "You're a princess...",
  "Best dietician in the place...",
  "I tell you baby you're my best...",
  "I'm in love with you...",
  "Libre ce soir ?",
  "Hein ? Quoi ?",
  "Bisous bisous",
  "Chill out...",
  "Ça charge...",
  "Ça pédale...",
  "Moulinage...",
  "Serrage...",
  "Limage...",
  "Taraudage...",
  "Meulage...",
  "Polissage...",
  "Adelinage...",
  "Élongation...",
  "Ouais ouais on arrive...",
  "Envoi de la fusée...",
  "Gueule de bois...",
  "Qui me demande ?",
  "Patiente un peu...",
  "On se détend...",
  "Hop hop hop...",
  "Tac tac tac...",
  "Zouh zouh zouh...",
  "Tsoin tsoin tsoin...",
  "Tchou tchou tchou...",
  "Vroum vroum vroum..."
];

import { useState } from 'react';

export function Loading() {
  // Select a random message once when component mounts
  const [message] = useState(() => 
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
  );
  
  return (
    <div className="text-center py-8">
      <div className="inline-block">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}
