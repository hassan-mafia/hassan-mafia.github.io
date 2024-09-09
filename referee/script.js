import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, collection, query, where, getDocs, getDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { fetchGroupData, setLoading, getQueryParam, getVotesCount } from '../script.js';
import { db, votes, groupDoc, groupRef } from '../script.js';

let groupName;
let groupKey;
let randoms = [];

export async function refereeInit() {
    setLoading(true);
    let error = false;
    groupName = getQueryParam('group');
    groupKey = getQueryParam('key');
    document.getElementById("groupName").textContent = groupName.toUpperCase() + " GROUP - REFEREE";
    document.getElementById("playerName").textContent = "Hello Referee!";
    document.getElementById('groupName').addEventListener('click', () => {
        window.location.href = "../group/?group=" + groupName + "&key=" + groupKey;
    });
    if (groupName && groupKey) {
        await fetchGroupData(groupName);
        const groupData = groupDoc.data();
        if (groupKey == groupData.password) {
            randoms = groupData.randoms;
            await displayPlayers();
            document.getElementById('resetVotes').addEventListener('click', resetVotes);
            document.getElementById('reloadVotes').addEventListener('click', reloadVotes);
            document.getElementById('generateRandoms').addEventListener('click', generateRandoms);
            document.getElementById('editRandoms').addEventListener('click', editRandoms);
            document.getElementById('addPlayer').addEventListener('click', addPlayer);
        }
        else {
            error = true;
        }
    } else {
        error = true;
    }
    if (error == true) {
        await Swal.fire({
            title: 'Invalid group name or key!',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        window.location.href = "../";
    }
    setLoading(false);
};

async function displayPlayers() {
    const groupData = groupDoc.data();
    const players = groupData.players;
    randoms = groupData.randoms;
    document.getElementById('playersContainer').innerHTML = '';
    getVotesCount();
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
            Swal.fire(randoms[index]);
        });
        // Votes button
        const votesButton = document.createElement('button');
        votesButton.textContent = player.active ? votes[player.name].count + ' Votes' : 'Inactive';
        votesButton.classList.add('player-button', 'small-button');
        votesButton.style.color = "black";
        votesButton.style.border = "1px solid #000000";
        votesButton.addEventListener('click', () => {
            Swal.fire({
                title: player.name + ' Votes',
                text: votes[player.name].voters,
                icon: 'info',
                confirmButtonText: 'OK'
            });
        });
        // Set Active/Inactive button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = player.active ? 'Set Inactive' : 'Set Active';
        toggleButton.classList.add('player-button', 'small-button');
        toggleButton.style.color = "black";
        toggleButton.style.border = "1px solid #000000";
        toggleButton.addEventListener('click', () => {
            togglePlayerActive(index, !player.active);
        });
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('player-button', 'small-button');
        deleteButton.style.color = "black";
        deleteButton.style.border = "1px solid red";
        deleteButton.addEventListener('click', () => {
            deletePlayer(index);
        });
        // Append buttons to the player row
        playerDiv.appendChild(playerButton);
        playerDiv.appendChild(votesButton);
        playerDiv.appendChild(toggleButton);
        playerDiv.appendChild(deleteButton);
        document.getElementById('playersContainer').appendChild(playerDiv);
    });
}

async function deletePlayer(playerIndex) {
    setLoading(true);
    const players = groupDoc.data().players;
    players.splice(playerIndex, 1);
    await updateDoc(groupRef, { players });
    await fetchGroupData(groupName);
    await displayPlayers();
    setLoading(false);
    Swal.fire({
        title: 'Player deleted!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

async function togglePlayerActive(playerIndex, isActive) {
    setLoading(true);
    const players = groupDoc.data().players;
    players[playerIndex].active = isActive;
    sortPlayers(players);
    await updateDoc(groupRef, { players });
    await fetchGroupData(groupName);
    await displayPlayers();
    setLoading(false);
    Swal.fire({
        title: 'Player active status set!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

async function resetVotes() {
    setLoading(true);
    const players = groupDoc.data().players;
    players.forEach(player => {
        player.vote = "None";
    });
    await updateDoc(groupRef, { players });
    await fetchGroupData(groupName);
    await displayPlayers();
    setLoading(false);
    Swal.fire({
        title: 'Votes have been reset!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

async function reloadVotes() {
    setLoading(true);
    await fetchGroupData(groupName);
    await displayPlayers();
    setLoading(false);
}

async function generateRandoms() {
    setLoading(true);
    const groupData = groupDoc.data();
    const players = groupData.players;
    randoms = shuffleArray(groupData.randoms);
    players.forEach((player, index) => {
        player.id = randoms[index];
    });
    await updateDoc(groupRef, { players });
    await fetchGroupData(groupName);
    await displayPlayers();
    setLoading(false);
    Swal.fire({
        title: 'New randoms generated!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

function editRandoms() {
    window.location.href = "../randoms/?group=" + groupName + "&key=" + groupKey;
}

async function addPlayer() {
    const groupData = groupDoc.data();
    const players = groupData.players;
    if (players.length >= 20) {
        Swal.fire({
            title: 'Players cannot exceed 20 players, please delete players first!',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
    else {

        Swal.fire({
            title: 'Enter player name',
            input: 'text',
            inputPlaceholder: 'Type player name here',
            showCancelButton: true,
            confirmButtonText: 'Add',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to enter player name!';
                }
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                const playerName = result.value;
                const groupData = groupDoc.data();
                const players = groupData.players;
                let playerExist = false;
                players.forEach(player => {
                    if (playerName.replace(/\s+/g, '').toUpperCase() == player.name.replace(/\s+/g, '').toUpperCase()) {
                        playerExist = true;
                        setLoading(false);
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
                    await fetchGroupData(groupName);
                    await displayPlayers();
                    setLoading(false);
                    Swal.fire({
                        title: 'New player added!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    }
}

function shuffleArray(array) {
    let filteredArray = array.filter(value => value !== '');
    for (let i = filteredArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [filteredArray[i], filteredArray[j]] = [filteredArray[j], filteredArray[i]]; // Swap elements
    }
    return filteredArray;
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

