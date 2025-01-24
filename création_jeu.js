let player1Health = 100;
let player2Health = 100;
let isPlayer1Turn = true;
let log = document.getElementById('log');
let player1Weapon = { name: 'Shuriken', damage: 10, image: "images_jeu/shuriken.jpg" };
let player2Weapon = { name: 'Shuriken', damage: 10, image: "images_jeu/shuriken.jpg" };
const weapons = [
  { name: 'Shuriken', damage: 10,image: "images_jeu/shuriken.jpg" },
  { name: 'Bow', damage: 15 ,image: "images_jeu/bow.jpg"},
  { name: 'Knife', damage: 20,image: "images_jeu/couteau.jpg" },
  { name: 'Katana', damage: 25,image: "images_jeu/katana.jpg" },
  { name: 'Double-Blade', damage: 30,image: "images_jeu/double lame.jpg" },
];let weaponPositions = [];
let player1IsDefending = false;
let player2IsDefending = false;

// Fonction pour générer la liste des armes
function displayWeapons() {
  const weaponsList = document.getElementById('weapons-list'); // Sélectionne l'élément <ul> dans le conteneur

  weapons.forEach(weapon => {
    // Crée un nouvel élément <li> pour chaque arme
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${weapon.image}" alt="${weapon.name}" style="width: 50px; height: 50px; margin-right: 10px;">
      <strong>${weapon.name}</strong> : <span class="weapon-damage">${weapon.damage}</span> dégâts
    `;

    // Ajoute l'élément <li> à la liste <ul>
    weaponsList.appendChild(li);
  });
}

// Exécute la fonction lorsque la page est chargée
document.addEventListener('DOMContentLoaded', displayWeapons);

let player1Position = { x: 0, y: 0 }; // Kinemon commence en haut à gauche
let player2Position = { x: 14, y: 11 }; // Jack commence en bas à droite

function checkGameOver() {
  if (player1Health <= 0) {
    logAction("Game Over! Ogre à gagné !");
    return true;
  } else if (player2Health <= 0) {
    logAction("Game Over! Samourai à gagné !");
    return true;
  }
  return false;
}

function getRandomPosition() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * 15),
      y: Math.floor(Math.random() * 12),
    };
  } while (
    (position.x === player1Position.x && position.y === player1Position.y) ||
    (position.x === player2Position.x && position.y === player2Position.y)
  );
  return position;
}

function createGameBoard() {
  const board = document.getElementById('game-board');
  board.innerHTML = ''; // Réinitialiser le plateau

  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 15; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.id = `cell-${col}-${row}`;
      board.appendChild(cell);

      const weaponHere = weaponPositions.find(
        (wp) => wp.x === col && wp.y === row
      );

      // Afficher le joueur sur sa position et non l'arme
      if (player1Position.x === col && player1Position.y === row) {
        const playerElement = document.createElement('div');
        playerElement.classList.add('character1');
        playerElement.id = 'character1';
        cell.appendChild(playerElement);  // Afficher Player 1
      } else if (player2Position.x === col && player2Position.y === row) {
        const playerElement = document.createElement('div');
        playerElement.classList.add('character2');
        playerElement.id = 'character2';
        cell.appendChild(playerElement);  // Afficher Player 2
      }

      // Vérifier si une arme est sur la case et si elle n'est pas l'arme équipée
      if (weaponHere && (weaponHere.weapon.name !== player1Weapon.name && weaponHere.weapon.name !== player2Weapon.name)) {
        const weaponElement = document.createElement('div');
        weaponElement.classList.add('weapon');
        
        const weaponImage = document.createElement('img');
        weaponImage.src = weaponHere.weapon.image; // Utilise l'URL de l'image
        weaponImage.alt = 'Weapon image'; // Texte alternatif
        
        // Applique du CSS pour ajuster l'image à la taille de la case
        weaponImage.style.width = '100%';
        weaponImage.style.height = '100%';
        weaponImage.style.objectFit = 'cover'; // Assure que l'image remplisse la case sans déformation
        
        weaponElement.appendChild(weaponImage);
        cell.appendChild(weaponElement);
      }
    
    }
  }
}

function getValidMoves(position, maxDistance = 3) {
  const moves = [];
  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
  ];

  const opponentPosition = isPlayer1Turn ? player2Position : player1Position;

  directions.forEach((dir) => {
    for (let dist = 1; dist <= maxDistance; dist++) {
      const newX = position.x + dir.x * dist;
      const newY = position.y + dir.y * dist;

      if (
        newX >= 0 && newX < 15 && newY >= 0 && newY < 12 &&
        !(newX === opponentPosition.x && newY === opponentPosition.y)
      ) {
        moves.push({ x: newX, y: newY });
      }
    }
  });

  return moves;
}

function areAdjacent(pos1, pos2) {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  return dx + dy === 1; // Adjacent si la distance de Manhattan est 1
}
function arePlayersAdjacent() {
  return areAdjacent(player1Position, player2Position);
}


function highlightMoves(playerId) {
  clearHighlights(); // Nettoie d'abord les anciennes surbrillances
  const position = playerId === 'player1' ? player1Position : player2Position;
  const validMoves = getValidMoves(position);

  validMoves.forEach((move) => {
    const cell = document.getElementById(`cell-${move.x}-${move.y}`);
    if (cell) {
      cell.classList.add('highlight'); // Ajouter la classe de surbrillance
      cell.addEventListener('click', () => handleMoveClick(playerId, move)); // Attache un clic pour déplacer
    }
  });
}

function clearHighlights() {
  const highlightedCells = document.querySelectorAll('.highlight');
  highlightedCells.forEach((cell) => {
    cell.classList.remove('highlight'); // Retire la surbrillance
    cell.replaceWith(cell.cloneNode(true)); // Supprime les gestionnaires de clic
  });
}

function updateWeaponInfo(playerId, weapon) {
  // Met à jour l'image de l'arme
  document.getElementById(`${playerId}-weapon-image`).src = weapon.image;

  // Met à jour le nom de l'arme
  document.getElementById(`${playerId}-weapon-name`).textContent = weapon.name;

  // (Optionnel) Affiche les dégâts dans la console pour le suivi
  console.log(`${playerId} a maintenant l'arme "${weapon.name}" avec ${weapon.damage} points de dégâts.`);
}

function resetWeaponInfo() {
  // Réinitialiser l'affichage des armes des joueurs
  document.getElementById('player1-weapon-image').src = 'images_jeu/shuriken.jpg'; // Image par défaut
  document.getElementById('player1-weapon-name').textContent = 'Shuriken'; // Nom de l'arme par défaut

  document.getElementById('player2-weapon-image').src = 'images_jeu/shuriken.jpg'; // Image par défaut
  document.getElementById('player2-weapon-name').textContent = 'Shuriken'; // Nom de l'arme par défaut
}

function handleMoveClick(playerId, newPosition) {
  clearHighlights();

  if (playerId === 'player1') {
    player1Position = newPosition;
  } else {
    player2Position = newPosition;
  }

  updateBoard();

  // Ramasser une arme
  const weaponIndex = weaponPositions.findIndex(
    (wp) => wp.x === newPosition.x && wp.y === newPosition.y
  );

  if (weaponIndex !== -1) {
    const weapon = weaponPositions[weaponIndex].weapon;
    if (playerId === 'player1') {
      player1Weapon = weapon;
    } else {
      player2Weapon = weapon;
    }
    weaponPositions.splice(weaponIndex, 1); // Retirer l'arme de la carte
    logAction(`${playerId === 'player1' ? 'Samourai' : 'Ogre'} a ramassé ${weapon.name} !`);

    // Met à jour l'affichage de l'arme dans le player stats
    updateWeaponInfo(playerId, weapon);
  }

  updateBoard();

  // Si les joueurs sont adjacents, afficher les boutons d'action
  if (areAdjacent(player1Position, player2Position)) {
    logAction("Les joueurs sont côte à côte, choississez d'attaquer ou de défendre !");
  }

  isPlayer1Turn = !isPlayer1Turn; // Changer de tour
  logAction(`Now it's ${isPlayer1Turn ? "Player 1's" : "Player 2's"} turn!`);
  highlightMoves(isPlayer1Turn ? 'player1' : 'player2'); // Mettre en surbrillance les déplacements
}


function showActionButtons() {
  clearHighlights();
  document.getElementById('actions').style.display = 'block'; // Montre les actions
}

function hideActionButtons() {
  document.getElementById('actions').style.display = 'none'; // Cache les actions
}


// Fonction pour mettre à jour l'arme d'un joueur
function updateWeapons(playerId, weaponIndex) {
  // Vérifie si l'index est valide
  if (weaponIndex < 0 || weaponIndex >= weapons.length) {
    console.error('Index d\'arme invalide');
    return;
  }

  // Récupère les informations de l'arme
  const weapon = weapons[weaponIndex];

  // Met à jour l'image de l'arme
  document.getElementById(`${playerId}-weapon-image`).src = weapon.image;

  // Met à jour le nom de l'arme
  document.getElementById(`${playerId}-weapon-name`).textContent = weapon.name;

  // (Optionnel) Affiche les dégâts dans la console pour le suivi
  console.log(`${playerId} possède maintenant l'arme "${weapon.name}" avec ${weapon.damage} points de dégâts.`);
}


function placeWeapons() {
  weaponPositions = [];
  const numWeapons = 5;

  for (let i = 0; i < numWeapons; i++) {
    let position;
    do {
      position = {
        x: Math.floor(Math.random() * 15),
        y: Math.floor(Math.random() * 12),
      };
    } while (
      weaponPositions.some(
        (wp) => wp.x === position.x && wp.y === position.y
      ) ||
      (position.x === player1Position.x && position.y === player1Position.y) ||
      (position.x === player2Position.x && position.y === player2Position.y)
    );

    weaponPositions.push({ ...position, weapon: weapons[i % weapons.length] });
  }
}

function placePlayer(position, playerId) {
  const cell = document.getElementById(`cell-${position.x}-${position.y}`);
  const playerElement = document.createElement('div');
  playerElement.classList.add('player');
  playerElement.id = playerId;
  cell.appendChild(playerElement);
}

function updateBoard() {
  createGameBoard();
}

function updateHealth() {
  // Mise à jour des valeurs de texte de santé
  document.getElementById('player1-health').textContent = player1Health;
  document.getElementById('player2-health').textContent = player2Health;

  // Mise à jour de la largeur des barres de vie
  updateHealthBar('player1', player1Health);
  updateHealthBar('player2', player2Health);
}

// Fonction pour mettre à jour la barre de vie
function updateHealthBar(playerId, health) {
  const healthBar = document.getElementById(`${playerId}-health-bar`); // Sélectionner la barre de vie
  const healthPercentage = Math.max(0, Math.min(health, 100)); // Limite entre 0 et 100
  console.log(`Updating ${playerId} health to: ${healthPercentage}%`);

  healthBar.style.width = `${healthPercentage}%`;

  // Changer la couleur de la barre en fonction du pourcentage de santé
  if (healthPercentage > 50) {
    healthBar.style.backgroundColor = '#76c7c0'; // Vert pour bonne santé
  } else if (healthPercentage > 25) {
    healthBar.style.backgroundColor = '#f5a623'; // Orange pour santé modérée
  } else {
    healthBar.style.backgroundColor = '#e74c3c'; // Rouge pour mauvaise santé
  }
}


function logAction(action) {
  const entry = document.createElement('div');
  entry.textContent = action;
  log.prepend(entry);
}

// Lier l'événement du bouton "Attack" à la fonction attack
document.getElementById('attack').addEventListener('click', attack);
document.getElementById('defend').addEventListener('click', defend);

function getWeaponDamage(weapon) {
  // Vérifier que weapon est bien un objet avec une propriété 'name'
  if (typeof weapon === 'object' && weapon !== null && weapon.name) {
    switch (weapon.name) {  // Comparer weapon.name au lieu de weapon
      case 'Shuriken' : return 10;
      case 'Bow' : return 15;
      case 'Knife': return 20;
      case 'Katana' : return 25;
      case 'Double-Blade': return 30;
      default: return 10;
    }
  } else {
    // Si weapon n'est pas un objet valide ou ne possède pas de propriété 'name', retourner un défaut
    return 10;
  }
}

// Fonction d'attaque modifiée
function attack() {
  if (!arePlayersAdjacent()) {
    logAction("Players must be adjacent to attack!");
    return; // Empêcher l'attaque si les joueurs ne sont pas adjacents
  }

  // Récupérer l'arme et calculer les dégâts
  const weapon = isPlayer1Turn ? player1Weapon : player2Weapon;
  let damage = getWeaponDamage(weapon);

  // Si l'autre joueur se défend, diviser les dégâts par 2
  if (isPlayer1Turn && player2IsDefending) {
    damage = Math.floor(damage / 2); // Diviser les dégâts de l'arme par 2 si Player 2 se défend
    logAction("Player 2 is defending, damage is halved!");
  } else if (!isPlayer1Turn && player1IsDefending) {
    damage = Math.floor(damage / 2); // Diviser les dégâts de l'arme par 2 si Player 1 se défend
    logAction("Player 1 is defending, damage is halved!");
  }

  // Appliquer les dégâts en fonction du joueur en cours
  if (isPlayer1Turn) {
    player2Health = Math.max(player2Health - damage, 0);
    logAction(`Player 1 attacks with ${weapon.name} for ${damage} damage!`);
  } else {
    player1Health = Math.max(player1Health - damage, 0);
    logAction(`Player 2 attacks with ${weapon.name} for ${damage} damage!`);
  }

  // Changer de tour et vérifier si le jeu est terminé
  isPlayer1Turn = !isPlayer1Turn;
  checkGameOver();
  updateHealth();
}

// Fonction pour la défense
function defend() {
  if (isPlayer1Turn) {
    player1IsDefending = true;
    logAction('Player 1 defends!');
  } else {
    player2IsDefending = true;
    logAction('Player 2 defends!');
  }

  // Passer au tour suivant après la défense
  isPlayer1Turn = !isPlayer1Turn;
  updateHealth();
  checkGameOver();
}



document.getElementById('restartButton').addEventListener('click', restartGame);
// Assurez-vous que votre code JavaScript attend que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', function () {
  // Lier les boutons à des actions
  const attackButton = document.getElementById('attack');
  const defendButton = document.getElementById('defend');
  
  // Ajouter un écouteur d'événements pour chaque bouton
  attackButton.addEventListener('click', attack);
  defendButton.addEventListener('click', defend);
});




function restartGame() {
  player1Health = 100;
  player2Health = 100;
  player1Weapon = { name: 'Shuriken', damage: 10, image: "images_jeu/shuriken.jpg" };
  player2Weapon = { name: 'Shuriken', damage: 10, image: "images_jeu/shuriken.jpg" };
  player1IsDefending = false;
  player2IsDefending = false;
  
  player1Position = getRandomPosition();
  player2Position = getRandomPosition();
  resetWeaponInfo();
  placeWeapons();
  isPlayer1Turn = true;
  log.innerHTML = '';
  createGameBoard();
  highlightMoves('player1');
  updateHealth();
  updateWeapons();
  hideActionButtons();
}

player1Health = 100;
player2Health = 100;
player1Weapon = { name: 'Shuriken', damage: 10, image: "images_jeu/shuriken.jpg" };
player2Weapon = { name: 'Shuriken', damage: 10, image: "images_jeu/shuriken.jpg" };
player1IsDefending = false;
player2IsDefending = false;

player1Position = getRandomPosition();
player2Position = getRandomPosition();

placeWeapons();
isPlayer1Turn = true;
log.innerHTML = '';
createGameBoard();
highlightMoves('player1');
updateHealth();
updateWeapons();
hideActionButtons();


