import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { collection, query, where, doc, getDocs, getDoc, orderBy, addDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getStorage } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";




// Your Firebase configuration
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

export function homeInit() {
    const groupNameField = document.getElementById('groupName');
    const groupPasswordField = document.getElementById('groupPassword');
    const joinGroupBtn = document.getElementById('joinGroup');
    const createGroupBtn = document.getElementById('createGroup');

    createGroupBtn.addEventListener('click', async () => {
        const groupName = groupNameField.value;
        const groupPassword = groupPasswordField.value;
        const q = query(collection(db, "groups"), where("name", "==", groupName.toUpperCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const groupData = doc.data();
                Swal.fire({
                    title: 'Group "' + groupName + '" Already Exists, join instead?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, join!',
                    cancelButtonText: 'No, cancel'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        if (groupPassword == groupData.password) {
                            window.location.href = `./group/?id=${doc.id}`;
                        }
                        else {
                            Swal.fire({
                                title: 'Wrong Passsword!',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    }
                });
            });
        } else {
            await addGroup('Create New Group "' + groupName + '" With Password "' + groupPassword + '"?');
        }
    });

    joinGroupBtn.addEventListener('click', async () => {
        const groupName = groupNameField.value;
        const groupPassword = groupPasswordField.value;
        const q = query(collection(db, "groups"), where("name", "==", groupName.toUpperCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const groupData = doc.data();
                if (groupData.password == groupPassword) {
                    window.location.href = `./group/?id=${doc.id}`;
                }
                else {
                    Swal.fire({
                        title: 'Wrong Passsword!',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            });

        } else {
            await addGroup('Group "' + groupName + '" Not Exist, Create New One With Password "' + groupPassword + '"?');
        }
    });
}

export function groupInit()
{
    const groupId = getQueryParam('id');
    if (groupId) {
        loadGroupData(groupId);
    } else {
        document.getElementById('groupName').textContent = "Group ID not found!";
    }
}

async function addGroup(confirmationMessage) {
    const groupNameField = document.getElementById('groupName');
    const groupPasswordField = document.getElementById('groupPassword');
    Swal.fire({
        title: confirmationMessage,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, create it!',
        cancelButtonText: 'No, cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const groupName = groupNameField.value.toUpperCase();
            const groupPassword = groupPasswordField.value;
            const groupData = {
                name: groupName,
                password: groupPassword
            };
            const docRef = await addDoc(collection(db, "groups"), groupData);
            Swal.fire({
                title: 'Group created successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        }
    });
}












function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function loadGroupData(groupId) {
    try {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const groupData = docSnap.data();
            document.getElementById('groupName').textContent = groupData.name.toUpperCase();
            displayPlayers(groupData.players);
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching group data:", error);
    }
}

function displayPlayers(players) {
    const playersContainer = document.getElementById('playersContainer');

    if (players && players.length > 0) {
        players.forEach(player => {
            const button = document.createElement('button');
            button.textContent = player.name;
            button.classList.add('player-button');
            playersContainer.appendChild(button);
        });
    } else {
        playersContainer.textContent = "No players available.";
    }
}
