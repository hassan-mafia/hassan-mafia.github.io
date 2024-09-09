import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { collection, query, where, doc, getDocs, getDoc, orderBy, addDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getStorage } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

export let votes = {};
export let groupDoc;
export let groupRef;

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
export const db = getFirestore(app);

export function homeInit() {
    setLoading(true);
    const groupNameField = document.getElementById('groupName');
    const groupKeyField = document.getElementById('groupKey');
    const joinGroupBtn = document.getElementById('joinGroup');
    const createGroupBtn = document.getElementById('createGroup');
    createGroupBtn.addEventListener('click', async () => {
        setLoading(true);
        const groupName = groupNameField.value;
        const groupKey = groupKeyField.value;
        const q = query(collection(db, "groups"), where("name", "==", groupName.toUpperCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (doc) => {
                const groupData = doc.data();
                await Swal.fire({
                    title: 'Group "' + groupName + '" Already Exists, join instead?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, join!',
                    cancelButtonText: 'No, cancel'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        if (groupKey == groupData.password) {
                            window.location.href = `./group/?group=${groupData.name}&key=${groupData.password}`;
                        }
                        else {
                            Swal.fire({
                                title: 'Wrong Group Key!',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    }
                });
            });
        } else {
            await addGroup('Create New Group "' + groupName + '" With Key "' + groupKey + '"?');
        }
        setLoading(false);
    });

    joinGroupBtn.addEventListener('click', async () => {
        setLoading(true);
        const groupName = groupNameField.value;
        const groupKey = groupKeyField.value;
        const q = query(collection(db, "groups"), where("name", "==", groupName.toUpperCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const groupData = doc.data();
                if (groupData.password == groupKey) {
                    window.location.href = `./group/?group=${groupData.name}&key=${groupData.password}`;
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
            await addGroup('Group "' + groupName + '" Not Exist, Create New One With Key "' + groupKey + '"?');
        }
        setLoading(false);
    });
    setLoading(false);
}


export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

export async function fetchGroupData(name) {
    if (name) {
        const q = query(collection(db, "groups"), where("name", "==", name));
        const querySnapshot = await getDocs(q);
        groupDoc = querySnapshot.docs[0];
        groupRef = doc(db, "groups", groupDoc.id);
    } else {
        await Swal.fire({
            title: 'Invalid group name or key!',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        window.location.href = "../";
    }
}

export function getVotesCount() {
    const groupData = groupDoc.data();
    const players = groupData.players;
    players.forEach(player => {
        if (player.active)
        {
            votes[player.name] = {
                count: 0,
                voters: []
            };
            players.forEach(voter => {
                if (voter.active && (voter.vote === player.name)) {
                    votes[player.name].count += 1;
                    votes[player.name].voters.push(voter.name);
                }
            });
        }
    });
}

async function addGroup(confirmationMessage) {
    const groupNameField = document.getElementById('groupName');
    const groupKeyField = document.getElementById('groupKey');
    await Swal.fire({
        title: confirmationMessage,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, create it!',
        cancelButtonText: 'No, cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const groupName = groupNameField.value.toUpperCase();
            const groupKey = groupKeyField.value;
            const array = Array.from({ length: 20 }, (v, i) => (i + 1).toString());
            const groupData = {
                name: groupName,
                password: groupKey,
                players: [],
                randoms: array
            };
            await addDoc(collection(db, "groups"), groupData);
            Swal.fire({
                title: 'Group created successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        }
    });
}


export function setLoading(state) {
    if (state == true) {
        document.getElementById("loadingContainer").style.display = 'flex';
        document.getElementById("mainContainer").style.display = 'none';
    }
    else if (state == false) {
        document.getElementById("loadingContainer").style.display = 'none';
        document.getElementById("mainContainer").style.display = 'flex';
    }
}


