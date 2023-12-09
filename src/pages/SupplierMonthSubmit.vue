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
                <el-table-column prop="taskNumberO" :label="lan['目标拍数']" :align="'center'" />
                <el-table-column prop="uploadImageCountO" :label="lan['上传拍数']" :align="'center'" />
                <el-table-column prop="uploadImageCountP" :label="lan['上传率(%)']" width="120" :align="'center'" />
                <el-table-column prop="submitImageCountO" :label="lan['提交拍数']" :align="'center'" />
                <el-table-column prop="submitImageCountP" :label="lan['提交完成率(%)']" width="120" :align="'center'" />
                <el-table-column prop="uploadCVCountO" :label="lan['上传册数']" :align="'center'" />
                <el-table-column prop="submitCVCountO" :label="lan['提交册数']" :align="'center'" />
                <el-table-column prop="passCVCountO" :label="lan['通过册数']" :align="'center'" />
                <el-table-column prop="overCVCountO" :label="lan['完结册数']" :align="'center'" />
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
    name: 'SupplierMonthSubmit',
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
            const result = await supplierMS.supplierMonthSubmitCount({
                'orgKey': orgKeyN.value,
                'siteKey': siteKey.value,
                'startTime': startTime.value ? new Date(startTime.value).getTime() : '',
                'endTime': endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '',
                "type": type.value, 
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let taskNumber = 0, uploadImageCount = 0, submitImageCount = 0, submitCVCount = 0, passCVCount = 0, overCVCount = 0, uploadCVCount = 0;
                tableData.value = result.data.map((ele) => {
                    if(ele.englishName == '合计'){
                        ele.englishName = lan.value[ele.englishName];
                    }else{
                        ele.englishName = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
                    }
                    ele.orgName = ele.orgName ? ele.orgName : '全部机构';
                    ele.uploadImageCountP = ele.taskNumber ? ele.uploadImageCount ? (100*ele.uploadImageCount/ele.taskNumber).toFixed(2)+'%' : '0%' : '';
                    ele.submitImageCountP = ele.taskNumber ? ele.submitImageCount ? (100*ele.submitImageCount/ele.taskNumber).toFixed(2)+'%' : '0%' : '';

                    taskNumber = taskNumber + (ele.taskNumber || 0);
                    uploadImageCount = uploadImageCount + (ele.uploadImageCount || 0);
                    submitImageCount = submitImageCount + (ele.submitImageCount || 0);
                    submitCVCount = submitCVCount + (ele.submitCVCount || 0);
                    passCVCount = passCVCount + (ele.passCVCount || 0);
                    overCVCount = overCVCount + (ele.overCVCount || 0);
                    uploadCVCount = uploadCVCount + (ele.uploadCVCount || 0);

                    ele.taskNumberO = thousands(ele.taskNumber);
                    ele.uploadImageCountO = thousands(ele.uploadImageCount);
                    ele.submitImageCountO = thousands(ele.submitImageCount);
                    ele.submitCVCountO = thousands(ele.submitCVCount);
                    ele.passCVCountO = thousands(ele.passCVCount);
                    ele.overCVCountO = thousands(ele.overCVCount);
                    ele.uploadCVCountO = thousands(ele.uploadCVCount);
                    
                    return ele;
                });

                tableData.value.push({
                    'englishName': lan.value['合计'], 
                    'taskNumberO': thousands(taskNumber),
                    'uploadImageCountO': thousands(uploadImageCount),
                    'submitImageCountO': thousands(submitImageCount),
                    'submitCVCountO': thousands(submitCVCount),
                    'passCVCountO': thousands(passCVCount),
                    'overCVCountO': thousands(overCVCount),
                    'uploadCVCountO': thousands(uploadCVCount),
                    'uploadImageCountP': taskNumber ? uploadImageCount ? (100*uploadImageCount/taskNumber).toFixed(2)+'%' : '0%' : '',
                    'submitImageCountP': taskNumber ? submitImageCount ? (100*submitImageCount/taskNumber).toFixed(2)+'%' : '0%' : '',
                });

                let chartDataO = {'labels': [], 'data': [], 'label': [lan.value['上传拍数'], lan.value['提交拍数']]}, uploadImageCountArr = [], submitImageCountArr = [];
                tableData.value.forEach((ele) => {
                    if(ele.englishName == lan.value['合计']){

                    }else{
                        chartDataO.labels.push(ele.englishName); 
                        uploadImageCountArr.push(ele.uploadImageCount);
                        submitImageCountArr.push(ele.submitImageCount);
                    }
                });
                chartDataO.data.push(uploadImageCountArr); 
                chartDataO.data.push(submitImageCountArr); 
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
        const routeType = ref('/SupplierMonthSubmit');
        watch(routeType, (nv, ov) => {
            router.push(nv);
        });

        // 影像、adj影像
        const type = ref(1);
        const typeList = ref([
            {'label': '影像页', 'value': 1}, 
            {'label': 'adj影像页', 'value': 2},
        ]);
        watch(type, () => {
            getDataList();
        });

        const title = ref(lan.value['月提交量统计']);
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