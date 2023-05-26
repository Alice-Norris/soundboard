const { ipcRenderer, contextBridge } = require('electron');

// holds authorized channel names
const authChannels = {
    'send': [
      'message:fromRender'
    ],
    'receive': [
      'message:toRender'
    ],
    'sendReceive': [
      'invoke:fromRender'
    ]
};

const ipcMessenger = {
  sendMsg: function(channel, msg) {
    if (authChannels.send.includes(channel)) {
      ipcRenderer.send(channel, msg)
    }
  },
  receiveMsg: function(channel, listener) {
    if (authChannels.receive.includes(channel)) {
      ipcRenderer.on(channel, (event, req, data) => listener(event, req, data));
    }
  },
  invokeMsg: function(channel, msg) {
    if (authChannels.sendReceive.includes(channel)) {
      return ipcRenderer.invoke(channel, msg)
    }
  }
};



// {
//   sendMsg(channel: string, args: string[]) {
//     if (authChannels.send.includes(channel)) {
//       ipcRenderer.send(channel, args);
//     }
//   }
//   receiveMsg(channel: string, listener: CallableFunction) {
//     if (authChannels.receive.includes(channel)) {
//       ipcRenderer.on(channel, () => listener());
//     }
//   }
//   invokeMsg(channel: string, args: string[]) {
//     if (authChannels.sendReceive.includes(channel)) {
//       return ipcRenderer.invoke(channel, args);
//     }
//   }
// }
contextBridge.exposeInMainWorld('Messenger', ipcMessenger);

// async function setupSetSoundDiv() {
//   document.getElementById('soundSelBtn').addEventListener('click', () => {
//     addSound();
//   });

//   const soundDataArr = JSON.parse(await ipcRenderer.invoke('invoke:fromRender', 'reqFileList'));
//   const soundSel = document.getElementById('soundSel');

//   for (const character of characters) {
//     const headerOpt = document.createElement('option');
//     headerOpt.setAttribute('disabled', 'true');
//     headerOpt.innerText = character.name;
//     soundSel.appendChild(headerOpt);
//     const soundDataFilter: soundData[] = soundDataArr.filter((soundData: soundData) => {
//       if (soundData.character === character.abbr) return soundData;
//     })
//     for (const clipInfo of soundDataFilter) {   
//       const clipOpt = document.createElement('option');
//       clipOpt.setAttribute('value', clipInfo.number.toString());
//       clipOpt.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;' + clipInfo.contents;
//       soundSel.appendChild(clipOpt);
//     }
//   }
// }

// function setupSoundboard() {
//   const btns = <HTMLCollectionOf<HTMLButtonElement>>document.getElementsByClassName('soundBtn');
//   for (let i = 0; i < btns.length; i++) {
//     const btn = btns[i];
//     if (soundFilenames[i] != undefined) {
//       btn.addEventListener('click', async () => {
//         await audioElements[i].play();
//       });
//     } else {
//       btn.innerHTML = 'NONE';
//       btn.addEventListener('click', () => {
//         btn.disabled = true;
//         btn.classList.add('selecting');
//         document.getElementById('addSound').classList.remove('hidden');
//       })
//     }
//   }
// }

// function setupSounds() {
//   console.log('SetupSounds: ' + soundFilenames)
//   for (let i = 0; i < soundFilenames.length; i++) {
//     if (soundFilenames[i] != null) {
//       console.log(soundFilenames[i]);
//       const source = document.getElementById('sound' + i.toString());
//       console.log(source);
//       source.setAttribute('src', 'res/sound/' + soundFilenames[i]);
//     }
//   }
// }

// function addSound() {
//   const select = <HTMLSelectElement>document.querySelector('#soundSel');
//   const opt = <HTMLOptionElement>select.options[select.selectedIndex];
//   const btn = <HTMLButtonElement>document.getElementsByClassName('selecting').item(0);
//   const clipId = 'VOI_EU_' + opt.value.padStart(5, '0') + '.wav';
//   btn.previousElementSibling.children.item(0).setAttribute('src', clipId);
//   btn.disabled = false;
//   btn.innerText = select.options[select.selectedIndex].innerText;
//   const btnId = <unknown>btn.id;
//   const btnNum = <number>btnId;
//   audioElements[<number>btnNum-1] = <HTMLAudioElement>btn.previousElementSibling;
//   document.getElementById('addSound').classList.add('hidden');
//   localStorage.setItem('sound' + ((btnNum-1).toString()), clipId);
// }

// function setupData() {
//   const audioElems = document.getElementsByTagName('audio')
//   for (let i = 0; i < 16; i++) {
//     const audioElem = audioElems.item(i);
//     const fileName: string = localStorage.getItem('sound' + i.toString());
//     soundFilenames[i] = fileName;
//     if (fileName) {
//       audioElem.setAttribute('preload', 'auto');
//       audioElem.firstElementChild.setAttribute('src', './res/sound/'+fileName )
//     }
//     audioElements.push(audioElems.item(i));
//   }
//   console.log(soundFilenames);
// }