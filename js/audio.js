import day from "./day.js";
import renderer from "./renderer.js";
var audio;
(function (audio) {
    var listener;
    let gestured = false;
    audio.cardboard = [
        './assets/sound/cardboard/cardboard_box_impact_hard1.wav',
        './assets/sound/cardboard/cardboard_box_impact_hard2.wav',
        './assets/sound/cardboard/cardboard_box_impact_hard3.wav',
        './assets/sound/cardboard/cardboard_box_impact_hard4.wav',
        './assets/sound/cardboard/cardboard_box_impact_hard5.wav',
        './assets/sound/cardboard/cardboard_box_impact_hard6.wav',
        './assets/sound/cardboard/cardboard_box_impact_hard7.wav',
        './assets/sound/cardboard/cardboard_box_impact_soft1.wav',
        './assets/sound/cardboard/cardboard_box_impact_soft2.wav',
        './assets/sound/cardboard/cardboard_box_impact_soft3.wav',
        './assets/sound/cardboard/cardboard_box_impact_soft4.wav',
        './assets/sound/cardboard/cardboard_box_impact_soft5.wav',
        './assets/sound/cardboard/cardboard_box_impact_soft6.wav',
        './assets/sound/cardboard/cardboard_box_impact_soft7.wav',
    ];
    audio.sounds = {};
    function gesture() {
        if (gestured)
            return;
        load();
        gestured = true;
    }
    audio.gesture = gesture;
    function boot() {
        day.day_instructions.addEventListener('click', function () {
            console.log('create gesture');
            gesture();
        });
    }
    audio.boot = boot;
    function load() {
        listener = new THREE.AudioListener();
        renderer.camera.add(listener);
        console.log('audio load');
        let loads = [];
        loads = loads.concat(audio.cardboard);
        const loader = new THREE.AudioLoader();
        for (let path of loads) {
            let filename = path.replace(/^.*[\\/]/, '');
            filename = filename.split('.')[0];
            console.log(filename);
            audio.sounds[filename] = new THREE.PositionalAudio(listener);
            loader.load(path, function (buffer) {
                audio.sounds[filename].setBuffer(buffer);
            });
        }
    }
    audio.load = load;
    function playOnce(id, volume = 1) {
        let sound = audio.sounds[id];
        //console.log(sound);
        if (!sound || sound.isPlaying)
            return;
        sound.setLoop(false);
        sound.setVolume(volume);
        sound.play();
        return sound;
    }
    audio.playOnce = playOnce;
})(audio || (audio = {}));
export default audio;
