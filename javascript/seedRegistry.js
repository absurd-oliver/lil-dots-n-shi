// seedRegistry.js

const seedsContainer = document.getElementById('seedsContainer');
var seeds = [];

function getCompletedSeeds(){
    const data = localStorage.getItem('completedSeeds');
    if (!data) {
        seeds = []; 
    } else {
        seeds = JSON.parse(data);
    }
}

function populatePage(){
    getCompletedSeeds();
    if(seeds.length === 0) return;
    const nothingText = document.getElementById('nothingText');
    if (nothingText) {
        nothingText.remove();
    }
    
    seeds.forEach(i => {
        const newElem = document.createElement('p');
        newElem.textContent = i.seed + ' w/ count: ' + i.count;
        newElem.classList.add('registered-seed'); 
        
        seedsContainer.appendChild(newElem);
    });
}

function init(){
    populatePage();
}

document.getElementById('toGraphButton').addEventListener('click', () => {
    history.back();
});

window.addEventListener('DOMContentLoaded', init);
