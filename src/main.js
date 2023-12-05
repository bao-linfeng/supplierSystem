import { createApp,readonly } from 'vue'
import App from './App.vue'
import router from './router'
import { stateSymbol, state, changePropertyValue } from './store';
import i18nPlugin from './plugins/i18n';
import SocketIO from './plugins/io';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app= createApp(App);

const i18nStrings = {
    'greetings': {
        hi: 'Hallo!'
    }
}

app.use(i18nPlugin, i18nStrings);


let baseURL='https://pumudata.qingtime.cn';
baseURL = 'https://genealogydatatest.qingtime.cn';

if(window.location.origin.indexOf('suppliersys.1jiapu.com') > -1){
    baseURL = 'https://genealogydata.1jiapu.com';
}

app.use(SocketIO, {
    debug: true,
    connection: baseURL,
});

app.use(ElementPlus, {
    locale: localStorage.getItem('lanType') ? localStorage.getItem('lanType') == 'zh' ? ElementPlusLocaleZhCn : '' : navigator.language.indexOf('en') > -1 ? '' : ElementPlusLocaleZhCn,
});

app.directive('focus', {
    mounted(el) {
        el.focus()
    }
})

app.use(router);
app.provide(stateSymbol, readonly(state));

app.mount('#app')
