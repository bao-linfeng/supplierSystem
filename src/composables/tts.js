import { ref, onMounted, reactive } from 'vue'

export default function TTS(){
    const isTTS = ref(-1);
    const toggleTTS = (data) =>{
        switch(isTTS.value){
            case 0:
                window.speechSynthesis.pause();
                break;
            case 1:
                window.speechSynthesis.resume();
                break;
            default:
                TTS(data.replace(/<\/?.+?>/g,""));
                break;
        }
    }
    const TTS = (data) =>{
        window.synth ? window.speechSynthesis.cancel() : window.synth = new window.SpeechSynthesisUtterance();
        window.synth.text = data.toString().replace(/[\&nbsp\;,：]/g,''); 
        window.speechSynthesis.speak(window.synth);
        window.synth.onstart = () => {
            console.log('tts is start');
            isTTS.value = 0;
        }
        window.synth.onpause = () => {
            console.log('tts is pause');
            isTTS.value = 1;
        }
        window.synth.onresume = () => {
            console.log('tts is resume');
            isTTS.value = 0;
        }
        window.synth.onend = () => {
            console.log('tts is end');
            isTTS.value = -1;
        }
    }

    return {
        toggleTTS, isTTS
    }
}