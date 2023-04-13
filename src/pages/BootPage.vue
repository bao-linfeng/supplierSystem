<template>
    <div class="home-wrap">
        <div class="section section-5">
            <div class="content-left">
                <img class="marker marker-1" src="../assets/BootPage/marker.png" alt="">
                <img class="marker marker-2" src="../assets/BootPage/marker.png" alt="">
                <img class="marker marker-3" src="../assets/BootPage/marker.png" alt="">
                <img class="marker marker-4" src="../assets/BootPage/marker.png" alt="">
                <img class="marker marker-5" src="../assets/BootPage/marker.png" alt="">
                <img class="marker marker-6" src="../assets/BootPage/marker.png" alt="">
                <img class="marker marker-7" src="../assets/BootPage/marker.png" alt="">
                <img class="marker marker-8" src="../assets/BootPage/marker.png" alt="">
                <img class="marker marker-9" src="../assets/BootPage/marker.png" alt="">
            </div>
            <div class="content-right">
                <img v-show="lanType != 'en'" class="logo-big" src="../assets/BootPage/logo_big.png" alt="">
                <img class="logo" :class="{active: lanType == 'en'}" :src="lanType == 'en' ? logo_en : logo" alt="">
                <p class="summary">{{lan['本功能为 一家谱 平台提供资源统一管理入口']}}</p>
                <img class="btn" @click="login" :src="lanType == 'en' ? btn_en : btn" alt="">
                <span class="note">{{lan['注：平台仅供专业伙伴使用']}}</span>
            </div>
            <div class="foot-box">
                <p>{{lan['技术支持 江苏时光信息科技有限公司']}}</p>
            </div>
            <Fireworks />
        </div>
        <div class="msg-box" v-show="isShow">
            <h3 class="title">提示</h3>
            <p>您还不是FS微站的下属机构, 无权进入该网页!</p>
            <img class="close" @click="close" src="../assets/close.svg" alt="">
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, setValue, getValue, createMsg } from '../util/ADS';
import { user, org, supplierMS } from '../util/api';
import Fireworks from '../components/Fireworks.vue';
import logo from '../assets/BootPage/logo_text.png';
import btn from '../assets/BootPage/btn.png';
import logo_en from '../assets/BootPage/logo_en.svg';
import btn_en from '../assets/BootPage/btn_en.png';

export default {
    components: {
        Fireworks
    },
    name: 'home',
    props: ['id'],
    setup(props, context) {
        const { token, origin, userKey, siteKey, orgKey, userRole, admin, lan, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;
        // console.log(token.value);

        const userAndStarInfoAndRole = async (t) => {
            changePropertyValue('isLoading', true);
            const result = await user.userAndStarInfoAndRole(t, '1528234450');
            if(result.statusCode == 200){
                let data = result.result;
                setValue('userRole', data.role);
                changePropertyValue('userRole', data.role);

                changePropertyValue('token', t);
                changePropertyValue('userKey', data.userInfo._key);
                changePropertyValue('userName', data.userInfo.profile.trueName || data.userInfo.profile.nickName);
                changePropertyValue('profile', data.userInfo.profile);
                changePropertyValue('avatar', data.userInfo.profile.avatar || '');
                setValue('token', t);
                setValue('userKey', data.userInfo._key);
                setValue('userName', data.userInfo.profile.trueName || data.userInfo.profile.nickName);
                setValue('profile', JSON.stringify(data.userInfo.profile));
                setValue('avatar', data.userInfo.profile.avatar || '');

                getOrgMemberInfo(data.userInfo._key);

                saveUser(data.role || 99, t, data.userInfo._key, data.userInfo.profile.trueName || data.userInfo.profile.nickName, data.userInfo.mobile, data.starInfo._key, data.starInfo.name, data.starInfo.cover, data.userInfo.profile && data.userInfo.profile.avatar, data.starInfo.ownerKey);
            }else{
                createMsg(result.msg);
                changePropertyValue('isLoading', false);
                close();
            }
        }

        const saveUser = async (userRole, token, userKey, userName, mobile, siteKey, siteName, siteLogo, userAvatar, rooterId) => {
            let data = await user.saveUser(userRole, token, userKey, userName, mobile, siteKey, siteName, siteLogo, userAvatar, rooterId);
        }

        const getOrgMemberInfo = async (userKey) => {
            const result = await org.getOrgMemberInfo(siteKey.value, userKey);
            changePropertyValue('isLoading', false);
            if(result.status == 200){
                setValue('orgKey', result.data.orgKey || 'qingtimeFS');
                changePropertyValue('orgKey', result.data.orgKey || 'qingtimeFS');
                setValue('orgName', result.data.orgName || 'qingtimeFS');
                changePropertyValue('orgName', result.data.orgName || 'qingtimeFS');
                setValue('admin', result.data.role);
                changePropertyValue('admin', result.data.role);

                addLog();

                if((userRole.value >= 1 && userRole.value <= 3) || admin.value == 'admin'){
                    router.push(bid.value ? '/takeCameraBillDetail?id='+bid.value : '/supplier');
                }else{
                    isShow.value = 1;
                    router.push('/');
                }

                // if(orgList.value.indexOf(orgKey.value) > -1){
                //     router.push(bid.value ? '/takeCameraBillDetail?id='+bid.value : '/supplier');
                // }else{
                //     if(userRole.value >= 1 && userRole.value <= 3){
                //         router.push(bid.value ? '/takeCameraBillDetail?id='+bid.value : '/supplier');
                //     }else{
                //         isShow.value = 1;
                //         router.push('/');
                //     }
                // }
            }else{
                createMsg(result.msg);
            }
        }

        const addLog = async () => {
            const result = await supplierMS.addLog('登录', '登录', userKey.value, orgKey.value, siteKey.value);
        }

        const isShow = ref(0);
        const bid = ref('');
        const orgList = ref(['2187183288', '2187183289', '2187183290', '2208058639', '2211052198', '2212434208', '2212506938', '2213544386']);

        onMounted(() => {
            const TOKEN = getQueryVariable('token');
            bid.value = getQueryVariable('bid');
            if(TOKEN){
                userAndStarInfoAndRole(TOKEN);
            }
        });

        const openLogin = () =>{
            window.open(
                `https://account.qingtime.cn?apphigh=26&logo=https://cdn.qingtime.cn/supplierSystem.svg&redirect=${origin.value}${bid.value ? '?bid='+bid.value+'&locales='+(lanType.value == 'en' ? 'en' : 'zh') : '?locales='+(lanType.value == 'en' ? 'en' : 'zh')}`,
                "new",
                `width=360, height=560, resizable=false, toolbar=no, menubar=no, location=no, status=no, top=${
                (screen.height - 560) / 2
                }, left=${(screen.width - 360) / 2}`
            );
        }

        const login = () => {
            if(token.value){
                if((userRole.value >= 1 && userRole.value <= 3) || admin.value == 'admin'){
                    router.push(bid.value ? '/takeCameraBillDetail?id='+bid.value : '/supplier');
                }else{
                    isShow.value = 1;
                    router.push('/');
                }
                // if(orgList.value.indexOf(orgKey.value) > -1){
                //     router.push(bid.value ? '/takeCameraBillDetail?id='+bid.value : '/supplier');
                // }else{
                //     if(userRole.value >= 1 && userRole.value <= 3){
                //         router.push(bid.value ? '/takeCameraBillDetail?id='+bid.value : '/supplier');
                //     }else{
                //         isShow.value = 1;
                //     }
                // }
            }else{
                openLogin();
            }
        }

        const close = () => {
            changePropertyValue('token', '');
            changePropertyValue('userKey', '');
            changePropertyValue('userName', '');
            changePropertyValue('profile', '');
            changePropertyValue('avatar', '');
            window.localStorage.clear();
            isShow.value = 0;
        };

        return {
            login, token, isShow, close, lan, lanType, logo, btn, logo_en, btn_en,
        }
    }
}
</script>

<style lang="scss" scoped>
.home-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    color: #333;
    font-size: 16px;
    text-align: center;
    background: url('../assets/bg.png') 50% 50% no-repeat;
    background-size: cover;
}
.msg-box{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border-radius: 10px;
    padding: 50px 100px;
    .title{
        margin-bottom: 20px;
    }
    .close{
        position: absolute;
        top: 20px;
        right: 20px;
        background: #000;
        cursor: pointer;
    }
}

.section{
    position: relative;
    width: 100%;
    height: 100%;
    color: #fff;
}
.section-5{
    background: #000 url('../assets/BootPage/bg.png') 50% 100% no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
    .content-left{
        position: relative;
        width: 1100px;
        height: 530px;
        background: url('../assets/BootPage/map.png') 50% 50% no-repeat;
        background-size: cover;
        .marker{
            position: absolute;
            animation: scale12 3s infinite alternate;
            &.marker-1{
                top: -30px;
                left: 116px;
                height: 38px;
                opacity: 0.3;
            }
            &.marker-2{
                top: 149px;
                left: 149px;
                height: 52px;
                opacity: 0.5;
            }
            &.marker-3{
                top: 50px;
                left: 302px;
                height: 60px;
                opacity: 0.6;
            }
            &.marker-4{
                top: 370px;
                left: 322px;
                height: 68px;
                opacity: 0.6;
            }
            &.marker-5{
                top: 240px;
                left: 453px;
                height: 75px;
            }
            &.marker-6{
                top: 32px;
                left: 670px;
                height: 45px;
                opacity: 0.8;
            }
            &.marker-7{
                top: 148px;
                left: 743px;
                height: 45px;
                opacity: 0.2;
            }
            &.marker-8{
                top: 289px;
                left: 790px;
                height: 90px;
                opacity: 0.4;
            }
            &.marker-9{
                top: 6px;
                left: 910px;
                height: 98px;
                opacity: 0.3;
            }
        }
    }
    .content-right{
        text-align: left;
        margin-left: 50px;
        .logo-big{
            display: block;
            height: 50px;
            margin-bottom: 15px;
        }
        .logo{
            height: 75px;
            &.active{
                height: auto;
                width: 200px;
            }
        }
        .summary{
            margin: 5px 0 20px 0;
            font-size: 14px;
        }
        .btn{
            height: 50px;
            cursor: pointer;
            margin-bottom: 10px;
            display: block;
        }
        .note{
            height: 48px;
            margin-left: 20px;
            font-size: 8px;
        }
    }
    .foot-box{
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
    }
}
@keyframes scale12{
    from{
        transform: scale(0.7);
    }
    to{
        transform: scale(1);
    }
}

@media screen  and (max-width: 1500px) and (min-width: 1400px){
    .section-5{
        .content-left{
            width: 825px;
            height: 398px;
            .marker{
                &.marker-1{
                    top: -22px;
                    left: 87px;
                    height: 28px;
                }
                &.marker-2{
                    top: 111px;
                    left: 111px;
                    height: 39px;
                }
                &.marker-3{
                    top: 37px;
                    left: 226px;
                    height: 45px;
                }
                &.marker-4{
                    top: 277px;
                    left: 241px;
                    height: 51px;
                }
                &.marker-5{
                    top: 180px;
                    left: 339px;
                    height: 56px;
                }
                &.marker-6{
                    top: 24px;
                    left: 502px;
                    height: 33px;
                }
                &.marker-7{
                    top: 111px;
                    left: 557px;
                    height: 33px;
                }
                &.marker-8{
                    top: 216px;
                    left: 592px;
                    height: 67px;
                }
                &.marker-9{
                    top: 5px;
                    left: 682px;
                    height: 74px;
                }
            }
        }
        .content-right{
            margin-left: 30px;
            .logo{
                height: 50px;
                &.active{
                    height: auto;
                    width: 200px;
                }
            }
            .btn{
                height: 30px;
            }
            .note{
                font-size: 8px;
            }
        }
        .foot-box{
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 8px;
        }
    }
}
@media screen  and (max-width: 1399px) and (min-width: 800px){
    .section-5{
        .content-left{
            width: 825px;
            height: 398px;
            .marker{
                &.marker-1{
                    top: -22px;
                    left: 87px;
                    height: 28px;
                }
                &.marker-2{
                    top: 111px;
                    left: 111px;
                    height: 39px;
                }
                &.marker-3{
                    top: 37px;
                    left: 226px;
                    height: 45px;
                }
                &.marker-4{
                    top: 277px;
                    left: 241px;
                    height: 51px;
                }
                &.marker-5{
                    top: 180px;
                    left: 339px;
                    height: 56px;
                }
                &.marker-6{
                    top: 24px;
                    left: 502px;
                    height: 33px;
                }
                &.marker-7{
                    top: 111px;
                    left: 557px;
                    height: 33px;
                }
                &.marker-8{
                    top: 216px;
                    left: 592px;
                    height: 67px;
                }
                &.marker-9{
                    top: 5px;
                    left: 682px;
                    height: 74px;
                }
            }
        }
        .content-right{
            margin-left: 30px;
            .logo{
                height: 50px;
                &.active{
                    height: auto;
                    width: 200px;
                }
            }
            .btn{
                height: 30px;
            }
            .note{
                font-size: 8px;
            }
        }
        .foot-box{
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 8px;
        }
    }
}
@media screen  and (max-width: 799px){
    .section-5{
        .content-left{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .content-right{
            z-index: 10;
        }
    }
    .msg-box{
        padding: 20px 50px;
        width: calc(100% - 140px);
        z-index: 100;
        box-shadow: 0 0 1px 2px #ddd;
    }
}
</style>