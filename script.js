const channels = [

{
name:"WORDS FM",
frequency:"98.7 FM",
description:"5000 MOST USED WORDS",
file:"data/5000_words_channel.csv",
color:"#38bdf8",
background:false
},

{
name:"LISTEN FM",
frequency:"101.2 FM",
description:"LISTENING TRAINER",
file:"data/listen_channel.csv",
color:"#a855f7",
background:true
}

];



let channelIndex = 0;

let data = [];

let current = null;

let playing = false;

let restartTimeout = null;

let backgroundAudio = null;





const radio = document.getElementById("radio");

const playButton = document.getElementById("playButton");

const prevButton = document.getElementById("prevChannel");

const nextButton = document.getElementById("nextChannel");


const frequency = document.getElementById("frequency");

const channelName = document.getElementById("channelName");

const description = document.getElementById("description");


const phrase = document.getElementById("phrase");

const translation = document.getElementById("translation");


const level = document.getElementById("level");

const speedValue = document.getElementById("speedValue");








// CSV laden

async function loadCSV(file){


const response = await fetch(file);


const text = await response.text();



return text
.trim()
.split("\n")
.slice(1)
.map(row=>{


const parts=row.split(",");



return {

es:parts[0],

de:parts[1]

};


});


}









// Kanal wechseln

async function updateChannel(){


stop();



const channel = channels[channelIndex];



radio.classList.add("tuning");



data = await loadCSV(channel.file);



setTimeout(()=>{


frequency.textContent = channel.frequency;

channelName.textContent = channel.name;

description.textContent = channel.description;



document.documentElement.style.setProperty(
"--channel-color",
channel.color
);



phrase.textContent = channel.name;

translation.textContent = channel.description;



radio.classList.remove("tuning");


},300);


}









// Hintergrundgeräusch

function startBackgroundSound(){


const channel = channels[channelIndex];



if(!channel.background){

return;

}



const sounds=[

"data/train.mp3",

"data/city.mp3"

];



const selected =
sounds[Math.floor(Math.random()*sounds.length)];



backgroundAudio = new Audio(selected);



backgroundAudio.loop = true;


backgroundAudio.volume = 0.15;



backgroundAudio.play();


}






function stopBackgroundSound(){


if(backgroundAudio){


backgroundAudio.pause();


backgroundAudio.currentTime=0;


backgroundAudio=null;


}


}









function chooseItem(){



current = data[

Math.floor(

Math.random()*data.length

)

];



phrase.textContent=current.es;

translation.textContent=current.de;


}









// Sprache abspielen

function speak(text,rate){


return new Promise(resolve=>{


const utterance =
new SpeechSynthesisUtterance(text);



utterance.lang="es-ES";


utterance.rate=rate;



utterance.onstart=()=>{

radio.classList.add("talking");

};



utterance.onend=()=>{

radio.classList.remove("talking");

resolve();

};



speechSynthesis.speak(utterance);


});


}








function pause(time=700){


return new Promise(resolve=>{


setTimeout(resolve,time);


});


}









async function speakText(){


if(!current || !playing){

return;

}



const speed={

slow:0.55,

fast:1.0,

veryfast:1.35,

native:1.0

};



const mode = Number(level.value);





if(mode===1){

await speak(current.es,speed.slow);

await pause();

await speak(current.es,speed.slow);

}



if(mode===2){

await speak(current.es,speed.slow);

await pause();

await speak(current.es,speed.fast);

}



if(mode===3){

await speak(current.es,speed.slow);

await pause();

await speak(current.es,speed.fast);

await pause();

await speak(current.es,speed.veryfast);

}



if(mode===4){

await speak(current.es,speed.fast);

await pause();

await speak(current.es,speed.fast);

}



if(mode===5){

await speak(current.es,speed.fast);

await pause();

await speak(current.es,speed.veryfast);

}



if(mode===6){

await speak(current.es,speed.native);

}





// Pause vor nächstem Satz

if(playing){


restartTimeout=setTimeout(()=>{


playNext();


},1000);


}


}









function playNext(){


if(!playing){

return;

}



chooseItem();



setTimeout(()=>{


speakText();


},500);


}









function start(){


playing=true;



playButton.textContent="■";


radio.classList.add("playing");



startBackgroundSound();



playNext();


}









function stop(){


playing=false;



clearTimeout(restartTimeout);



playButton.textContent="▶";



radio.classList.remove("playing");

radio.classList.remove("talking");



speechSynthesis.cancel();



stopBackgroundSound();


}









playButton.onclick=()=>{


if(playing){

stop();

}

else{

start();

}


};









function changeChannel(direction){


channelIndex += direction;



if(channelIndex<0){

channelIndex=channels.length-1;

}



if(channelIndex>=channels.length){

channelIndex=0;

}



updateChannel();


}









prevButton.onclick=()=>{

changeChannel(-1);

};



nextButton.onclick=()=>{

changeChannel(1);

};









const speeds={


1:"2× SLOW",

2:"SLOW → FAST",

3:"SLOW → FAST → VERY FAST",

4:"2× FAST",

5:"FAST → VERY FAST",

6:"1× NATIVE"

};









level.oninput=()=>{


speedValue.textContent=speeds[level.value];



speechSynthesis.cancel();



clearTimeout(restartTimeout);



radio.classList.remove("talking");



// gleiche Phrase mit neuem Level

if(playing && current){


setTimeout(()=>{


speakText();


},300);


}


};









speedValue.textContent=speeds[level.value];


updateChannel();