class Soundboard {
  // mute flag
  #muteFlag = false;
  // playing flag
  #playing = false;
  // list of valid input commands
  #cmds;
  // volume of audioObjs
  #volume;
  // array of sound data and audio objects.
  #data = [];
  #audioObjs = [];

  constructor() {
    // setting list of valid cdms
    this.#cmds = [
      'playSound', 'delSound', 'setSound', 'setVol', 'getVol', 'getData',
      'reset', 'init', 'mute'
    ];
    // setting volume
    this.#volume = localStorage.getItem('vol');
    // setting sound data
    this.#data = JSON.parse(localStorage.getItem('data'));
    // setting up audio objects
    this.#data.forEach((datum, index) => {
      if (datum.sound != null) {
        this.#createAudioObj(datum.sound.number, index);
      } else {
        this.#audioObjs.push(null);
      }
    });
  }

  // private, creates audio object in audioObjs at provided index
  // using given file number to choose the source
  #createAudioObj(fileNum, index) {
      // creating filename from file number
      const filename = 'res/sound/VOI_EU_' +
        fileNum.toString().padStart(5, '0') +
        '.wav';
      // creating new audio, setting preload and volume
      const audioObj = new Audio(filename);
      audioObj.volume = this.#volume / 100;
      // set audioObj at index to the new audioObj
      this.#audioObjs[index] = audioObj;
  }
  
  // private, plays sound at an index passed here from input.
  async #playSound(audioIndex) {
    const audioObj = this.#audioObjs[audioIndex];
    const audioLen = audioObj.duration * 1000;
    if (audioObj != null) {
      await audioObj.play();
      this.#playing = true;
      await new Promise((resolve) => {
        setTimeout(() => {resolve()}, audioLen)
      }).then(()=>{this.#playing=false});
    }
  }

  // private, externally to set sounds insoundboard
  #setSound(data, index) {
    this.#data[index] = {"sound": data};
    this.#createAudioObj(data.number, index);
    this.#saveSounds();
  }
  // private, replaces sound info in array and
  // and the corresponding audioObj with null
  #deleteSound(index) {
    this.#data[index].sound = null;
    this.#audioObjs[index] = null;
    this.#saveSounds();
  }

  #setVolume(vol) {
    console.log(vol);
    console.log(this.#muteFlag);
    this.#volume = parseFloat(vol);
    if (!this.#muteFlag) localStorage.setItem('vol', this.#volume);
    this.#audioObjs.filter(obj => obj != null).forEach( obj =>
      obj.volume = this.#volume
    );
  }

  #mute() {
    this.#muteFlag = !this.#muteFlag;
    if (this.#muteFlag) {
      localStorage.setItem('lastVol', this.#volume);
      this.#setVolume(0);
    } else {
      const lastVol = localStorage.getItem('lastVol');
      this.#setVolume(lastVol);
    }
  }

  #getVolume() {
    return this.#volume;
  }
  #getData() {
    return this.#data;
  }

  // private, saves sound info array to local storage.
  #saveSounds() {
    localStorage.setItem('data', JSON.stringify(this.#data));
  }

  #reset() {
    localStorage.removeItem('data', 'vol');
  }

  // public, routes input according to commands
  // 'playSound', 'deleteSound', 'setSound', 'setVol', 'getVol', 'getData'
  input(cmd, ...args) {
    if (this.#cmds.includes(cmd)) {
      switch (cmd) {
        case 'playSound':
          return this.#playSound(args[0]);
        case 'delSound':
          this.#deleteSound(args[0]);
          break;
        case 'setSound':
          this.#setSound(args[0], args[1]);
          break;
        case 'setVol':
          this.#setVolume(args[0]);
          break;
        case 'getVol':
          return this.#getVolume();
        case 'getData':
          return this.#getData();
        case 'mute':
          this.#mute();
          break;
        case 'reset':
          this.#reset();
          break;
        default:
          console.log("Bad Command: " + cmd)
          break;
      }    
    }
  }
}

export { Soundboard };