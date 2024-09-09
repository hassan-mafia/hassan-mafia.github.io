import { updateDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { fetchGroupData, setLoading, getQueryParam, getVotesCount } from '../script.js';
import { votes, groupDoc, groupRef } from '../script.js';

let groupName;
let groupKey;
let playerIndex;
let playerName;

export async function playerInit() {
    setLoading(true);
    let error = false;
    groupName = getQueryParam('group');
    groupKey = getQueryParam('key');
    playerName = getQueryParam('player');
    document.getElementById("groupName").textContent = groupName.toUpperCase() + " GROUP";
    if (groupName && groupKey) {
        await fetchGroupData(groupName);
        const groupData = groupDoc.data();
        if (groupKey == groupData.password) {
            await displayPlayers();
            document.getElementById('resetMyVote').addEventListener('click', resetMyVote);
            document.getElementById('reloadVotes').addEventListener('click', reloadVotes);
            document.getElementById('showNumber').addEventListener('click', () => {
                const players = groupDoc.data().players;
                Swal.fire(players[playerIndex].id);
            });
            document.getElementById('groupName').addEventListener('click', () => {
                window.location.href = "../group/?group=" + groupName + "&key=" + groupKey;
            });
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
    let playerActive = true;
    let playerExist = false;
    document.getElementById('playersContainer').innerHTML = '';
    getVotesCount();
    players.forEach((player, index) => {
        if (player.name == playerName) {
            playerIndex = index;
            playerExist = true;
            document.getElementById("playerName").textContent = "Hello " + player.name + "!";
            if (player.active) {
                if (player.vote == 'None') {
                    document.getElementById("playerVote").textContent = "You didn't vote for any player, click player name to change your vote";
                }
                else {
                    document.getElementById("playerVote").textContent = "You voted for " + player.vote + " , click player name to change your vote";
                }
            }
            else {
                playerActive = false;
                document.getElementById("playerVote").textContent = "You are inactive, you can't do anything until your state changed by referee.";
            }

        }

        if (player.active) {
            if (player.name == playerName) {
            }
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player-row');
            // Player name button
            const playerButton = document.createElement('button');
            playerButton.textContent = player.name;
            playerButton.classList.add('player-button', 'name-button');
            playerButton.style.backgroundColor = '#4CAF50';
            playerButton.addEventListener('click', () => {
                changeVote(player.name);
            });
            // Votes button
            const votesButton = document.createElement('button');
            votesButton.textContent = player.active ? votes[player.name].count + ' Votes' : 'Inactive';
            votesButton.classList.add('player-button', 'small-button');
            votesButton.style.color = "black";
            votesButton.style.background = "white";
            votesButton.style.border = "1px solid #000000";
            votesButton.style.flex = "0 0 20%";
            votesButton.addEventListener('click', () => {
                Swal.fire({
                    title: player.name + ' Votes',
                    text: votes[player.name].voters,
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
            });
            // Append buttons to the player row
            playerDiv.appendChild(playerButton);
            playerDiv.appendChild(votesButton);
            document.getElementById('playersContainer').appendChild(playerDiv);
        }
    });
    if (!playerExist) {
        await Swal.fire({
            title: 'Invalid player name!',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        window.location.href = "../group/?group=" + groupName + "&key=" + groupKey;
    }
    if (!playerActive) {
        document.querySelectorAll('button').forEach(button => {
            if (button.id != "reloadVotes" && button.id != "groupName") {
                button.disabled = true;

            }
        });
    }
}

async function changeVote(name) {
    setLoading(true);
    const players = groupDoc.data().players;
    players[playerIndex].vote = name;
    await updateDoc(groupRef, { players });
    await fetchGroupData(groupName);
    await displayPlayers();
    setLoading(false);
    Swal.fire({
        title: 'Your vote has been changed to: ' + name + '!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

async function resetMyVote() {
    setLoading(true);
    const players = groupDoc.data().players;
    players[playerIndex].vote = 'None';
    await updateDoc(groupRef, { players });
    await fetchGroupData(groupName);
    await displayPlayers();
    setLoading(false);
    Swal.fire({
        title: 'Your vote has been reset!',
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

