<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <div class="head-left">
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="routeType" class="width100">
                    <el-option v-for="item in routeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
                <h3 v-else>{{lan['查重月度汇总']}}</h3>
            </div>
            
            <div class="head-right">
                <el-radio-group class="marginR10" v-model="isFileTime">
                    <el-radio :label="false">{{lan['导入时间']}}</el-radio>
                    <el-radio :label="true">{{lan['档案时间']}}</el-radio>
                </el-radio-group>
                <!-- <el-checkbox class="marginR10" v-model="isFileTime">档案时间检索</el-checkbox> -->
                <div class="chart-box" @click="isChart = true">
                    <span>{{lan['图表展示']}}</span>
                    <img src="../assets/chart.svg" alt="">
                </div>
                <el-date-picker
                    class="width100"
                    v-model="startTime"
                    type="month"
                    :placeholder="lan['开始时间']">
                </el-date-picker>
                <el-date-picker
                    class="width100"
                    v-model="endTime"
                    type="month"
                    :placeholder="lan['结束时间']">
                </el-date-picker>
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="width100" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
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
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index" :class="{active: item.englishName == '数据汇总'}">
                        <td :class="{active: parameterList.indexOf(item2) > -1 && item.englishName != '汇总数据'}" v-for="(item2, index2) in parameterV" :key="'parameter_'+index2" @click="handleClickCell(item, item2)">
                            <div v-if="item2 === 'action'">
                                
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
        <!-- <ChartModule v-if="isChart" :year="Date.now()" :orgName="orgName" :chartData="chartData" v-on:close="isChart = false" /> -->
        <EchartsModule v-if="isChart" :title="title" :subtitle="subtitle+' '+orgName" :chartData="chartData" v-on:close="isChart = false" />
        <GenealogyListModule v-if="isShow == 1" :timeStr="timeStr" :condition="condition" :orgKeyN="orgKeyN" :orgName="orgName"  v-on:close="isShow = 0" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg, getCurrentMonthZero, getDays, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import ChartModule from '../components/ChartModule.vue';
import EchartsModule from '../components/EchartsModule.vue';
import GenealogyListModule from '../components/GenealogyListModule.vue';

export default {
    components: {
        ChartModule, GenealogyListModule, EchartsModule, 
    },
    name: 'monthGather',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV = ref(['月數據', '机构名称', '提交谱数', '可拍摄谱数', '重复谱数', '待议谱数', '无效谱数', '作废谱数', '完结数', '可拍率', '重复率', '待议谱率', '无效谱率', '作废谱率','完结率']);
        const parameterV = ref(['englishName', 'orgName', 'totalNumberT', 'nfNumberT', 'duplicateNumberT', 'toBeRediscussedNummberT', 'invalidNumberT', 'cancelNumberT', 'finishNumberT','passRateO', 'notPassRateO', 'toBeRediscussedNummberO', 'invalidNumberO', 'cancelNumberO','finishNumberO']);

        const orgList = ref([]);
        const orgKeyN = ref('');
        const orgName = ref('');
		const startTime = ref(Date.now() - 1000*60*60*24*30*11);
		const endTime = ref(Date.now());
        const chartData = ref({'labels': [], 'data': [], 'label': []});
        const tbody = ref([]);
        const getDataList = async () => {
            if(!startTime.value){
                return createMsg('请选择开始时间');
            }
            if(!endTime.value){
                return createMsg('请选择结束时间');
            }
            tbody.value = [];
			changePropertyValue('isLoading', true);
            const result = await supplierMS.getMonthlySummary(new Date(startTime.value).getTime(), new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1, orgKeyN.value, siteKey.value, isFileTime.value ? 2: 1);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.data.map((ele) => {

                    if(ele.englishName == '数据汇总'){
                        ele.englishName = lan.value[ele.englishName];
                    }else{
                        ele.englishName = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
                    }
                    
                    ele.orgName = ele.orgName ? ele.orgName : '全部机构';
                    ele.organizationNo = orgKeyN.value ? ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '' : '全部机构';
                    ele.passRateO = ele.nfNumber ? ((ele.nfNumber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    ele.notPassRateO = ele.duplicateNumber ? ((ele.duplicateNumber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    ele.toBeRediscussedNummberO = ele.toBeRediscussedNummber ? ((ele.toBeRediscussedNummber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    ele.invalidNumberO = ele.invalidNumber ? ((ele.invalidNumber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    ele.finishNumberO = ele.finishNumber ? ((ele.finishNumber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    ele.cancelNumberO = ele.cancelNumber ? ((ele.cancelNumber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';

                    ele.nfNumberT = thousands(ele.nfNumber);
                    ele.duplicateNumberT = thousands(ele.duplicateNumber);
                    ele.toBeRediscussedNummberT = thousands(ele.toBeRediscussedNummber);
                    ele.invalidNumberT = thousands(ele.invalidNumber);
                    ele.finishNumberT = thousands(ele.finishNumber);
                    ele.cancelNumberT = thousands(ele.cancelNumber);
                    ele.totalNumberT = thousands(ele.totalNumber);

                    return ele;
                });

                let chartDataO = {
                    'labels': [], 
                    'data': [], 
                    'label': [
                        lan.value['提交谱数'], 
                        lan.value['可拍摄谱数'], 
                        lan.value['重复谱数'], 
                        lan.value['待议谱数'], 
                        lan.value['无效谱数'], 
                        lan.value['作废谱数'], 
                        lan.value['完结数']]
                    }, allNumber = [], passNumber = [], duplicateNumber = [], toBeRediscussedNummber = [], invalidNumber = [], cancelNumber = [], finishNumber = [];

                tbody.value.forEach((ele) => {
                    if(ele.englishName == '数据汇总'){

                    }else{
                        chartDataO.labels.push(ele.englishName); 
                        allNumber.push(ele.totalNumber);
                        passNumber.push(ele.nfNumber);
                        duplicateNumber.push(ele.duplicateNumber);
                        toBeRediscussedNummber.push(ele.toBeRediscussedNummber);
                        invalidNumber.push(ele.invalidNumber);
                        cancelNumber.push(ele.cancelNumber);
                        finishNumber.push(ele.finishNumber);
                    }
                });
                chartDataO.data.push(allNumber); 
                chartDataO.data.push(passNumber); 
                chartDataO.data.push(duplicateNumber); 
                chartDataO.data.push(toBeRediscussedNummber); 
                chartDataO.data.push(invalidNumber); 
                chartDataO.data.push(cancelNumber); 
                chartDataO.data.push(finishNumber); 
                chartData.value = chartDataO;
            }else{
                createMsg(result.msg);
            }
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

        watch(orgKeyN, (nv, ov) => {
            orgList.value.forEach((ele) => {
                if(ele.value == nv){
                    orgName.value = nv ? ele.label : '';
                }
            });
        });

        const isChart = ref(false);

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){

            }else{
                orgKeyN.value = orgKey.value;
            }
            
            startTime.value = getCurrentMonthZero();
            endTime.value = getCurrentMonthZero(0);
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);

            getOrgList();
            getDataList();
        });

        const routeList = ref([{'label': '按谱类型汇总', 'value': '/monthGather'}, {'label': '按机构汇总', 'value': '/genealogyMonthReport'}]);
        const routeType = ref('/monthGather');
        watch(routeType, (nv, ov) => {
            router.push(nv);
        });

        const timeStr = ref('');
        const condition = ref('');
        const isShow = ref(0);
        const parameterList = ref(['totalNumber', 'nfNumber', 'duplicateNumber', 'toBeRediscussedNummber', 'invalidNumber']);
        const handleClickCell = (data1, data2) => {
            if(parameterList.value.indexOf(data2) > -1 && data1.englishName != '数据汇总'){
                timeStr.value = data1.englishName;
                condition.value = data2 == 'totalNumber' ? '' : data2 == 'nfNumber' ? 'nf' : data2 == 'duplicateNumber' ? 'd' : data2 == 'toBeRediscussedNummber' ? 'm': data2 == 'invalidNumber' ? 'r' : '';
                isShow.value = 1;
            }
        }

        const isFileTime = ref(false);
        watch(isFileTime, () => {
            getDataList();
        });

        const title = ref(lan.value['查重月度汇总']);
        const subtitle = ref('');
        watch(startTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });
        watch(endTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });

        return {
            theadV, parameterV, tbody, getDataList, orgList, orgKeyN, isChart, chartData, orgName, userRole, startTime, endTime, lan, 
            sidebarW, routeList, routeType, handleClickCell, parameterList, isShow, timeStr, condition, isFileTime, title, subtitle,
        }
    }
}
</script>

<style lang="scss" scoped>
.contract-wrap{
    position: relative;
    width: calc(100% - 200px);
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
        .chart-box{
            display: flex;
            align-items: center;
            cursor: pointer;
            margin-right: 10px;
            img{
                height: 30px;
                margin-left: 5px;
            }
        }
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
                position: sticky;
                bottom: 0;
                background: #DBE6CC;
                font-weight: bold;
            }
            td{
                padding: 15px 0;
                min-width: 80px;
                border: 1px solid #ddd;
                &.active{
                    cursor: pointer;
                }
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
.width100{
    width: 120px !important;
}
</style>