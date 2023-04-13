<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <h3>{{lan['谱目查重明细']}}</h3>
            <div class="head-right">
                <el-date-picker
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    :start-placeholder="lan['开始时间']"
                    :end-placeholder="lan['结束时间']"
                />
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="org-select" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="handleSearch">{{lan['检索']}}</el-button>
            </div>
        </div>
        <div class="contract-content style1">
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV" :key="'thead_'+index">{{lan[item]}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index">
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
                            <div v-if="item2 === 'action'">
                                <button class="button btn">下载</button>
                            </div>
                            <i v-else>{{item2 == 'orgName' ? lan[item[item2]] : item[item2]}}</i>
                        </td>
                    </tr>
                    <tr v-if="!tbody.length">
                        <td :colspan="parameterV.length">{{lan['暂无数据']}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <PaginationModule :defaultPage="page" :pages="pages" :total="total" v-on:change-page="changePage" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';

export default {
    components: {
        PaginationModule,
    },
    name: 'genealogyStatistics',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(30);

        const theadV = ref(['文件标题', '机构名称', '审核人', '日期', '提交谱数', '可拍摄谱数', '重复谱数', '待议谱数', '无效谱数', '可拍率', '重复率', '待议谱率']);
        const parameterV = ref(['fileName', 'orgName', 'checkUserName', 'createTimeO', 'totalNumber', 'nfNumber', 'duplicateNumber', 'toBeRediscussedNummber', 'invalidNumber', 'passRateO', 'notPassRateO', 'toBeRediscussedNummberO']);

        const orgList = ref([]);
        const orgKeyN = ref('');
        const startTime = ref(Date.now() - 1000*60*60*24*30*6);
        const endTime = ref(Date.now());
        const time = ref('');
        const getGcVerifyDetail = async (f = true) => {
			changePropertyValue('isLoading', true);
            const result = await supplierMS.getGcVerifyDetail(orgKeyN.value, siteKey.value, startTime.value, endTime.value, page.value , limit.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let totalNumber = 0, nfNumber = 0, duplicateNumber = 0, toBeRediscussedNummber = 0, invalidNumber = 0;
                tbody.value = result.data.list.map((ele) => {
                    totalNumber = totalNumber + ele.totalNumber;
                    nfNumber = nfNumber + ele.nfNumber;
                    duplicateNumber = duplicateNumber + ele.duplicateNumber;
                    toBeRediscussedNummber = toBeRediscussedNummber + ele.toBeRediscussedNummber;
                    invalidNumber = invalidNumber + ele.invalidNumber;

					ele.organizationNo = ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '';
                    ele.createTimeO = ele.createTime ? getLocalTime(ele.createTime, '-', 1) : '';
                    ele.passRateO = ele.nfNumber ? ((ele.nfNumber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    ele.notPassRateO = ele.duplicateNumber ? ((ele.duplicateNumber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    ele.toBeRediscussedNummberO = ele.toBeRediscussedNummber ? ((ele.toBeRediscussedNummber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    return ele; 
                });
                tbody.value.push({'fileName': lan.value['本页小计'], 'toBeRediscussedNummberO': toBeRediscussedNummber ? ((toBeRediscussedNummber/totalNumber)*100).toFixed(2)+'%' : '0.00%', 'passRateO': nfNumber ? ((nfNumber/totalNumber)*100).toFixed(2)+'%' : '0.00%', 'notPassRateO': duplicateNumber ? ((duplicateNumber/totalNumber)*100).toFixed(2)+'%' : '0.00%', 'totalNumber': totalNumber, 'nfNumber': nfNumber, 'duplicateNumber': duplicateNumber, 'toBeRediscussedNummber': toBeRediscussedNummber, 'invalidNumber': invalidNumber});
                pages.value = result.data.pageNum;
                total.value = result.data.total;
                f ? gcVerifyDetailTotal() : null; 
            }
        }

        const gcVerifyDetailTotal = async () => {
            const result = await supplierMS.gcVerifyDetailTotal(orgKeyN.value, siteKey.value, startTime.value, endTime.value, page.value , limit.value);
            if(result.status == 200){
                let data = result.data;
                tbody.value.push({'fileName': lan.value['汇总统计'], 'toBeRediscussedNummberO': data.toBeRediscussedNummber ? ((data.toBeRediscussedNummber/data.totalNumber)*100).toFixed(2)+'%' : '0.00%', 'passRateO': data.nfNumber ? ((data.nfNumber/data.totalNumber)*100).toFixed(2)+'%' : '0.00%', 'notPassRateO': data.duplicateNumber ? ((data.duplicateNumber/data.totalNumber)*100).toFixed(2)+'%' : '0.00%', 'totalNumber': data.totalNumber, 'nfNumber': data.nfNumber, 'duplicateNumber': data.duplicateNumber, 'toBeRediscussedNummber': data.toBeRediscussedNummber, 'invalidNumber': data.invalidNumber});
            }
        }

        const handleSearch = () => {
            getGcVerifyDetail();
        }

        const getOrgList = async () => {
            const result = await org.getOrgList(siteKey.value, '');
            if(result.status == 200){
                orgList.value = result.data.map((ele) => {
                    ele.label = lanType.value == 'en' ? ele.organizationNo : ele.name;
                    ele.value = ele._key;
                    return ele;
                });
                orgList.value.unshift({'label': lan.value['全部机构'], 'value': ''});
            }
        }

        watch(time, (nv, ov) => {
            if(nv){
                startTime.value = new Date(nv[0]).getTime();
                endTime.value = new Date(nv[1]).getTime();
            }else{
                startTime.value = Date.now() - 1000*60*60*24*30*6;
                endTime.value = Date.now();
            }
            
        });

        const changePage = (i) => {
            page.value = i;
            getGcVerifyDetail(false);
        }

        const tbody = ref([]);

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){

            }else{
                orgKeyN.value = orgKey.value;
            }
            getOrgList();
            handleSearch();
        });

        return {
            page, pages, total, theadV, parameterV, tbody, getGcVerifyDetail, 
            changePage, time, orgList, orgKeyN, userRole, lan, sidebarW, handleSearch,  
        }
    }
}
</script>

<style lang="scss" scoped>
.contract-wrap{
    position: relative;
    width: calc(100% - 250px);
    height: 100%;
    color: #333;
}
.contract-head{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .head-right{
        display: flex;
        align-items: center;
    }
}
.contract-content{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: calc(100% - 100px);
    overflow-y: auto;
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
        background: #D1D1D1;
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
        &.disabled{
            background: #ddd;
            cursor: default;
        }
    }
    .marginR10{
        margin: 0 5px;
    }
}
.marginR10{
    margin-right: 10px;
}
</style>