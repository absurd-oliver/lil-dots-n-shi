// seedRegistry.js

const seedsContainer = document.getElementById('seedsContainer');

var seeds;

function getCompletedSeeds(){
    const data = localStorage.getItem('completedSeeds');
    if (!data) seeds = []; else seeds = JSON.parse(data);
}


function populatePage(){
    getCompletedSeeds();
    if(seeds.length === 0) return
    if(document.getElementById('nothingText')) document.body.removeChild(document.getElementById('nothingText'));
    seeds.forEach(seed => {
        const newElem = document.createElement('p');
        newElem.textContent = seed;
        newElem.id = seed;
        seedsContainer.appendChild(newElem);
    });
}


function init(){
    populatePage();
}



document.getElementById('toGraphButton').addEventListener('click', () => {history.back()});


window.addEventListener('DOMContentLoaded', init);


