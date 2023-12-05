<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <div class="head-left">
                <el-select v-model="routeType">
                    <el-option v-for="item in routeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
                <el-select v-model="type" class="width120">
                    <el-option v-for="item in typeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
            </div>
            <div class="head-right">
                <div class="chart-box" @click="isChart = true">
                    <span>{{lan['图表展示']}}</span>
                    <img src="../assets/chart.svg" alt="" />
                </div>
                <label for="">{{lan['初次上传时间']}}</label>
                <el-date-picker
                    class="w130"
                    v-model="startTime"
                    type="month">
                </el-date-picker>
                <el-date-picker
                    class="w130"
                    v-model="endTime"
                    type="month">
                </el-date-picker>
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="w130" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
            </div>
        </div>
        <div class="contract-content style1">
            <el-table 
                class="el-table-box" 
                border
                :data="tableData" 
                :max-height="tableH">
                <el-table-column prop="englishName" :label="lan['年度月份']" width="90" :align="'center'" />
                <el-table-column prop="orgName" :label="lan['机构名称']" width="120" :align="'center'" />
                <el-table-column prop="submitImageCountO" :label="lan['提交拍数']" :align="'center'" />

                <el-table-column v-if="type == 1" prop="passImageCountO" :label="lan['通过拍数']" :align="'center'" />
                <el-table-column v-if="type == 1" prop="returnImageCountO" :label="lan['打回拍数']" :align="'center'" />
                <el-table-column v-if="type == 1" prop="tobeDiscussedImageCountO" :label="lan['待议拍数']" :align="'center'" />
                <el-table-column v-if="type == 1" prop="voidImageCountO" :label="lan['作废拍数']" :align="'center'" />
                <el-table-column v-if="type == 1" prop="waitCheckImageCountO" :label="lan['未审拍数']" :align="'center'" />

                <el-table-column v-if="type == 2" prop="passImageCountP" :label="lan['通过拍数(比率)']" :align="'center'" />
                <el-table-column v-if="type == 2" prop="returnImageCountP" :label="lan['打回拍数(比率)']" :align="'center'" />
                <el-table-column v-if="type == 2" prop="tobeDiscussedImageCountP" :label="lan['待议拍数(比率)']" :align="'center'" />
                <el-table-column v-if="type == 2" prop="voidImageCountP" :label="lan['作废拍数(比率)']" :align="'center'" />
                <el-table-column v-if="type == 2" prop="waitCheckImageCountP" :label="lan['未审拍数(比率)']" :align="'center'" />
            </el-table>
        </div>
        <!-- 可视化 -->
        <EchartsModule v-if="isChart" :title="title" :subtitle="subtitle+' '+orgName" :chartData="chartData" v-on:close="isChart = false" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg, getCurrentMonthZero, getDays, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import ImageListModule from '../components/ImageListModule.vue';
import EchartsModule from '../components/EchartsModule.vue';

export default {
    components: {
        ImageListModule, EchartsModule,
    },
    name: 'MonthVolumeSubmit',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const tableH = ref(window.innerHeight - 100);

        const orgList = ref([]);
        const orgKeyN = ref('');
        const orgName = ref('');
		const startTime = ref('');
		const endTime = ref('');
        const tableData = ref([]);
        const chartData = ref({'labels': [], 'data': [], 'label': []});
        const getDataList = async () => {
            if(!startTime.value && !endTime.value){
                return createMsg('请选择时间，上传时间必选一个！');
            }
            tableData.value = [];
			changePropertyValue('isLoading', true);
            const result = await supplierMS.supplierMonthCheck({
                'orgKey': orgKeyN.value,
                'siteKey': siteKey.value,
                'startTime': startTime.value ? new Date(startTime.value).getTime() : '',
                'endTime': endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '',
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let submitImageCount = 0, passImageCount = 0, returnImageCount = 0, tobeDiscussedImageCount = 0, voidImageCount = 0, waitCheckImageCount = 0;
                tableData.value = result.data.map((ele) => {
                    if(ele.englishName == '合计'){
                        ele.englishName = lan.value[ele.englishName];
                    }else{
                        ele.englishName = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
                    }
                    ele.orgName = ele.orgName ? ele.orgName : '全部机构';

                    submitImageCount = submitImageCount + (ele.submitImageCount || 0);
                    passImageCount = passImageCount + (ele.passImageCount || 0);
                    returnImageCount = returnImageCount + (ele.returnImageCount || 0);
                    tobeDiscussedImageCount = tobeDiscussedImageCount + (ele.tobeDiscussedImageCount || 0);
                    voidImageCount = voidImageCount + (ele.voidImageCount || 0);
                    waitCheckImageCount = waitCheckImageCount + (ele.waitCheckImageCount || 0);
            
                    ele.passImageCountP = (ele.submitImageCount ? ele.passImageCount ? (100*ele.passImageCount/ele.submitImageCount).toFixed(2)+'%' : '0%' : '');
                    ele.returnImageCountP = (ele.submitImageCount ? ele.returnImageCount ? (100*ele.returnImageCount/ele.submitImageCount).toFixed(2)+'%' : '0%' : '');
                    ele.tobeDiscussedImageCountP = (ele.submitImageCount ? ele.tobeDiscussedImageCount ? (100*ele.tobeDiscussedImageCount/ele.submitImageCount).toFixed(2)+'%' : '0%' : '');
                    ele.voidImageCountP = (ele.submitImageCount ? ele.voidImageCount ? (100*ele.voidImageCount/ele.submitImageCount).toFixed(2)+'%' : '0%' : '');
                    ele.waitCheckImageCountP = (ele.submitImageCount ? ele.waitCheckImageCount ? (100*ele.waitCheckImageCount/ele.submitImageCount).toFixed(2)+'%' : '0%' : '');

                    ele.submitImageCountO = thousands(ele.submitImageCount);
                    ele.passImageCountO = thousands(ele.passImageCount);
                    ele.returnImageCountO = thousands(ele.returnImageCount);
                    ele.tobeDiscussedImageCountO = thousands(ele.tobeDiscussedImageCount);
                    ele.voidImageCountO = thousands(ele.voidImageCount);
                    ele.waitCheckImageCountO = thousands(ele.waitCheckImageCount);
                    
                    return ele;
                });

                tableData.value.push({
                    'englishName': lan.value['合计'], 
                    'submitImageCountO': thousands(submitImageCount),
                    'passImageCountO': thousands(passImageCount),
                    'returnImageCountO': thousands(returnImageCount),
                    'tobeDiscussedImageCountO': thousands(tobeDiscussedImageCount),
                    'voidImageCountO': thousands(voidImageCount),
                    'waitCheckImageCountO': thousands(waitCheckImageCount),
                    'passImageCountP': (submitImageCount ? passImageCount ? (100*passImageCount/submitImageCount).toFixed(2)+'%' : '0%' : ''),
                    'returnImageCountP': (submitImageCount ? returnImageCount ? (100*returnImageCount/submitImageCount).toFixed(2)+'%' : '0%' : ''),
                    'tobeDiscussedImageCountP': (submitImageCount ? tobeDiscussedImageCount ? (100*tobeDiscussedImageCount/submitImageCount).toFixed(2)+'%' : '0%' : ''),
                    'voidImageCountP': (submitImageCount ? voidImageCount ? (100*voidImageCount/submitImageCount).toFixed(2)+'%' : '0%' : ''),
                    'waitCheckImageCountP': (submitImageCount ? waitCheckImageCount ? (100*waitCheckImageCount/submitImageCount).toFixed(2)+'%' : '0%' : ''),
                });

                let chartDataO = {
                    'labels': [], 
                    'data': [], 
                    'label': [lan.value['提交拍数'], lan.value['通过拍数'], lan.value['打回拍数'], lan.value['待议拍数'], lan.value['作废拍数'], lan.value['未审拍数']]
                }, submitImageCountArr = [], passImageCountArr = [], returnImageCountArr = [], tobeDiscussedImageCountArr = [], voidImageCountArr = [], waitCheckImageCountArr = [];
                tableData.value.forEach((ele) => {
                    if(ele.englishName == lan.value['合计']){

                    }else{
                        chartDataO.labels.push(ele.englishName); 
                        submitImageCountArr.push(ele.submitImageCount);
                        passImageCountArr.push(ele.passImageCount);
                        returnImageCountArr.push(ele.returnImageCount);
                        tobeDiscussedImageCountArr.push(ele.tobeDiscussedImageCount);
                        voidImageCountArr.push(ele.voidImageCount);
                        waitCheckImageCountArr.push(ele.waitCheckImageCount);
                    }
                });
                chartDataO.data.push(submitImageCountArr); 
                chartDataO.data.push(passImageCountArr); 
                chartDataO.data.push(returnImageCountArr); 
                chartDataO.data.push(tobeDiscussedImageCountArr); 
                chartDataO.data.push(voidImageCountArr); 
                chartDataO.data.push(waitCheckImageCountArr); 
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

        // 路由切换
        const routeList = ref([
            {'label': '按影像汇总', 'value': '/imageGather'}, 
            {'label': '按机构汇总', 'value': '/imagesMonthReport'},
            {'label': '影像准确率', 'value': '/imageRemarkReport'},
            {'label': '月提交量统计', 'value': '/SupplierMonthSubmit'},
            {'label': '供应商贡献度', 'value': '/SupplierContribution'},
            {'label': '审核状态统计', 'value': '/MonthVolumeSubmit'},
        ]);
        const routeType = ref('/MonthVolumeSubmit');
        watch(routeType, (nv, ov) => {
            router.push(nv);
        });

        // 影像、adj影像
        const type = ref(1);
        const typeList = ref([
            {'label': '按拍数', 'value': 1}, 
            {'label': '按比率', 'value': 2},
        ]);

        const title = ref(lan.value['审核状态统计']);
        const subtitle = ref('');
        watch(startTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });
        watch(endTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });

        return {
            tableData, getDataList, orgList, orgKeyN, isChart, orgName, userRole, startTime, endTime,
			chartData, lan, sidebarW, routeList, routeType, tableH, type, typeList, title, subtitle,
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
.marginR10{
    margin-right: 10px;
}
.width120{
    width: 120px;
}
</style>