<template>
    <div class="pages-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="pages-head">
            <div class="head-left">
                <h3 class="title">{{lan['发票审批流程']}}</h3>
            </div>
            <el-button v-if="userRole >= 1 && userRole <= 3" type="primary" @click="openData(1)">{{lan['新增']}}</el-button>
        </div>
        <div class="pages-content style1">
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th>{{lan['审批序号']}}</th>
                        <th>{{lan['节点名称']}}</th>
                        <th>{{lan['审批人']}}</th>
                        <th>{{lan['审批金额']}}</th>
                        <th>{{lan['电子邮箱']}}</th>
                        <th v-if="userRole >= 1 && userRole <= 3">{{lan['操作']}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in dataList" :key="index">
                        <td>{{item.approvalNo}}</td>
                        <td>{{item.nodeName}}</td>
                        <td>{{item.userName}}</td>
                        <td>{{item.amountO}}</td>
                        <td>{{item.email}}</td>
                        <td v-if="userRole >= 1 && userRole <= 3">
                            <button class="btn marginR10" @click="editData(item, 1)">{{lan['编辑']}}</button>
                            <button class="btn" @click="deleteData(item._key, 1)">{{lan['删除']}}</button>
                        </td>
                    </tr>
                    <tr v-if="!dataList.length">
                        <td :colspan="userRole >= 1 && userRole <= 3 ? 5 : 4">{{lan['暂无数据']}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <EditBillAP v-if="isShow == 1" :detail="detail" :n="dataList.length" v-on:close="saveData" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import EditBillAP from '../components/EditBillAP.vue';

export default {
    components: {
        EditBillAP,
    },
    name: 'billApprovalProcess',
    props: ['id'],
    setup(props, context) {
        const { token, userKey, siteKey, orgKey, admin, userRole, lan, sidebarW } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const dataList = ref([]);

        const detail = ref({});
        const isShow = ref(0);

        const getApprovalUser = async () => {
            const result = await supplierMS.getApprovalUser(siteKey.value);
            if(result.status == 200){
                dataList.value = result.data.map((ele) => {
                    ele.amountO = ele.amount ? '$'+thousands(ele.amount) : '';
                    return ele;
                });
            }else{
                createMsg(result.msg);
            }
        }

        const deleteApprovalUser = async (priceKey) => {
            const result = await supplierMS.deleteApprovalUser(priceKey);
            if(result.status == 200){
                getApprovalUser();
            }else{
                createMsg(result.msg);
            }
        }

        const saveData = (data) => {
            isShow.value = 0;
            if(data){
                getApprovalUser();
            }
        }

        const editData = (data, t) => {
            detail.value = data;
            isShow.value = t;
        }

        const deleteData = (k, t) => {
            if(confirm(lan.value['删除流程节点会导致审核中的发票状态异常，确认删除该条数据吗？'])){
                if(t == 1){
                    deleteApprovalUser(k);
                }
            }
        }

        const openData = (t) => {
            isShow.value = t;
            detail.value = {};
        }

        onMounted(() => {
            getApprovalUser();
        });

        return {
            dataList, detail, isShow, saveData, editData, deleteData, userRole, openData, lan, sidebarW, 
        }
    }
}
</script>

<style lang="scss" scoped>
.pages-wrap{
    position: relative;
    width: calc(100% - 240px);
    height: 100%;
    color: #333;
    padding: 0 20px;
}
.pages-head{
    position: relative;
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .head-left{
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
    }
}
.pages-content{
    position: relative;
    width: 100%;
    height: calc(100% - 80px);
    overflow-y: auto;
}
.pages-foot{
    position: relative;
    width: 100%;
    height: calc(100% - 80px);
}
.base-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    .base-head{
        position: relative;
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .base-content{
        position: relative;
        width: 100%;
        height: calc(100% - 50px);
        overflow-y: auto;
    }
}
.table{
    position: relative;
    width: 100%;
    max-height: 100%;
    text-align: center;
    border: none;
    border-collapse: collapse;
    color: #000;
    .thead{
        position: relative;
        width: 100%;
        height: 40px;
        background: #f5f7fa;
        color: #909399;
        position: sticky;
        top: 0;
        z-index: 2;
        tr{
            th{
                padding: 5px 0;
                min-width: 80px;
                border: 1px solid #ddd;
            }
        }
    }
    .tbody{
        position: relative;
        width: 100%;
        height: calc(100% - 42px);
        font-size: 14px;
        tr{

            &:nth-of-type(even){
                background: #F2F2F2;
            }
            &:hover{
                background: #DBE6CC;
            }
            &.active{
                .qingtime-check-box{
                    background: #358acd;
                }
            }
            &.red{
                color: #f00;
            }
            td{
                padding: 15px 0;
                min-width: 80px;
                border: 1px solid #ddd;
            }
        }
    }
    .btn{
        padding: 0 10px;
        width: auto;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        background: #358acd;
        color: #fff;
        outline: none;
        border: none;
        cursor: pointer;
        border-radius: 3px;
        &.disabled{
            background: #ddd;
            cursor: default;
        }
    }
    .marginR10{
        margin: 0 5px;
    }
}
</style>