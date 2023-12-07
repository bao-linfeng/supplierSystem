<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <h3>{{lan['年度报告']}}</h3>
            <div class="head-right">
                <div class="chart-box" @click="isChart = true">
                    <span>{{lan['图表展示']}}</span>
                    <img src="../assets/chart.svg" alt="">
                </div>
                <!-- <el-date-picker
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    :start-placeholder="lan['开始时间']"
                    :end-placeholder="lan['结束时间']"
                /> -->
                <el-date-picker
                    class="w130"
                    v-model="startTime"
                    type="month"
                    :placeholder="lan['开始时间']">
                </el-date-picker>
                <el-date-picker
                    class="w130"
                    v-model="endTime"
                    type="month"
                    :placeholder="lan['结束时间']">
                </el-date-picker>
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="org-select" :placeholder="lan['机构筛选']">
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
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
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
        <EchartsModule v-if="isChart" :title="title" :subtitle="subtitle+' '+orgName" :chartData="chartData" :stackArea="true" v-on:close="isChart = false" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, getCurrentMonthZero, getDays, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import ChartModule from '../components/ChartModule.vue';
import EchartsModule from '../components/EchartsModule.vue';

export default {
    components: {
        ChartModule, EchartsModule, 
    },
    name: 'yearGather',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV = ref(['年度月份', '机构名称', '目标拍数', '通过拍数', '拍数达标率(%)', '应支付总金额', '预算达标率', '完结谱目数', '编目完结谱目数', '可索引谱目数']);
        const parameterV = ref(['englishName', 'orgName', 'taskNumberO', 'passImageCountO', 'passImageCountP', 'paidInAmountO', 'budgetP', 'passGCCountO', 'GCOverCountO', 'IndexGCCountO']);

        const orgList = ref([]);
        const orgKeyN = ref('');
        const orgName = ref('');
        const time = ref('');
		const startTime = ref(Date.now() - 1000*60*60*24*30*11);
		const endTime = ref(Date.now());
        const tbody = ref([]);
        const chartData = ref({'labels': [], 'data': [], 'label': []});
        const getDataList = async () => {
			changePropertyValue('isLoading', true);
            const result = await supplierMS.supplierImageAmount({
                "siteKey": "1528234980", 
                'orgKey': orgKeyN.value,
                'startTime': startTime.value ? new Date(startTime.value).getTime() : '',
                'endTime': endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '',
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.data.map((ele, i) => {
                    if(!ele.year){
                        ele.englishName = lan.value['合计'];
                    }else{
                        ele.englishName = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
                        ele.orgName = ele.orgName ? ele.orgName : '全部机构';
                        if(!i){
                            ele.taskNumberC = ele.taskNumber;
                            ele.passImageCountC = ele.passImageCount;
                        }else{
                            ele.taskNumberC = ele.taskNumber + result.data[i - 1].taskNumberC;
                            ele.passImageCountC = ele.passImageCount + result.data[i - 1].passImageCountC;
                        }
                    }
                    
                    ele.passImageCountP = ele.taskNumber ? (100*((ele.passImageCount || 0)/ele.taskNumber)).toFixed(2)+'%' : '0%';
                    ele.budgetP = ele.paidInAmount ? (100*((ele.budget || 0)/ele.paidInAmount)).toFixed(2)+'%' : '0%';

                    ele.taskNumberO = thousands(ele.taskNumber);
                    ele.passImageCountO = thousands(ele.passImageCount);
                    ele.paidInAmountO = '$'+thousands(ele.paidInAmount || 0);
                    ele.passGCCountO = thousands(ele.passGCCount);
                    ele.GCOverCountO = thousands(ele.GCOverCount);
                    ele.IndexGCCountO = thousands(ele.IndexGCCount);

                    return ele;
                });

                console.log(tbody.value);

                let chartDataO = {'labels': [], 'data': [], 'dataCount': [], 'label': [lan.value['目标拍数'], lan.value['通过拍数']]}, taskNumberArr = [], passImageCountArr = [], taskNumberC = [], passImageCountC = [];
                tbody.value.forEach((ele, i) => {
                    if(ele.englishName == lan.value['合计']){

                    }else{
                        chartDataO.labels.push(ele.englishName); 
                        taskNumberArr.push(ele.taskNumber || 0);
                        passImageCountArr.push(ele.passImageCount || 0);
                        taskNumberC.push(ele.taskNumberC);
                        passImageCountC.push(ele.passImageCountC);
                    }
                });
                chartDataO.data.push(taskNumberArr); 
                chartDataO.data.push(passImageCountArr); 
                chartDataO.dataCount.push(taskNumberC);
                chartDataO.dataCount.push(passImageCountC);
                chartData.value = chartDataO;
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

        watch(time, (nv, ov) => {
            if(nv){
                startTime.value = new Date(nv[0]).getTime();
                endTime.value = new Date(nv[1]).getTime();
            }else{
                startTime.value = Date.now() - 1000*60*60*24*30*6;
                endTime.value = Date.now();
            }
        });

        watch(orgKeyN, (nv, ov) => {
            orgList.value.forEach((ele) => {
                if(ele.value == nv){
                    orgName.value = nv ? ele.label : '';
                }
            });
        });

        const isChart = ref(false);
        const title = ref(lan.value['年度报告']);
        const subtitle = ref('');
        watch(startTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });
        watch(endTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });

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

        return {
            theadV, parameterV, tbody, getDataList, time, orgList, orgKeyN, isChart, 
			chartData, orgName, userRole, lan, sidebarW, startTime, endTime, title, subtitle,
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