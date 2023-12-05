<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <div class="head-left">
                <el-select v-model="routeType" class="w130">
                    <el-option v-for="item in routeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
            </div>
            <div class="head-right">
                <div class="chart-box" v-if="type == 1" @click="isChart = true">
                    <span>{{lan['图表展示']}}</span>
                    <img src="../assets/chart.svg" alt="">
                </div>
                <label for="">{{lan['查重通过时间']}}</label>
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
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="w130" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="type" class="w80">
                    <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
            </div>
        </div>
        <el-table class="el-table-box" :data="tableData" :max-height="tableH">
            <el-table-column prop="englishName" :label="lan['年度月份']" width="120" :align="'center'" />
            <el-table-column prop="orgName" :label="lan['机构名称']" :align="'center'" />
            <el-table-column :label="lan['谱目数(有影像)']" :align="'center'">
                <el-table-column prop="gcNumberT" :label="lan['谱目条数']" :align="'center'" />
                <el-table-column prop="volumeNumberT" :label="lan['影像册数']" :align="'center'" />
            </el-table-column>
            <el-table-column :label="lan['编目完结']" :align="'center'">
                <el-table-column prop="gcNumberOverT" :label="lan['谱目条数']" :align="'center'" />
                <el-table-column prop="volumeNumberOverT" :label="lan['影像册数']" :align="'center'" />
            </el-table-column>
            <el-table-column prop="finishPercentO" :label="lan['完成率']" :align="'center'" />
            <el-table-column :label="lan['可索引']" :align="'center'">
                <el-table-column prop="gcNumberOverIndexT" :label="lan['谱目条数']" :align="'center'" />
                <el-table-column prop="volumeNumberOverIndexT" :label="lan['影像册数']" :align="'center'" />
            </el-table-column>
            <el-table-column :label="lan['不可索引']" :align="'center'">
                <el-table-column prop="gcNumberOverNoIndexT" :label="lan['谱目条数']" :align="'center'" />
                <el-table-column prop="volumeNumberOverNoIndexT" :label="lan['影像册数']" :align="'center'" />
            </el-table-column>
        </el-table>
        <!-- <ChartModule v-if="isChart" :year="Date.now()" :orgName="''" :chartData="chartData" v-on:close="isChart = false" /> -->
        <EchartsModule v-if="isChart" :title="title" :subtitle="subtitle+' '+orgNameN" :chartData="chartData" v-on:close="isChart = false" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg, getCurrentMonthZero, getDays, getMonthTimestamp, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import ChartModule from '../components/ChartModule.vue';
import EchartsModule from '../components/EchartsModule.vue';

export default {
    components: {
        ChartModule, EchartsModule,
    },
    name: 'catalogMonthReport',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType, orgName } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const tableH = ref(300);
		const startTime = ref(Date.now() - 1000*60*60*24*30*11);
		const endTime = ref(Date.now());
        const tableData = ref([]);
        const chartData = ref({'labels': [], 'data': [], 'label': []});

        const getDataList = async () => {
            tableData.value = [];
			changePropertyValue('isLoading', true);
            const result = await supplierMS.GCOverStatistics({
                'startTime': startTime.value ? new Date(startTime.value).getTime() : '',
                'endTime': endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '',
                'orgKey': orgKeyN.value,
                'type': type.value
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tableData.value = result.data.map((ele) => {
                    if(ele.englishName == '数据汇总'){
                        ele.englishName = lan.value[ele.englishName];
                    }else{
                        if(type.value == 1){
                            ele.englishName = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
                        }else{
                            ele.englishName = getLocalTime(ele.sTime, '-', 1) + '~' + getLocalTime(ele.eTime, '-', 1);
                        }
                    }
                    if(userRole.value >= 1 && userRole.value <= 3){
                        ele.orgName = orgNameN.value ? lan.value[orgNameN.value] : lan.value['全部机构'];
                    }else{
                        ele.orgName = lan.value[orgName.value];
                    }
                    
                    ele.finishPercentO = ele.finishPercent ? (ele.finishPercent*100).toFixed(2)+'%' : '0%';

                    ele.gcNumberT = thousands(ele.gcNumber);
                    ele.volumeNumberT = thousands(ele.volumeNumber);
                    ele.gcNumberOverT = thousands(ele.gcNumberOver);
                    ele.volumeNumberOverT = thousands(ele.volumeNumberOver);
                    ele.gcNumberOverIndexT = thousands(ele.gcNumberOverIndex);
                    ele.volumeNumberOverIndexT = thousands(ele.volumeNumberOverIndex);
                    ele.gcNumberOverNoIndexT = thousands(ele.gcNumberOverNoIndex);
                    ele.volumeNumberOverNoIndexT = thousands(ele.volumeNumberOverNoIndex);
                    
                    return ele;
                });

                let chartDataO = {'labels': [], 'data': [], 'label': [lan.value['谱目数(有影像)'], lan.value['编目完结'], lan.value['可索引'], lan.value['不可索引']]};
                let gcNumber = [], gcNumberOver = [], gcNumberOverIndex = [], gcNumberOverNoIndex = [];

                tableData.value.forEach((ele) => {
                    if(ele.englishName == '数据汇总'){

                    }else{
                        chartDataO.labels.push(ele.englishName); 
                        gcNumber.push(ele.gcNumber || 0);
                        gcNumberOver.push(ele.gcNumberOver || 0);
                        gcNumberOverIndex.push(ele.gcNumberOverIndex || 0);
                        gcNumberOverNoIndex.push(ele.gcNumberOverNoIndex || 0);
                    }
                });

                chartDataO.data.push(gcNumber); 
                chartDataO.data.push(gcNumberOver); 
                chartDataO.data.push(gcNumberOverIndex); 
                chartDataO.data.push(gcNumberOverNoIndex); 

                chartData.value = chartDataO;
            }else{
                createMsg(result.msg);
            }
        }

        // 机构列表
        const orgList = ref([]);
        const orgKeyN = ref('');
        const orgNameN = ref('');
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
                    orgNameN.value = nv ? ele.label : '';
                }
            });
        });

        // 汇总周期 1 -> 月；2 -> 周
        const type = ref('1');
        const typeList = ref([{'label': '月', 'value': '1'}, {'label': '周', 'value': '2'}]);
        watch(type, () => {
            getDataList();
        });

        // 切换页面
        const routeList = ref([
            {'label': '按编目汇总', 'value': '/catalogReport'}
        ]);
        const routeType = ref('/catalogReport');
        watch(routeType, (nv, ov) => {
            router.push(nv);
        });

        // 可视化
        const isChart = ref(false);

        onMounted(() => {
            startTime.value = getCurrentMonthZero();
            endTime.value = getCurrentMonthZero(0);
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);

            tableH.value = window.innerHeight - 100;

            if(userRole.value >= 1 && userRole.value <= 3){
                routeList.value = [
                    {'label': '按编目汇总', 'value': '/catalogReport'}, 
                    {'label': '按机构汇总', 'value': '/catalogMonthReport'},
                    {'label': '机构编目准确率统计表', 'value': '/catalogEditReport'},
                ];
            }else{
                orgKeyN.value = orgKey.value;
            }

            getOrgList();
            getDataList();
        });

        // 单元格点击 
        const handleCellClick = (row, column) => {
            console.log(row, column);
            let orgKey = '', startTimes = '', endTimes = '', uploadStartTimes = '', uploadEndTimes = '';

            if(row == 'englishName'){
                return;
            }
            if(row != 'allOrgNumber'){
                orgKey = orgKeyO[row];
            }

            if(column.englishName != '数据汇总'){
                if(startTime.value && endTime.value){
                    startTimes = getMonthTimestamp(column.year, column.month).firstDayTimestamp;
                    endTimes = getMonthTimestamp(column.year, column.month).lastDayTimestamp;
                }else{
                    startTimes = '';
                    endTimes = '';
                }
            }else{
                startTimes = startTime.value ? new Date(startTime.value).getTime() : '';
                endTimes = endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '';
            }

            window.open('/imageStatistics?orgKey='+orgKey+'&startTime='+startTimes+'&endTime='+endTimes+'&uploadStartTime='+uploadStartTimes+'&uploadEndTime='+uploadEndTimes+'&isAll=1');
        }

        const title = ref(lan.value['编目月度汇总']);
        const subtitle = ref('');
        watch(startTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });
        watch(endTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });

        return {
            tableData, getDataList, isChart, userRole, startTime, endTime,
			chartData, lan, sidebarW, routeList, routeType, type, typeList, handleCellClick, 
            orgList, orgKeyN, tableH, title, subtitle, orgNameN,
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
.el-table-box{
    width: calc(100% - 40px);
    margin: 0 auto;
}
.marginR10{
    margin-right: 10px;
}
.w130{
    width: 130px !important;
}
.w80{
    width: 80px;
}
</style>