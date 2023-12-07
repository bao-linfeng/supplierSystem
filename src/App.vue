<template>
  <div class="app-box">
    <SidebarModule v-show="!(navActive == '/' || navActive == '/bill' || navActive == '/catalogWorkloadSummary' || navActive == '/catalogSummary') && isShow" />
	  <Loading v-if="isLoading" />
    <router-view></router-view>
    <img class="menu" src="./assets/menu.svg" @click="isShow = !isShow" v-show="!(navActive == '/' || navActive == '/bill')" />
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, inject, toRefs } from 'vue'
import { useState, changePropertyValue, changeUserInfo } from './store';
import { createMsg, getValue, setValue } from './util/ADS';
import SidebarModule from './components/SidebarModule.vue';
import Loading from './components/Loading.vue';
import { useRoute, useRouter } from 'vue-router';
import { CN } from './language/CN.js';
import { EN } from './language/EN.js';

export default {
  components: {
    SidebarModule, Loading
  },
  setup(props, context) {
    const route = useRoute();
    const { navActive, isLoading } = toRefs(useState());

    const initSocketIO = () => {
      const socket = inject('socket');

      socket.on("returnGC", (data) => {
        console.log("returnGC", data);
        createMsg(data.log, true);
        new Notification('消息通知', {'body': data.log});
      });

      socket.on("disconnect", (reason) => {
        console.log(reason);
        if (reason === "io server disconnect") {
          socket.connect();
        }
      });
      
      socket.on("connect_error", (error) => {
        console.log(error);
      });
    }

    const getSysLang = () => {
      // let lang = navigator.language;
      // if(lang == 'zh-CN' || lang == 'zh-TW' || lang == 'zh-HK' || lang == 'zh-SG'){}
      let lan = navigator.language;
      console.log(lan);
      if(getValue('lanType')){
        lan = getValue('lanType');
      }else{
        // setValue('lanType', lan.indexOf('en') > -1 ? 'en' : 'zh');
      }

      if(lan.indexOf('zh') > -1){
        changePropertyValue('lan', CN);
        changePropertyValue('lanType', 'zh');
      }else if(lan.indexOf('en') > -1){
        changePropertyValue('lan', EN);
        changePropertyValue('lanType', 'en');
      }else{
        changePropertyValue('lan', CN);
        changePropertyValue('lanType', 'zh');
      }

    }

    const isShow = ref(false);
  
    onMounted(() => {
      if(window.innerWidth > 799){
        isShow.value = true;
      }
      // 统一登录消息接收
      window.addEventListener("message", (e) => {
        if (
          e.origin === "https://account.qingtime.cn" &&
          e.data.eventName === "redirect"
        ) {
          window.location.href = e.data.data;
        }
      }, false);
      getSysLang();
    });

    watch(() => route, (to, from) => {
      console.log(to.path);
      changePropertyValue('navActive', to.path);
    },{deep: true});

    return {
      state: useState(), navActive, isLoading, isShow, 
    }
  }
}
</script>

<style>
/* 阴影下伪类上显示before after */
*{
	padding:0;
	margin:0;
}
html{
  position: relative;
  width: 100%;
	height: 100%;
  font-family: 'PingFang SC','Source Han Sans CN','Microsoft Yahei';
	font-size: 14px;
  color: #333;
}
body {
  position: relative;
  width: 100%;
	height: 100%;
	font-size: 14px;
  -webkit-tap-highlight-color: transparent;
}
a{
	text-decoration: none;
  color: #358acd;
}
ul{
	list-style: none;
}
i{
  font-style: normal;
}
input,textarea{
  /* ios input、textarea上边框有阴影 */
  box-shadow:0px 0px 0px rgba(0,0,0,0); 
  -webkit-appearance:none;
  -webkit-tap-highlight-color:transparent;
  font-size: 14px;
}
.button{
  outline: none;
  border: none;
  cursor: pointer;
  width: 200px;
  height: 40px;
  line-height: 40px;
  border-radius: 20px;
  background: #358acd;
  color: #fff;
}
#app {
  position: relative;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  font-size: 16px;
}
.app-box{
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
}
input{
  width: 300px;
  height: 40px;
  line-height: 40px;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-indent: 10px;
  outline: none;
}
.marginB20{
  margin-bottom: 20px;
}
.msg_wrap{
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  display: block;
  background: #67c23a;
  padding: 5px 15px;
  border-radius: 3px;
  text-align: center;
  color: #333;
  min-width: 80px;
  z-index: 10000;
}
.msg_wrap_ok{
  background: #f0f9eb;
  color: #67c23a;
}
.msg_wrap_warn{
  background:#fdf6ec;
  color: #e6a23c;
}
:root{
  --bg-color:#000;
  --text-color:#87B940;
}
/* 设置input 文本框的 placeholder 的颜色 */
input::-webkit-input-placeholder{
  color:rgba(144,147,153,1);
}
/* 去除ios 手机端input输入框的内阴影 */
input{
  -webkit-appearance: none; 
}

/* 地图窗口 */
.map-infoWindow{
    position: relative;
    width: 725px;
    color: #000;
    font-size: 36px;
    display: block;
}
.map-infoWindow .cover{
    width: 100%;
    height: 335px;
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-size: cover;
}
.map-infoWindow .title{
    padding: 30px 45px 5px 45px;
    display: flex;
    align-items: center;
    font-size: 40px;
}
.map-infoWindow .title h3{
    font-size: 40px;
    font-weight: 500;
    line-height: 56px;
}
.map-infoWindow .title img{
    margin: 0 5px 0 15px;
}
.map-infoWindow .title span{
    color: #D62104;
}
.map-infoWindow .desc{
    margin: 0 45px 30px 45px;
    line-height: 54px;
}
/* 地图 */
.amap-info-content{
    padding: 0;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0px 2px 12px 0px rgba(231, 2, 2, 0.5);
    border-radius: 10px;
}
.amap-info-contentContainer.middle-right{
    padding-right: 24px;
}
.middle-right .amap-info-sharp{
    margin-top: -24px;
    border-top: 24px solid transparent;
    border-left: 24px solid #fff;
    border-bottom: 24px solid transparent;
}
.middle-right .amap-info-sharp:after{
    margin-top: -24px;
    margin-left: -24px;
    border-top: 24px solid transparent;
    border-left: 24px solid rgba(0,0,0,0.3);
    border-bottom: 24px solid transparent;
}
/* 滑条 */
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: transparent;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: transparent;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #888;
}
.style1::-webkit-scrollbar-corner{
	background-color: transparent;
}

.style2::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: transparent;
}
.style2::-webkit-scrollbar{
	height: 4px;
	background-color: transparent;
}
.style2::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #888;
}
.style2::-webkit-scrollbar-corner{
	background-color: transparent;
}
/* 楷体 */
.kaiti{
  font-family: 'Kaiti';
}
/* 姓氏分布 */
.adai_map_title{
  position: relative;
  height: 40px;
  line-height: 40px;
  border-radius: 20px;
  font-size: 20px;
  background: #A72A28;
}
.adai_map_title::after{
  position: absolute;
  top: 40px;
  left: 18px;
  content: '';
  width: 0;
  height: 0;
  border-top: 20px solid #A72A28;
  border-right: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-left: 20px solid transparent;
}
.adai_map_title_in{
  height: 40px;
  line-height: 40px;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.adai_map_name{
  color: #fff;
  display: block;
  padding: 0 10px;
  height: 40px;
  line-height: 40px;
}
.adai_map_percentage{
  width: 80px;
  display: block;
  padding: 0 10px;
  height: 40px;
  line-height: 40px;
  background: #fff;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  color: #A72A28;
}
.adai_title_wrap{
    position: relative;
    width: calc(100% - 20px);
    background: transparent;
    display: flex;
    padding: 40px 0;
}
.adai_title_wrap img{
    width: 68px;
    height: 68px;
    cursor: pointer;
    margin: 0 20px 0 36px;
}
.adai_title_box{
    color: #fff;
}
/* 地图 */
.adai_map_content{
  display: flex;
  padding: 46px 36px;
  font-size: 2.6rem;
}
.adai_map_content_cover{
  position: relative;
  width: 240px;
  height: 300px;
  background: #f1f1f1 url('./assets/jchcl/cover.jpg') 50% 50% no-repeat;
  background-size: cover;
  box-shadow: 0 0 0 1px #f1f1f1;
}
.adai_map_content_cover i{
  position: absolute;
  top: 70px;
  right: 80px;
  bottom: 45px;
  color: #fff;
  font-style: normal;
  font-size: 1.6rem;
  writing-mode:tb-rl;
  text-align: left;
  line-height: 20px;
  letter-spacing: 2px;
  display: block;
}
.adai_map_content_desc{
  width: 320px;
  color: #999;
  margin-left: 20px;
}
.adai_map_content_desc h3{
  margin-bottom: 20px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.adai_map_content_desc p{
  margin-bottom: 20px;
}
.adai_map_content_desc a{
  width: 240px;
  height: 70px;
  line-height: 70px;
  background: #9A7647;
  border-radius: 35px;
  display: inline-block;
  cursor: pointer;
  color: #fff;
  text-align: center;
}
.width260{
  width: 240px !important;
}
.menu{
  position: fixed;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 10000;
  height: 30px;
  display: none;
  background: #000;
}
@media screen  and (max-width: 799px){
  .menu{
    display: block;
  }
}
.w130{
    width: 130px !important;
}
.width180{
  width: 180px !important;
}

.select-position .select-trigger{
    position: absolute;
    z-index: 10000;
}
.red-color{
  color: #f00;
}
.el-table th, .el-table tr {
  background-color: #f5f7fa !important;
}
.is-scrolling-none .el-table th, .el-table tr {
  background-color: #fff !important;
}

</style>