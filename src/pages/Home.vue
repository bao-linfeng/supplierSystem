<template>
    <div class="home-wrap">
        <div class="home-box">
            <img class="logo" src="../assets/supplierManage.svg" alt="" />
            <img class="jiapu" src="../assets/jiapu.png" alt="" />
            <img class="login" @click="login" src="../assets/login.svg" alt="" />
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

export default {
    components: {
        
    },
    name: 'home',
    props: ['id'],
    setup(props, context) {
        const { token, origin, userKey, siteKey, orgKey, userRole, admin, lanType } = toRefs(useState());
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
            }else{
                createMsg(result.msg);
            }
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

                if(orgList.value.indexOf(orgKey.value) > -1){
                    router.push(bid.value ? '/takeCameraBillDetail?id='+bid.value : '/supplier');
                }else{
                    if(userRole.value >= 1 && userRole.value <= 3){
                        router.push(bid.value ? '/takeCameraBillDetail?id='+bid.value : '/supplier');
                    }else{
                        isShow.value = 1;
                        router.push('/');
                    }
                }
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
            console.log(`https://account.qingtime.cn?apphigh=26&logo=https://cdn.qingtime.cn/supplierSystem.svg&redirect=${origin.value}${bid.value ? '?bid='+bid.value+'&locales='+(lanType.value == 'en' ? 'en' : 'zh') : '?locales='+(lanType.value == 'en' ? 'en' : 'zh')}`);
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
                if(orgList.value.indexOf(orgKey.value) > -1){
                    router.push(bid.value ? '/takeCameraBillDetail?id='+bid.value : '/supplier');
                }else{
                    if(userRole.value >= 1 && userRole.value <= 3){
                        router.push(bid.value ? '/takeCameraBillDetail?id='+bid.value : '/supplier');
                    }else{
                        isShow.value = 1;
                    }
                }
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
            login, token, isShow, close, 
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
    display: flex;
    justify-content: center;
    align-items: center;
}
.home-box{
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    .login{
        position: absolute;
        top: calc(50% + 148px);
        right: 709px;
        cursor: pointer;
    }
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
</style>