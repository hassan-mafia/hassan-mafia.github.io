import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, collection, query, where, getDocs, getDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

let randoms = []
let groupDoc;
let groupRef;

const firebaseConfig = {
    apiKey: "AIzaSyC351lTMUnQYSq-gJBD9Ip3fESGI8qm2Rc",
    authDomain: "hassan-mafia.firebaseapp.com",
    projectId: "hassan-mafia",
    storageBucket: "hassan-mafia.appspot.com",
    messagingSenderId: "271809682518",
    appId: "1:271809682518:web:d16cf3968637287fc1eff7",
    measurementId: "G-Z5MDVKBH9M"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function init() {
    const q = query(collection(db, "groups"), where("name", "==", getQueryParam('group')));
    const querySnapshot = await getDocs(q);
    groupDoc = querySnapshot.docs[0];
    groupRef = doc(db, "groups", groupDoc.id);
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function loadGroupData() {
    await init();
    const groupData = groupDoc.data();
    randoms = groupData.randoms;
    displayPlayers(groupDoc.id, groupData.players);
}

function displayPlayers(groupId, players) {
    const playersContainer = document.getElementById('playersContainer');
    playersContainer.innerHTML = '';
    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player-row');
        // Player name button
        const playerButton = document.createElement('button');
        playerButton.textContent = player.name;
        playerButton.classList.add('player-button', 'name-button');
        playerButton.style.backgroundColor = player.active ? '#4CAF50' : '#888888'; // Green if active, gray if not
        randoms[index] = player.id;
        playerButton.addEventListener('click', () => {
            alert(`Player ID: ${randoms[index]}`);
        });
        // Set Active/Inactive button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = player.active ? 'Set Inactive' : 'Set Active';
        toggleButton.classList.add('player-button', 'small-button');
        toggleButton.style.backgroundColor = '#888888'; // Gray background
        toggleButton.addEventListener('click', () => {
            togglePlayerActive(groupId, index, !player.active);
        });
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('player-button', 'small-button');
        deleteButton.style.backgroundColor = '#888888'; // Gray background
        deleteButton.addEventListener('click', () => {
            deletePlayer(index);
        });
        // Append buttons to the player row
        playerDiv.appendChild(playerButton);
        playerDiv.appendChild(toggleButton);
        playerDiv.appendChild(deleteButton);
        playersContainer.appendChild(playerDiv);
    });
}

async function deletePlayer(playerIndex) {
    const players = groupDoc.data().players;
    players.splice(playerIndex, 1);
    await updateDoc(groupRef, { players });
    loadGroupData();
}


async function togglePlayerActive(groupId, playerIndex, isActive) {
    const players = groupDoc.data().players;
    players[playerIndex].active = isActive;
    sortPlayers(players);
    await updateDoc(groupRef, { players });
    location.reload();
}

async function resetVotes() {
    const players = groupDoc.data().players;
    players.forEach(player => {
        player.vote = "None";
    });
    await updateDoc(groupRef, { players });
    Swal.fire({
        title: 'Votes have been reset!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

async function generateRandoms() {
    const groupData = groupDoc.data();
    const players = groupData.players;
    randoms = shuffleArray(groupData.randoms);
    players.forEach((player, index) => {
        player.id = randoms[index];
    });
    await updateDoc(groupRef, { players });
}

document.getElementById('resetVotes').addEventListener('click', async () => {
    resetVotes();
});

document.getElementById('generateRandoms').addEventListener('click', async () => {
    const groupData = groupDoc.data();
    randoms = shuffleArray(groupData.randoms);
    generateRandoms();
    Swal.fire({
        title: 'New randoms generated!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
});


function shuffleArray(array) {
    let filteredArray = array.filter(value => value !== '');
    for (let i = filteredArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [filteredArray[i], filteredArray[j]] = [filteredArray[j], filteredArray[i]]; // Swap elements
    }
    return filteredArray;
}

window.onload = function () {
    const groupName = getQueryParam('group');
    if (groupName) {
        document.getElementById('groupName').textContent += groupName;
        loadGroupData();
    } else {
        document.getElementById('groupName').textContent = "Group not found!";
    }
};

document.getElementById('addPlayer').addEventListener('click', async () => {
    const playerName = document.getElementById('newPlayerName').value.trim();
    if (!playerName) {
        Swal.fire({
            title: 'Please enter a valid name!',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    addPlayer(playerName);
});

async function addPlayer(playerName) {
    const groupData = groupDoc.data();
    const players = groupData.players;
    let playerExist = false;
    players.forEach(player => {
        if (playerName.replace(/\s+/g, '') == player.name.replace(/\s+/g, '')) {
            playerExist = true;
            Swal.fire({
                title: 'Player name already exists, please choose new name!',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
    if (!playerExist) {
        players.push({
            name: playerName,
            id: 0,
            active: true,
            vote: "None",
            avatar: "None"
        });
        randoms = shuffleArray(groupData.randoms);
        sortPlayers(players);
        players.forEach((player, index) => {
            player.id = randoms[index];
        });
        await updateDoc(groupRef, { players });
        await loadGroupData();
        Swal.fire({
            title: 'New player added!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }
}

function sortPlayers(players) {
    players.sort((a, b) => {
        // Priority 1: "Hassan" comes first
        if (a.name === "Hassan" && a.active) return -1;
        if (b.name === "Hassan" && b.active) return 1;

        // Priority 2: Active players come first
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;

        // Priority 3: Sort by name alphabetically
        return a.name.localeCompare(b.name);
    });
}