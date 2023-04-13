<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <h3>{{lan['查重月度汇总']}}</h3>
            <div class="head-right">
                <div class="chart-box" @click="isChart = true">
                    <span>{{lan['图表展示']}}</span>
                    <img src="../assets/chart.svg" alt="">
                </div>
                <el-date-picker
                    v-model="startTime"
                    type="month"
                    :placeholder="lan['开始时间']">
                </el-date-picker>
                <el-date-picker
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
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index">
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
                            <div v-if="item2 === 'action'">
                                
                            </div>
                            <i v-else>{{item[item2]}}</i>
                        </td>
                    </tr>
                    <tr v-if="!tbody.length">
                        <td :colspan="parameterV.length">{{lan['暂无数据']}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <ChartModule v-if="isChart" :year="Date.now()" :orgName="orgName" :chartData="chartData" v-on:close="isChart = false" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import ChartModule from '../components/ChartModule.vue';

export default {
    components: {
        ChartModule, 
    },
    name: 'monthGather',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV = ref(['月數據', '机构名称', '提交谱数', '可拍摄谱数', '重复谱数', '待议谱数', '无效谱数','可拍率', '重复率', '待议谱率', '无效谱率']);
        const parameterV = ref(['englishName', 'organizationNo', 'totalNumber', 'nfNumber', 'duplicateNumber', 'toBeRediscussedNummber', 'invalidNumber', 'passRateO', 'notPassRateO', 'toBeRediscussedNummberO', 'invalidNumberO']);

        const orgList = ref([]);
        const orgKeyN = ref('');
        const orgName = ref('');
        const time = ref('');
		const startTime = ref(Date.now() - 1000*60*60*24*30*11);
		const endTime = ref(Date.now());
        const chartData = ref({'labels': [], 'data': [], 'label': []});
        const tbody = ref([]);
        const getDataList = async () => {
			changePropertyValue('isLoading', true);
            const result = await supplierMS.getMonthlySummary(new Date(startTime.value).getTime(), new Date(endTime.value).getTime(), orgKeyN.value, siteKey.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.data.map((ele) => {

                    if(ele.englishName == '数据汇总'){
                        ele.englishName = lan.value[ele.englishName];
                    }else{
                        ele.englishName = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
                    }
                    
                    ele.organizationNo = orgKeyN.value ? ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '' : '全部机构';
                    ele.passRateO = ele.nfNumber ? ((ele.nfNumber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    ele.notPassRateO = ele.duplicateNumber ? ((ele.duplicateNumber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    ele.toBeRediscussedNummberO = ele.toBeRediscussedNummber ? ((ele.toBeRediscussedNummber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    ele.invalidNumberO = ele.invalidNumber ? ((ele.invalidNumber/ele.totalNumber)*100).toFixed(2)+'%' : '0.00%';
                    return ele;
                });

                let chartDataO = {'labels': [], 'data': [], 'label': [lan.value['提交谱数'], lan.value['可拍摄谱数'], lan.value['重复谱数']]}, allNumber = [], passNumber = [], notPassNumber = [];
                tbody.value.forEach((ele) => {
                    if(ele.englishName == '数据汇总'){

                    }else{
                        chartDataO.labels.push(ele.englishName); 
                        allNumber.push(ele.totalNumber);
                        passNumber.push(ele.nfNumber);
                        notPassNumber.push(ele.duplicateNumber);
                    }
                });
                chartDataO.data.push(allNumber); 
                chartDataO.data.push(passNumber); 
                chartDataO.data.push(notPassNumber); 
                chartData.value = chartDataO;
            }
        }

        const getOrgList = async () => {
            const result = await org.getOrgList(siteKey.value, '');
            if(result.status == 200){
                orgList.value = result.data.map((ele) => {
                    ele.label = ele.organizationNo+'('+ele.name+')';
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

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){

            }else{
                orgKeyN.value = orgKey.value;
            }
            getOrgList();
            getDataList();
        });

        return {
            theadV, parameterV, tbody, getDataList, time, orgList, orgKeyN, isChart, chartData, orgName, userRole, startTime, endTime, lan, 
            sidebarW, 
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
        tr{
            &:nth-of-type(even){
                background: #F2F2F2;
            }
            &:hover{
                background: #DBE6CC;
            }
            td{
                padding: 5px 0;
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