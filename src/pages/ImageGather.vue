<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <!-- <h3>{{lan['拍摄月度汇总']}}</h3> -->
            <div class="head-left">
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="routeType" class="width100">
                    <el-option v-for="item in routeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
                <h3 v-else>{{lan['影像月度汇总']}}</h3>
            </div>
            <div class="head-right">
                <div class="chart-box" @click="isChart = true">
                    <span>{{lan['图表展示']}}</span>
                    <img src="../assets/chart.svg" alt="">
                </div>
                <!-- <label for="">{{lan['上传时间']}}</label>
                <el-date-picker
                    class="w130"
                    v-model="uploadStartTime"
                    type="month"
                    :placeholder="lan['上传开始时间']">
                </el-date-picker>
                <el-date-picker
                    class="w130"
                    v-model="uploadEndTime"
                    type="month"
                    :placeholder="lan['上传结束时间']">
                </el-date-picker> -->
                <label for="">{{lan['通过时间']}}</label>
                <el-date-picker
                    class="w130"
                    v-model="startTime"
                    type="month"
                    :placeholder="lan['通过开始时间']">
                </el-date-picker>
                <el-date-picker
                    class="w130"
                    v-model="endTime"
                    type="month"
                    :placeholder="lan['通过结束时间']">
                </el-date-picker>
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="w130" :placeholder="lan['机构筛选']">
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
        <ImageListModule v-if="isShow == 1" :timeStr="timeStr" :orgKeyN="orgKeyN" :orgName="orgName"  v-on:close="isShow = 0" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg, getCurrentMonthZero, getDays, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import ChartModule from '../components/ChartModule.vue';
import ImageListModule from '../components/ImageListModule.vue';
import EchartsModule from '../components/EchartsModule.vue';

export default {
    components: {
        ChartModule, ImageListModule, EchartsModule,
    },
    name: 'imageGather',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV = ref(['月數據', '机构名称', '本月新增谱数', '机构已审拍数', 'FS已审拍数', '已打回拍数']);
        const parameterV = ref(['englishName', 'orgName', 'claimNumberT', 'imageNumberOrgT', 'imageNumberFST', 'imageNumberReturnT']);

        const orgList = ref([]);
        const orgKeyN = ref('');
        const orgName = ref('');
		const startTime = ref('');
		const endTime = ref('');
        const uploadStartTime = ref('');
		const uploadEndTime = ref('');
        const tbody = ref([]);
        const chartData = ref({'labels': [], 'data': [], 'label': []});
        const getDataList = async () => {
            if(!startTime.value && !endTime.value && !uploadStartTime.value && !uploadEndTime.value){
                return createMsg('请选择时间，上传时间和通过时间必选一个！');
            }
            tbody.value = [];
			changePropertyValue('isLoading', true);
            // new Date(startTime.value).getTime(), new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1, orgKeyN.value, siteKey.value
            const result = await supplierMS.getShootingCompletion({
                'orgKey': orgKeyN.value,
                'siteKey': siteKey.value,
                'startTime': startTime.value ? new Date(startTime.value).getTime() : '',
                'endTime': endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '',
                'uploadStartTime': uploadStartTime.value ? new Date(uploadStartTime.value).getTime() : '',
                'uploadEndTime': uploadEndTime.value ? new Date(uploadEndTime.value).getTime()+getDays(new Date(uploadEndTime.value).getTime())-1 : '',
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.data.map((ele) => {
                    if(ele.englishName == '数据汇总'){
                        ele.englishName = lan.value[ele.englishName];
                    }else{
                        ele.englishName = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
                    }
                    ele.orgName = ele.orgName ? ele.orgName : '全部机构';
                    ele.finishRateO = ele.finishRate ? ele.finishRate+'%' : '';
                    ele.organizationNo = orgKeyN.value ? ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '' : lan.value['全部机构'];

                    ele.imageNumberOrgT = thousands(ele.imageNumberOrg);
                    ele.claimNumberT = thousands(ele.claimNumber);
                    ele.imageNumberFST = thousands(ele.imageNumberFS);
                    ele.imageNumberReturnT = thousands(ele.imageNumberReturn);
                    return ele;
                });

                let chartDataO = {'labels': [], 'data': [], 'label': [lan.value['机构已审拍数'], lan.value['本月新增谱数'], lan.value['FS已审拍数'], lan.value['已打回拍数']]}, totalGCNumber = [], claimNumber = [], volumeNumber = [], imageNumber = [];
                tbody.value.forEach((ele) => {
                    if(ele.englishName == '数据汇总'){

                    }else{
                        chartDataO.labels.push(ele.englishName); 
                        totalGCNumber.push(ele.imageNumberOrg);
                        claimNumber.push(ele.claimNumber);
                        volumeNumber.push(ele.imageNumberFS);
                        imageNumber.push(ele.imageNumberReturn);
                    }
                });
                chartDataO.data.push(totalGCNumber); 
                chartDataO.data.push(claimNumber); 
                chartDataO.data.push(volumeNumber); 
                chartDataO.data.push(imageNumber); 
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

            // uploadStartTime.value = getCurrentMonthZero();
            // uploadEndTime.value = getCurrentMonthZero(0);

            startTime.value = getCurrentMonthZero();
            endTime.value = getCurrentMonthZero(0);
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);

            getOrgList();
            getDataList();
        });

        const timeStr = ref('');
        const isShow = ref(0);
        const parameterList = ref(['volumeNumber', 'imageNumber']);
        const handleClickCell = (data1, data2) => {
            if(parameterList.value.indexOf(data2) > -1 && data1.englishName != '数据汇总'){
                timeStr.value = data1.englishName;
                isShow.value = 1;
            }
        }

        const routeList = ref([
            {'label': '按影像汇总', 'value': '/imageGather'}, 
            {'label': '按机构汇总', 'value': '/imagesMonthReport'},
            {'label': '影像准确率', 'value': '/imageRemarkReport'},
            {'label': '月提交量统计', 'value': '/SupplierMonthSubmit'},
            {'label': '供应商贡献度', 'value': '/SupplierContribution'},
            {'label': '审核状态统计', 'value': '/MonthVolumeSubmit'},
        ]);
        const routeType = ref('/imageGather');
        watch(routeType, (nv, ov) => {
            router.push(nv);
        });

        const title = ref(lan.value['影像月度汇总']);
        const subtitle = ref('');
        watch(startTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });
        watch(endTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });

        return {
            theadV, parameterV, tbody, getDataList, orgList, orgKeyN, isChart, orgName, userRole, startTime, endTime, title, subtitle,
			chartData, lan, sidebarW, handleClickCell, timeStr, isShow, parameterList, routeList, routeType, uploadStartTime, uploadEndTime,
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
</style>