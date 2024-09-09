import { fetchGroupData, setLoading, getQueryParam } from '../script.js';
import { groupDoc } from '../script.js';

let groupName;
let groupKey;

export async function groupInit() {
    setLoading(true);
    let error = false;
    groupName = getQueryParam('group');
    groupKey = getQueryParam('key');
    document.getElementById("groupName").textContent = groupName.toUpperCase() + " GROUP";
    if (groupName && groupKey) {
        await fetchGroupData(groupName);
        const groupData = groupDoc.data();
        if (groupKey == groupData.password) {
            document.getElementById("joinAsReferee").addEventListener('click', () => {
                window.location.href = "../referee/?group=" + groupName + "&key=" + groupKey;
            });
            displayPlayers();
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

function displayPlayers() {
    const playersContainer = document.getElementById('playersContainer');
    const groupData = groupDoc.data();
    const players = groupData.players;

    if (players && players.length > 0) {
        players.forEach(player => {
            if (player.active) {
                const button = document.createElement('button');
                button.textContent = player.name;
                button.classList.add('button');
                button.style.width = "100%";
                button.style.fontSize = "20px"
                button.addEventListener('click', () => {
                    window.location.href = "../player/?group=" + groupName + "&key=" + groupKey + "&player=" + player.name;
                });
                playersContainer.appendChild(button);
            }
        });
    } else {
        playersContainer.textContent = "No players available.";
    }
}