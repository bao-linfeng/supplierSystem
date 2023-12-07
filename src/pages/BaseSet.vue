<template>
    <div class="pages-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="pages-head">
            <div class="head-left">
                <h3 class="title">{{lan['基础设置']}}</h3>
            </div>
        </div>
        <div class="pages-content" v-show="admin != 'admin'">
            <div class="base-wrap">
                <div class="base-head">
                    <h3>{{lan['拍机单价设置']}}</h3>
                    <el-button v-if="userRole >= 1 && userRole <= 2" type="primary" @click="openData(1)">{{lan['新增']}}</el-button>
                </div>
                <div class="base-content style1">
                    <table class="table">
                        <thead class="thead">
                            <tr>
                                <th>{{lan['年度']}}</th>
                                <th>{{lan['单双拍']}}</th>
                                <th>{{lan['影像类别']}}</th>
                                <th>{{lan['单价']}}</th>
                                <th>{{lan['机构']}}</th>
                                <th v-if="userRole >= 1 && userRole <= 3">{{lan['操作']}}</th>
                            </tr>
                        </thead>
                        <tbody class="tbody">
                            <tr v-for="(item, index) in takeCameraPriceList" :key="index">
                                <td>{{item.year}}</td>
                                <td>{{item.singleOrTwoO}}</td>
                                <td>{{item.isLeadImagesO}}</td>
                                <td>{{item.priceO}}</td>
                                <td>{{item.name}}</td>
                                <td v-if="userRole >= 1 && userRole <= 2">
                                    <button class="btn marginR10" @click="editData(item, 1)">{{lan['编辑']}}</button>
                                    <button class="btn" @click="deleteData(item._key, 1)">{{lan['删除']}}</button>
                                </td>
                            </tr>
                            <tr v-if="!takeCameraPriceList.length">
                                <td :colspan="userRole >= 1 && userRole <= 2 ? 5 : 4">{{lan['暂无数据']}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="pages-foot">
            <div class="base-wrap">
                <div class="base-head">
                    <h3>{{lan['年度任务设置']}}</h3>
                    <el-button v-if="userRole >= 1 && userRole <= 2" type="primary" @click="openData(2)">{{lan['新增']}}</el-button>
                </div>
                <div class="base-content style1">
                    <table class="table">
                        <thead class="thead">
                            <tr>
                                <th>{{lan['年度']}}</th>
                                <th>{{lan['机构名称']}}</th>
                                <th>{{lan['总拍数']}}</th>
                                <th>{{lan['年度预算']}}</th>
                                <th v-if="userRole >= 1 && userRole <= 2">{{lan['操作']}}</th>
                            </tr>
                        </thead>
                        <tbody class="tbody">
                            <tr v-for="(item, index) in yearTaskList" :key="index">
                                <td>{{item.year}}</td>
                                <td>{{item.name}}</td>
                                <td>{{item.taskNumberT}}</td>
                                <td>{{item.annualBudgetT}}</td>
                                <td v-if="userRole >= 1 && userRole <= 2">
                                    <button class="btn marginR10" @click="editData(item, 2)">{{lan['编辑']}}</button>
                                    <button class="btn" @click="deleteData(item._key, 2)">{{lan['删除']}}</button>
                                </td>
                            </tr>
                            <tr v-if="!yearTaskList.length">
                                <td :colspan="userRole >= 1 && userRole <= 2 ? 4 : 3">{{lan['暂无数据']}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <EditTakeCameraPrice v-if="isShow == 1" :detail="detail" v-on:close="saveData" />
        <EditYearTask v-if="isShow == 2" :detail="detail" v-on:close="saveData" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import EditTakeCameraPrice from '../components/EditTakeCameraPrice.vue';
import EditYearTask from '../components/EditYearTask.vue';

export default {
    components: {
        EditTakeCameraPrice, EditYearTask, 
    },
    name: 'baseSet',
    props: ['id'],
    setup(props, context) {
        const { token, userKey, siteKey, orgKey, admin, userRole, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const takeCameraPriceList = ref([]);
        const yearTaskList = ref([]);

        const detail = ref({});
        const isShow = ref(0);

        const getPrice = async () => {
            const result = await supplierMS.getPrice();
            if(result.status == 200){
                takeCameraPriceList.value = result.data.map((ele) => {
                    ele.name = lanType.value == 'en' ? ele.englishName : ele.orgName;
                    ele.singleOrTwoO = ele.singleOrTwo == 1 ? lan.value['单拍'] : ele.singleOrTwo == 2 ? lan.value['双拍'] : '';
                    ele.isLeadImagesO = ele.isLeadImages == 1 ? lan.value['电子谱'] : lan.value['纸谱'];
                    ele.priceO = '$'+ele.price;
                    return ele;
                });
            }else{
                
            }
        }

        const getOrgTask = async () => {
            const result = await supplierMS.getOrgTask(userRole.value >= 1 && userRole.value <= 3 ? '' : orgKey.value);
            if(result.status == 200){
                yearTaskList.value = result.data.map((ele) => {
                    ele.name = lanType.value == 'en' ? ele.englishName : ele.orgName;
                    ele.organizationNo = ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '';
                    ele.taskNumberT = thousands(ele.taskNumber);
                    ele.annualBudgetT = thousands(ele.annualBudget);
                    return ele;
                });
            }else{
                
            }
        }

        const deletePrice = async (priceKey) => {
            const result = await supplierMS.deletePrice(priceKey);
            if(result.status == 200){
                getPrice();
            }else{
                
            }
        }

        const deleteOrgTask = async (taskKey) => {
            const result = await supplierMS.deleteOrgTask(taskKey);
            if(result.status == 200){
                getOrgTask();
            }else{
                
            }
        }

        const saveData = (data) => {
            isShow.value = 0;
            if(data == 1){
                getPrice();
            }
            if(data == 2){
                getOrgTask();
            }
        }

        const editData = (data, t) => {
            detail.value = data;
            isShow.value = t;
        }

        const deleteData = (k, t) => {
            if(confirm(lan.value['确认删除该条数据吗？'])){
                if(t == 1){
                    deletePrice(k);
                }
                if(t == 2){
                    deleteOrgTask(k);
                }
            }
        }

        const openData = (t) => {
            isShow.value = t;
            detail.value = {};
        }

        onMounted(() => {
            getPrice();
            getOrgTask();
        });

        return {
            takeCameraPriceList, detail, isShow, saveData, yearTaskList, editData, deleteData, userRole, openData, lan, 
            sidebarW, admin,
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
    height: calc(50% - 40px);
}
.pages-foot{
    position: relative;
    width: 100%;
    height: calc(50% - 40px);
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
    border: 1px solid #ddd;
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