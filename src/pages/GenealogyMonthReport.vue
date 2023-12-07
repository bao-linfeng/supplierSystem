<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <div class="head-left">
                <el-select v-model="routeType" class="width100">
                    <el-option v-for="item in routeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
            </div>
            <h3>{{lan[statisticalLatitudeL]}}</h3>
            <div class="head-right">
                <el-radio-group class="marginR10" v-model="isFileTime">
                    <el-radio :label="false">{{lan['导入时间']}}</el-radio>
                    <el-radio :label="true">{{lan['档案时间']}}</el-radio>
                </el-radio-group>
                <!-- <el-checkbox class="marginR10" v-model="isFileTime">档案时间检索</el-checkbox> -->
                <div v-if="statisticalLatitude <= 2" class="chart-box" @click="isChart = true">
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
                <el-select class="width100" v-model="statisticalLatitude">
                    <el-option v-for="item in statisticalLatitudeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
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
                            <i v-else>{{item[item2]}}</i>
                        </td>
                    </tr>
                    <tr v-if="!tbody.length">
                        <td :colspan="parameterV.length">{{lan['暂无数据']}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- <ChartModule v-if="isChart" :year="Date.now()" :orgName="''" :chartData="chartData" v-on:close="isChart = false" /> -->
        <EchartsModule v-if="isChart && statisticalLatitude >= 3" :year="Date.now()" :orgName="orgName" :chartData="chartData" v-on:close="isChart = false" />
        <!-- 饼状图 -->
        <Pie v-if="isChart && statisticalLatitude <= 2" :title="statisticalLatitudeL" :subtitle="subtitle" :chartData="chartData" v-on:close="isChart = false" />
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
import Pie from '../components/Echarts/Pie.vue';

export default {
    components: {
        ChartModule, EchartsModule, Pie, 
    },
    name: 'genealogyMonthReport',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV = ref(['年度月份', '数据汇总', '寻源堂', '成蹊', '馨里有谱', '仰沁', '良友科苑', '时光科技', '古中山']);
        const parameterV = ref(['englishName', 'allOrgNumberT', 'aaT', 'bbT', 'bbcT', 'ccT', 'ddT', 'eeT', 'ffT']);

        const time = ref('');
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
            const result = await supplierMS.monthlySummaryOrg(new Date(startTime.value).getTime(), new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1, statisticalLatitude.value, isFileTime.value ? 2: 1);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.data.map((ele) => {

                    if(ele.englishName == '数据汇总'){
                        ele.englishName = lan.value[ele.englishName];
                    }else{
                        ele.englishName = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
                    }
                    
                    ele.organizationNo = ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '';
                    ele.allOrgNumber = statisticalLatitude.value <= 2 ? ele.allOrgNumber : (ele.allOrgNumberTotal ? ((ele.allOrgNumber/ele.allOrgNumberTotal)*100).toFixed(2)+'%' : '0.00%');
                    ele.aa = statisticalLatitude.value <= 2 ? ele.aa : (ele.aaT && ele.aa ? ((ele.aa/ele.aaT)*100).toFixed(2)+'%' : '0.00%');
                    ele.bb = statisticalLatitude.value <= 2 ? ele.bb : (ele.bbT && ele.bb ? ((ele.bb/ele.bbT)*100).toFixed(2)+'%' : '0.00%');
                    ele.bbc = statisticalLatitude.value <= 2 ? ele.bbc : (ele.bbcT && ele.bbc ? ((ele.bbc/ele.bbcT)*100).toFixed(2)+'%' : '0.00%');
                    ele.cc = statisticalLatitude.value <= 2 ? ele.cc : (ele.ccT && ele.cc ? ((ele.cc/ele.ccT)*100).toFixed(2)+'%' : '0.00%');
                    ele.dd = statisticalLatitude.value <= 2 ? ele.dd : (ele.ddT && ele.dd ? ((ele.dd/ele.ddT)*100).toFixed(2)+'%' : '0.00%');
                    ele.ee = statisticalLatitude.value <= 2 ? ele.ee : (ele.eeT && ele.ee ? ((ele.ee/ele.eeT)*100).toFixed(2)+'%' : '0.00%');
                    ele.ff = statisticalLatitude.value <= 2 ? ele.ff : (ele.ffT && ele.ff ? ((ele.ff/ele.ffT)*100).toFixed(2)+'%' : '0.00%');

                    ele.allOrgNumberT = thousands(ele.allOrgNumber);
                    ele.aaT = thousands(ele.aa);
                    ele.bbT = thousands(ele.bb);
                    ele.bbcT = thousands(ele.bbc);
                    ele.ccT= thousands(ele.cc);
                    ele.ddT = thousands(ele.dd);
                    ele.eeT = thousands(ele.ee);
                    ele.ffT = thousands(ele.ff);
                    return ele;
                });

                let chartDataO = {'labels': [], 'data': [], 'label': [lan.value['寻源堂'], lan.value['成蹊'], lan.value['馨里有谱'], lan.value['仰沁'], lan.value['良友科苑'], lan.value['时光科技'], lan.value['古中山']]};
                let all = [], aa = [], bb = [], bbc = [], cc = [], dd = [], ee = [], ff =[];

                tbody.value.forEach((ele) => {
                    if(ele.englishName == '数据汇总'){
                        aa = ele.aa;
                        bb = ele.bb;
                        bbc = ele.bbc;
                        cc = ele.cc;
                        dd = ele.dd;
                        ee = ele.ee;
                        ff = ele.ff;
                    }else{
                        chartDataO.labels.push(ele.englishName); 
                        all.push(ele.allOrgNumber);
                        aa.push(ele.aa);
                        bb.push(ele.bb);
                        bbc.push(ele.bbc);
                        cc.push(ele.cc);
                        dd.push(ele.dd);
                        ee.push(ele.ee);
                        ff.push(ele.ff);
                    }
                });
                // chartDataO.data.push(all); 
                if(statisticalLatitude.value <= 2){
                    chartDataO.data = [
                        {'value': aa, 'name': lan.value['寻源堂']}, 
                        {'value': bb, 'name': lan.value['成蹊']},
                        {'value': bbc, 'name': lan.value['馨里有谱']}, 
                        {'value': cc, 'name': lan.value['仰沁']},
                        {'value': dd, 'name': lan.value['良友科苑']}, 
                        {'value': ee, 'name': lan.value['时光科技']},
                        {'value': ff, 'name': lan.value['古中山']}, 
                    ];
                }else{
                    chartDataO.data.push(aa); 
                    chartDataO.data.push(bb); 
                    chartDataO.data.push(bbc); 
                    chartDataO.data.push(cc); 
                    chartDataO.data.push(dd); 
                    chartDataO.data.push(ee); 
                    chartDataO.data.push(ff);
                }
                 
                chartData.value = chartDataO;
            }else{
                createMsg(result.msg);
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
            // subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });

        const isChart = ref(false);

        const statisticalLatitudeList = ref([
            {'label': '月度提交谱量', 'value': '1'},
            {'label': '月度收购谱量', 'value': '2'},
            {'label': '查重可拍率', 'value': '3'},
            {'label': '查重重复率', 'value': '4'},
            {'label': '查重待议谱率', 'value': '5'}]);
        const statisticalLatitude = ref('1');
        const statisticalLatitudeL = ref('月度提交谱量');
        const subtitle = ref('');

        watch(statisticalLatitude, (nv, ov) => {
            statisticalLatitudeList.value.forEach((ele) => {
                if(ele.value == nv){
                    statisticalLatitudeL.value = ele.label;
                }
            });
			getDataList();
        });

        watch(startTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });
        watch(endTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });

        onMounted(() => {
            startTime.value = getCurrentMonthZero();
            endTime.value = getCurrentMonthZero(0);
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
            
            getDataList();
        });

        const routeList = ref([{'label': '按谱类型汇总', 'value': '/monthGather'}, {'label': '按机构汇总', 'value': '/genealogyMonthReport'}]);
        const routeType = ref('/genealogyMonthReport');
        watch(routeType, (nv, ov) => {
            router.push(nv);
        });

        const isFileTime = ref(false);
        watch(isFileTime, () => {
            getDataList();
        });

        return {
            theadV, parameterV, tbody, getDataList, time, isChart, chartData, userRole, startTime, endTime, lan, subtitle, 
            statisticalLatitudeList, statisticalLatitude, sidebarW, statisticalLatitudeL, routeList, routeType, isFileTime,
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
.head-left{
    display: flex;
    align-items: center;
}
.width100{
    width: 120px;
    margin-right: 10px;
}
</style>