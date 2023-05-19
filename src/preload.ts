const ipcRenderer = require('electron').ipcRenderer;
const contextBridge = require('electron').contextBridge;

const audioElements: HTMLAudioElement[] = [];
const soundFilenames: string[] = [];
const characters: {abbr: string, name: string}[] = [
  {'abbr':'FM', 'name':'Fox McCloud'},
  {'abbr':'FL', 'name':'Falco Lombardi'},
  {'abbr':'PH', 'name':'Peppy Hare'},
  {'abbr':'ST', 'name':'Slippy Toad'},
  {'abbr':'R64', 'name':'ROB64'},
  {'abbr':'GP', 'name':'General Pepper'},
  {'abbr':'WO', 'name':'Wolf O\'Donnel'},
  {'abbr':'AO', 'name':'Andrew Oikonny'},
  {'abbr':'A', 'name':'Andross'},
  {'abbr':'B', 'name':'Bill'},
  {'abbr':'K', 'name':'Katt Munroe'}
];

window.addEventListener('DOMContentLoaded', (event) => {
  setupAudioDevices();
  fetchLocalData();
  setupSetSoundDiv();
  setupSounds();
  setupSoundboard();
});

const ipc = {
  'render': {
    'send': [
      'message:fromRender'
    ],
    'receive': [
      'message:toRender'
    ],
    'sendReceive': [
      'invoke:fromRender'
    ]
  }
};

contextBridge.exposeInMainWorld(
  'ipcRender', {
    send: (channel: string, args: string[]) => {
      let validChannels = ipc.render.send;
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, args);
      }
    },
    receive: (channel: string, listener: Function) => {
      let validChannels = ipc.render.receive;
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => listener(...args));
      }
    },
    invoke: (channel: never, args: string) => {
      let validChannels = ipc.render.sendReceive;
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, args);
      }
    }
  }
);

async function getSoundData() {
  return await ipcRenderer.invoke('invoke:fromRender', 'reqFileList');
}

async function setupSetSoundDiv() {
  let selectBtn = document.getElementById('soundSelBtn').addEventListener('click', (event) => {
    addSound();
  });

  let soundData = await getSoundData().then((result) => {
    return result;
  });

  let soundSel = document.getElementById('soundSel');

  for (let character of characters) {
    let headerOpt = document.createElement('option');
    headerOpt.setAttribute('disabled', 'true');
    headerOpt.innerText = character.name;
    soundSel.appendChild(headerOpt);
    for (let clipInfo of JSON.parse(soundData)) {
      if (character.abbr === clipInfo.character) {
        let clipOpt = document.createElement('option');
        clipOpt.setAttribute('value', clipInfo.number);
        clipOpt.value = clipInfo.number.toString();
        clipOpt.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;' + clipInfo.contents;
        soundSel.appendChild(clipOpt);
      }
    }
  }
}

function setupSoundboard() {
  let btns = <HTMLCollectionOf<HTMLButtonElement>>document.getElementsByClassName('soundBtn');
  for (let i = 0; i < btns.length; i++) {
    let btn = btns[i];
    btn.id=i.toString();
    audioElements.push(<HTMLAudioElement>btn.previousElementSibling)
    if (soundFilenames[i] != undefined) {
      
      btn.addEventListener('click', (event) => {
        audioElements[i].play().then(_ => {
          audioElements[i].pause();
        });
      });
    } else {
      btn.innerHTML = 'NONE';
      btn.addEventListener('click', (event) => {
        btn.disabled = true;
        btn.classList.add('selecting');
        document.getElementById('addSound').classList.remove('hidden');
      })
    }
  }
}

function setupSounds() {
  console.log('SetupSounds: ' + soundFilenames)
  for (let i = 0; i < soundFilenames.length; i++) {
    if (soundFilenames[i] != null) {
      console.log(soundFilenames[i]);
      let source = document.getElementById('sound' + i.toString());
      console.log(source);
      source.setAttribute('src', 'res/sound/' + soundFilenames[i]);
    }
  }
}

function addSound() {
  let select = <HTMLSelectElement>document.querySelector('#soundSel');
  let opt = <HTMLOptionElement>select.options[select.selectedIndex];
  let btn = <HTMLButtonElement>document.getElementsByClassName('selecting').item(0);
  let clipId = 'VOI_EU_' + opt.value.padStart(5, '0') + '.wav';
  btn.previousElementSibling.children.item(0).setAttribute('src', clipId);
  btn.disabled = false;
  btn.innerText = select.options[select.selectedIndex].innerText;
  let btnId = <unknown>btn.id;
  let btnNum = <number>btnId;
  audioElements[<number>btnNum-1] = <HTMLAudioElement>btn.previousElementSibling;
  document.getElementById('addSound').classList.add('hidden');
  localStorage.setItem('sound' + ((btnNum-1).toString()), clipId);
}

function fetchLocalData() {
  for (let i = 0; i < 16; i++) {
    let fileName: string = localStorage.getItem('sound' + i.toString());
    soundFilenames[i] = fileName;
  }
  console.log(soundFilenames);
}

async function setupAudioDevices() {
  let audioDevs = await navigator.mediaDevices.enumerateDevices();
  for (let devInfo of audioDevs) {
    if (devInfo.kind === 'audiooutput' && devInfo.deviceId === 'default') {
      for ( let i = 0; i < audioElements.length; i++) {
        let mediaElem = <HTMLMediaElement>audioElements[i];
        await mediaElem.setSinkId(devInfo.deviceId);
      }
    }
  }
}