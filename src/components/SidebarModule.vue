<template>
    <div class="sidebar-wrap" :style="{width: sidebarW+'px'}">
        <div class="sidebar-head">
            <div class="logo-box">
                <img class="logo" @click="goRouter('/')" src="../assets/logo.svg" alt="" />
                <p class="userName" @click="changeLan">{{userName}}</p>
                <span class="userRole">{{lan[role]}}</span>
            </div>
            <span class="orgName">{{userRole >= 1 && userRole <= 3 ? 'FS' : orgName == 'qingtimeFS' ? '' : orgName}}</span>
        </div>
        <ul class="sidebar-content style1">
            <li class="sidebar-li" :title="lan[item.name]" v-show="item.show" :class="{active: (['/monthGather', '/genealogyMonthReport'].indexOf(navActive) > -1 ? ['/monthGather', '/genealogyMonthReport'].indexOf(item.path) > -1 ? true : false : navActive === item.path) , small: item.isChild, textIndex: lanType == 'zh' && item.isChild}" @click="goRouter(item.path, item.child)" v-for="(item, index) in navList" :key="index">
                <img class="icon" v-if="item.icon" :src="item.icon" alt="">
                <span>{{lan[item.name]}}</span>
            </li>
        </ul>
        <div class="sidebar-foot">
            <img class="logout" @click="logout" src="../assets/logout.svg" alt="">
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { useState, changePropertyValue } from '../store';
import { useRoute, useRouter } from 'vue-router';
import supplier from '../assets/supplier.svg';
import contract from '../assets/contract.svg';
import imageReport from '../assets/imageReport.svg';
import balanceCenter from '../assets/balanceCenter.svg';
import sysCenter from '../assets/sysCenter.svg';
import { CN } from '../language/CN.js';
import { EN } from '../language/EN.js';
import { supplierMS, org } from '../util/api';

export default {
    props:{
        
    },
    name: 'sidebar',
    setup(props, context) {
        const { navActive, userName, userKey, orgKey, siteKey, userRole, admin, orgName, lan, lanType, sidebarW } = toRefs(useState());
        const router = useRouter();

        const navList = ref([
            {'name': '首页1', 'path': '/supplier', 'icon': supplier, 'show': true},
            {'name': '合同', 'path': '/contractManage', 'icon': contract, 'show': true},
            {'name': '家谱拍摄质量报告', 'path': '/imageReport', 'icon': imageReport, 'show': true, 'child': ['/genealogyStatistics', '/imageStatistics', '/deviceStatistics', '/monthGather', '/genealogyMonthReport', '/imageGather', '/yearGather', '/genealogyMonthReport','/imagesMonthReport']},
            {'name': '谱目查重明细', 'path': '/genealogyStatistics', 'isChild': true, 'show': true},
            {'name': '影像审核明细', 'path': '/imageStatistics', 'isChild': true, 'show': true},
            {'name': '查重月度汇总', 'path': '/monthGather', 'isChild': true, 'show': true},
            // {'name': '查重月度报告', 'path': '/genealogyMonthReport', 'isChild': true, 'show': true},
            {'name': '影像月度汇总', 'path': userRole.value >= 1 && userRole.value <= 3 ? '/imagesMonthReport' : '/imageGather', 'isChild': true, 'show': true},
            // {'name': '影像月度汇总', 'path': '/imagesMonthReport', 'isChild': true, 'show': true},
            // {'name': '拍摄数量汇总', 'path': '/deviceStatistics', 'isChild': true, 'show': true},
            {'name': '年度报告', 'path': '/yearGather', 'isChild': true, 'show': true},
            // {'name': '家谱索引质量报告', 'path': '/nodeReport', 'child': ['1'], 'show': true},
            {'name': '结算中心', 'path': '/balanceCenter', 'icon': balanceCenter, 'child': ['/boBeSettledVolumeList', '/takeCameraBillList'], 'show': true},
            {'name': '结算列表', 'path': '/boBeSettledVolumeList', 'isChild': true, 'show': true},
            {'name': '发票列表', 'path': '/takeCameraBillList', 'isChild': true, 'show': true},
            {'name': '系统中心', 'path': '/sysCenter', 'icon': sysCenter, 'child': ['/baseSet', '/orgList', '/billApprovalProcess', '/systemLog'], 'show': true},
            {'name': '机构列表', 'path': '/orgList', 'isChild': true, 'show': true},
            {'name': '基础设置', 'path': '/baseSet', 'isChild': true, 'show': true},
            {'name': '发票审批流程', 'path': '/billApprovalProcess', 'isChild': true, 'show': true},
            {'name': '系统日志', 'path': '/systemLog', 'isChild': true, 'show': true},
        ]);

        const addLog = async () => {
            const result = await supplierMS.addLog('退出', '退出', userKey.value, orgKey.value, siteKey.value);
        }

        const logout = () => {
            addLog();
            changePropertyValue('token', '');
            changePropertyValue('userKey', '');
            changePropertyValue('userName', '');
            changePropertyValue('profile', '');
            changePropertyValue('avatar', '');
            window.localStorage.clear();
            goRouter('/');
        }

        const goRouter = (path, child = []) => {
            if(!child.length){
                router.push(path);
            }else{
                navList.value.forEach((ele) => {
                    if(child.indexOf(ele.path) > -1){
                        if(userRole.value >= 1 && userRole.value <= 3){
                            ele.show = !ele.show;
                        }else{
                            if(pathList.indexOf(ele.path) > -1){

                            }else{
                                ele.show = !ele.show;
                            }
                        }
                    }
                });
            }
        }

        let pathList = ['/billApprovalProcess', '/genealogyMonthReport'];

        onMounted(() => {
            if(window.innerWidth < 799){
                navList.value = [
                    {'name': '首页1', 'path': '/supplier', 'icon': supplier, 'show': true},
                    // {'name': '合同', 'path': '/contractManage', 'icon': contract, 'show': true},
                    // {'name': '家谱拍摄质量报告', 'path': '/imageReport', 'icon': imageReport, 'show': true, 'child': ['/genealogyStatistics', '/imageStatistics', '/deviceStatistics', '/monthGather', '/imageGather', '/yearGather', '/genealogyMonthReport','/imagesMonthReport']},
                    // {'name': '谱目查重明细', 'path': '/genealogyStatistics', 'isChild': true, 'show': true},
                    // {'name': '影像审核明细', 'path': '/imageStatistics', 'isChild': true, 'show': true},
                    // {'name': '查重月度汇总', 'path': '/monthGather', 'isChild': true, 'show': true},
                    // // {'name': '查重月度报告', 'path': '/genealogyMonthReport', 'isChild': true, 'show': true},
                    // {'name': '影像月度汇总', 'path': '/imageGather', 'isChild': true, 'show': true},
                    // // {'name': '影像月度汇总', 'path': '/imagesMonthReport', 'isChild': true, 'show': true},
                    // // {'name': '拍摄数量汇总', 'path': '/deviceStatistics', 'isChild': true, 'show': true},
                    // {'name': '年度报告', 'path': '/yearGather', 'isChild': true, 'show': true},
                    // // {'name': '家谱索引质量报告', 'path': '/nodeReport', 'child': ['1'], 'show': true},
                    {'name': '结算中心', 'path': '/balanceCenter', 'icon': balanceCenter, 'child': ['/boBeSettledVolumeList', '/takeCameraBillList'], 'show': true},
                    // {'name': '结算列表', 'path': '/boBeSettledVolumeList', 'isChild': true, 'show': true},
                    {'name': '发票列表', 'path': '/takeCameraBillList', 'isChild': true, 'show': true},
                    // {'name': '系统中心', 'path': '/sysCenter', 'icon': sysCenter, 'child': ['/baseSet', '/orgList', '/billApprovalProcess', '/systemLog'], 'show': true},
                    // {'name': '机构列表', 'path': '/orgList', 'isChild': true, 'show': true},
                    // {'name': '基础设置', 'path': '/baseSet', 'isChild': true, 'show': true},
                    // {'name': '发票审批流程', 'path': '/billApprovalProcess', 'isChild': true, 'show': true},
                    // {'name': '系统日志', 'path': '/systemLog', 'isChild': true, 'show': true},
                ];
            }else{
                navList.value = [
                    {'name': '首页1', 'path': '/supplier', 'icon': supplier, 'show': true},
                    {'name': '合同', 'path': '/contractManage', 'icon': contract, 'show': true},
                    {'name': '家谱拍摄质量报告', 'path': '/imageReport', 'icon': imageReport, 'show': true, 'child': ['/genealogyStatistics', '/imageStatistics', '/deviceStatistics', '/monthGather', '/genealogyMonthReport', '/imageGather', '/yearGather', '/genealogyMonthReport','/imagesMonthReport']},
                    {'name': '谱目查重明细', 'path': '/genealogyStatistics', 'isChild': true, 'show': true},
                    {'name': '影像审核明细', 'path': '/imageStatistics', 'isChild': true, 'show': true},
                    {'name': '查重月度汇总', 'path': '/monthGather', 'isChild': true, 'show': true},
                    // {'name': '查重月度报告', 'path': '/genealogyMonthReport', 'isChild': true, 'show': true},
                    {'name': '影像月度汇总', 'path': userRole.value >= 1 && userRole.value <= 3 ? '/imagesMonthReport' : '/imageGather', 'isChild': true, 'show': true},
                    // {'name': '影像月度汇总', 'path': '/imagesMonthReport', 'isChild': true, 'show': true},
                    // {'name': '拍摄数量汇总', 'path': '/deviceStatistics', 'isChild': true, 'show': true},
                    {'name': '年度报告', 'path': '/yearGather', 'isChild': true, 'show': true},
                    // {'name': '家谱索引质量报告', 'path': '/nodeReport', 'child': ['1'], 'show': true},
                    {'name': '结算中心', 'path': '/balanceCenter', 'icon': balanceCenter, 'child': ['/boBeSettledVolumeList', '/takeCameraBillList', '/billMonthReport'], 'show': true},
                    {'name': '结算列表', 'path': '/boBeSettledVolumeList', 'isChild': true, 'show': true},
                    {'name': '发票列表', 'path': '/takeCameraBillList', 'isChild': true, 'show': true},
                    {'name': '发票清单', 'path': '/billMonthReport', 'isChild': true, 'show': true},
                    {'name': '系统中心', 'path': '/sysCenter', 'icon': sysCenter, 'child': ['/baseSet', '/orgList', '/billApprovalProcess', '/systemLog'], 'show': true},
                    {'name': '机构列表', 'path': '/orgList', 'isChild': true, 'show': true},
                    {'name': '基础设置', 'path': '/baseSet', 'isChild': true, 'show': true},
                    {'name': '发票审批流程', 'path': '/billApprovalProcess', 'isChild': true, 'show': true},
                    {'name': '系统日志', 'path': '/systemLog', 'isChild': true, 'show': true},
                ];
            }
            if(userRole.value >= 1 && userRole.value <= 2){
                role.value = '管理员';
            }else if(userRole.value == 3){
                role.value = '审核员';
            }else{
                if(admin.value == 'admin'){
                    role.value = '机构管理员';
                }
            }
            if(userRole.value >= 1 && userRole.value <= 3){
                navList.value.forEach((ele) => {
                    if(pathList.indexOf(ele.path) > -1){
                        ele.show = true;
                    }
                });
            }else{
                navList.value.forEach((ele) => {
                    if(pathList.indexOf(ele.path) > -1){
                        ele.show = false;
                    }
                });
            }
        });

        const role = ref('普通用户');
        watch(userRole, (nv, ov) => {
            if(nv >= 1 && nv <= 2){
                role.value = '管理员';
            }else if(nv == 3){
                role.value = '审核员';
            }else{
                if(admin.value == 'admin'){
                    role.value = '机构管理员';
                }
            }
            if(userRole.value >= 1 && userRole.value <= 3){
                navList.value.forEach((ele) => {
                    if(pathList.indexOf(ele.path) > -1){
                        ele.show = true;
                    }
                });
            }else{
                navList.value.forEach((ele) => {
                    if(pathList.indexOf(ele.path) > -1){
                        ele.show = false;
                    }
                });
            }
            navList.value = [
                {'name': '首页1', 'path': '/supplier', 'icon': supplier, 'show': true},
                {'name': '合同', 'path': '/contractManage', 'icon': contract, 'show': true},
                {'name': '家谱拍摄质量报告', 'path': '/imageReport', 'icon': imageReport, 'show': true, 'child': ['/genealogyStatistics', '/imageStatistics', '/deviceStatistics', '/monthGather', '/genealogyMonthReport', '/imageGather', '/yearGather', '/genealogyMonthReport','/imagesMonthReport']},
                {'name': '谱目查重明细', 'path': '/genealogyStatistics', 'isChild': true, 'show': true},
                {'name': '影像审核明细', 'path': '/imageStatistics', 'isChild': true, 'show': true},
                {'name': '查重月度汇总', 'path': '/monthGather', 'isChild': true, 'show': true},
                // {'name': '查重月度报告', 'path': '/genealogyMonthReport', 'isChild': true, 'show': true},
                {'name': '影像月度汇总', 'path': userRole.value >= 1 && userRole.value <= 3 ? '/imagesMonthReport' : '/imageGather', 'isChild': true, 'show': true},
                // {'name': '影像月度汇总', 'path': '/imagesMonthReport', 'isChild': true, 'show': true},
                // {'name': '拍摄数量汇总', 'path': '/deviceStatistics', 'isChild': true, 'show': true},
                {'name': '年度报告', 'path': '/yearGather', 'isChild': true, 'show': true},
                // {'name': '家谱索引质量报告', 'path': '/nodeReport', 'child': ['1'], 'show': true},
                {'name': '结算中心', 'path': '/balanceCenter', 'icon': balanceCenter, 'child': ['/boBeSettledVolumeList', '/takeCameraBillList', 'billMonthReport'], 'show': true},
                {'name': '结算列表', 'path': '/boBeSettledVolumeList', 'isChild': true, 'show': true},
                {'name': '发票列表', 'path': '/takeCameraBillList', 'isChild': true, 'show': true},
                {'name': '发票清单', 'path': '/billMonthReport', 'isChild': true, 'show': true},
                {'name': '系统中心', 'path': '/sysCenter', 'icon': sysCenter, 'child': ['/baseSet', '/orgList', '/billApprovalProcess', '/systemLog'], 'show': true},
                {'name': '机构列表', 'path': '/orgList', 'isChild': true, 'show': true},
                {'name': '基础设置', 'path': '/baseSet', 'isChild': true, 'show': true},
                {'name': '发票审批流程', 'path': '/billApprovalProcess', 'isChild': true, 'show': true},
                {'name': '系统日志', 'path': '/systemLog', 'isChild': true, 'show': true},
            ];
        });

        const changeLan = () => {
            changePropertyValue('lan', lanType.value == 'zh' ? EN : CN);
            changePropertyValue('lanType', lanType.value == 'zh' ? 'en' : 'zh');
        }

        return {
            navList, logout, goRouter, navActive, userName, role, orgName, userRole, lan, changeLan, lanType, sidebarW, 
        }
    }
}
</script>
<style lang="scss" scoped>
.sidebar-wrap{
    position: relative;
    width: 250px;
    height: 100%;
    background: #353d51;
    color: #fff;
}
.sidebar-head{
    position: relative;
    padding: 20px 0 10px 0;
    font-size: 12px;
    text-align: center;
    .logo-box{
        position: relative;
        height: 40px;
        display: inline-block;
    }
    .logo{
        height: 40px;
        cursor: pointer;
        background: #fff;
        display: inline-block;
    }
    .userName{
        position: absolute;
        top: 0px;
        left: 45px;
        width: 150px;
        text-align: left;
    }
    .userRole{
        position: absolute;
        top: 20px;
        left: 45px;
        width: 150px;
        text-align: left;
    }
    .orgName{
        display: block;
    }
}
.sidebar-content{
    position: relative;
    height: calc(100% - 132px);
    // text-indent: 20px;
    text-align: left;
    overflow-y: auto;
    .sidebar-li{
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        .icon{
            margin: 0 5px 0 10px;
        }
        &:hover{
            background: #414455;
        }
        &.active{
            border-left: 2px solid #4c95ff;
            background: #414455;
        }
        &.small{
            text-indent: 30px;
        }
        &.textIndex{
            text-indent: 30px;
        }
    }
}
.sidebar-foot{
    position: relative;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    .logout{
        cursor: pointer;
    }
}
@media screen  and (max-width: 799px){
    .sidebar-wrap{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 100;
    }
}
</style>