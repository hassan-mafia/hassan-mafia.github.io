import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, collection, query, where, getDocs, getDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { fetchGroupData, setLoading, getQueryParam, getVotesCount } from '../script.js';
import { db, votes, groupDoc, groupRef } from '../script.js';

let groupName;
let groupKey;
let randoms = [];

export async function randomsInit() {
    setLoading(true);
    let error = false;
    groupName = getQueryParam('group');
    groupKey = getQueryParam('key');
    document.getElementById("groupName").textContent = groupName.toUpperCase() + " GROUP";
    document.getElementById('groupName').addEventListener('click', () => {
        window.location.href = "../group/?group=" + groupName + "&key=" + groupKey;
    });
    document.getElementById('save').addEventListener('click', save);
    if (groupName && groupKey) {
        await fetchGroupData(groupName);
        const groupData = groupDoc.data();
        if (groupKey == groupData.password) {
            randoms = groupData.randoms;
            const container = document.getElementById('randomsContainer');
            container.innerHTML = ''; // Clear the container
            randoms.forEach((text, index) => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = text; 
                input.id = `input-${index}`;
                input.classList.add('text-field'); 
                container.appendChild(input);
                container.appendChild(document.createElement('br'));
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

async function save() {
    setLoading(true);
    let randoms = groupDoc.data().randoms;
    randoms.forEach((text, index) => {
        const newValue = document.getElementById(`input-${index}`).value;
        randoms[index] = newValue;
    });
    await updateDoc(groupRef, { randoms });
    setLoading(false);
    await Swal.fire({
        title: 'Randoms Saved!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}