<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <div class="head-left">
                <el-select v-model="routeType" class="width100">
                    <el-option v-for="item in routeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
                <el-select v-model="type" class="width120">
                    <el-option v-for="item in typeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
            </div>
            <div class="head-right">
                <div class="chart-box" @click="isChart = true">
                    <span>{{lan['图表展示']}}</span>
                    <img src="../assets/chart.svg" alt="">
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
                <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
            </div>
        </div>
        <div class="contract-content style1">
            <el-table 
                class="el-table-box" 
                border
                :data="tableData" 
                :max-height="tableH">
                <el-table-column prop="englishName" :label="lan['年度月份']" fixed width="90" :align="'center'" />
                <el-table-column :label="lan['数据汇总']" :align="'center'">
                    <el-table-column prop="allTargetT" :label="lan['目标拍数']" fixed :align="'center'" width="130" />
                    <el-table-column prop="allSubmitT" :label="lan['提交拍数']" fixed :align="'center'" width="130" />
                    <el-table-column prop="allP" :label="lan['提交完成率(%)']" fixed :align="'center'" width="130" />
                </el-table-column>
                <el-table-column :label="lan['寻源堂']" :align="'center'">
                    <el-table-column prop="aaTargetT" :label="lan['目标拍数']" :align="'center'" width="130" />
                    <el-table-column prop="aaSubmitT" :label="lan['提交拍数']" :align="'center'" width="130" />
                    <el-table-column prop="aaP" :label="lan['提交完成率(%)']" :align="'center'" width="130" />
                </el-table-column>
                <el-table-column :label="lan['成蹊']" :align="'center'">
                    <el-table-column prop="bbTargetT" :label="lan['目标拍数']" :align="'center'" width="130" />
                    <el-table-column prop="bbSubmitT" :label="lan['提交拍数']" :align="'center'" width="130" />
                    <el-table-column prop="bbP" :label="lan['提交完成率(%)']" :align="'center'" width="130" />
                </el-table-column>
                <el-table-column :label="lan['馨里有谱']" :align="'center'">
                    <el-table-column prop="bbcTargetT" :label="lan['目标拍数']" :align="'center'" width="130" />
                    <el-table-column prop="bbcSubmitT" :label="lan['提交拍数']" :align="'center'" width="130" />
                    <el-table-column prop="bbcP" :label="lan['提交完成率(%)']" :align="'center'" width="130" />
                </el-table-column>
                <el-table-column :label="lan['仰沁']" :align="'center'">
                    <el-table-column prop="ccTargetT" :label="lan['目标拍数']" :align="'center'" width="130" />
                    <el-table-column prop="ccSubmitT" :label="lan['提交拍数']" :align="'center'" width="130" />
                    <el-table-column prop="ccP" :label="lan['提交完成率(%)']" :align="'center'" width="130" />
                </el-table-column>
                <el-table-column :label="lan['良友科苑']" :align="'center'">
                    <el-table-column prop="ddTargetT" :label="lan['目标拍数']" :align="'center'" width="130" />
                    <el-table-column prop="ddSubmitT" :label="lan['提交拍数']" :align="'center'" width="130" />
                    <el-table-column prop="ddP" :label="lan['提交完成率(%)']" :align="'center'" width="130" />
                </el-table-column>
                <el-table-column :label="lan['时光科技']" :align="'center'">
                    <el-table-column prop="eeTargetT" :label="lan['目标拍数']" :align="'center'" width="130" />
                    <el-table-column prop="eeSubmitT" :label="lan['提交拍数']" :align="'center'" width="130" />
                    <el-table-column prop="eeP" :label="lan['提交完成率(%)']" :align="'center'" width="130" />
                </el-table-column>
                <el-table-column :label="lan['古中山']" :align="'center'">
                    <el-table-column prop="ffTargetT" :label="lan['目标拍数']" :align="'center'" width="130" />
                    <el-table-column prop="ffSubmitT" :label="lan['提交拍数']" :align="'center'" width="130" />
                    <el-table-column prop="ffP" :label="lan['提交完成率(%)']" :align="'center'" width="130" />
                </el-table-column>
            </el-table>
        </div>
        <!-- 饼状图 -->
        <Pie v-if="isChart" :title="title" :subtitle="subtitle" :chartData="chartData" v-on:close="isChart = false" />
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
import Pie from '../components/Echarts/Pie.vue';

export default {
    components: {
        ImageListModule, EchartsModule, Pie,
    },
    name: 'SupplierContribution',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const tableH = ref(window.innerHeight - 100);
        const title = ref(lan.value['供应商贡献度']);
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
            const result = await supplierMS.supplierMonthContribution({
                'siteKey': siteKey.value,
                'startTime': startTime.value ? new Date(startTime.value).getTime() : '',
                'endTime': endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '',
                "type": type.value, 
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let allTarget = 0, allSubmit = 0, aaTarget = 0, aaSubmit = 0, bbTarget = 0, bbSubmit = 0, bbcTarget = 0, bbcSubmit = 0, ccTarget = 0, ccSubmit = 0, ddTarget = 0, ddSubmit = 0, eeTarget = 0, eeSubmit = 0, ffTarget = 0, ffSubmit = 0; 
                tableData.value = result.data.map((ele) => {
                    if(ele.englishName == '合计'){
                        ele.englishName = lan.value[ele.englishName];
                    }else{
                        ele.englishName = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
                    }

                    ele.allP = ele.allTarget ? ele.allSubmit ? (100*ele.allSubmit/ele.allTarget).toFixed(2)+'%' : '0%' : '';
                    ele.aaP = ele.aaTarget ? ele.aaSubmit ? (100*ele.aaSubmit/ele.aaTarget).toFixed(2)+'%' : '0%' : '';
                    ele.bbP = ele.bbTarget ? ele.bbSubmit ? (100*ele.bbSubmit/ele.bbTarget).toFixed(2)+'%' : '0%' : '';
                    ele.bbcP = ele.bbcTarget ? ele.bbcSubmit ? (100*ele.bbcSubmit/ele.bbcTarget).toFixed(2)+'%' : '0%' : '';
                    ele.ccP = ele.ccTarget ? ele.ccSubmit ? (100*ele.ccSubmit/ele.ccTarget).toFixed(2)+'%' : '0%' : '';
                    ele.ddP = ele.ddTarget ? ele.ddSubmit ? (100*ele.ddSubmit/ele.ddTarget).toFixed(2)+'%' : '0%' : '';
                    ele.eeP = ele.eeTarget ? ele.eeSubmit ? (100*ele.eeSubmit/ele.eeTarget).toFixed(2)+'%' : '0%' : '';
                    ele.ffP = ele.ffTarget ? ele.ffSubmit ? (100*ele.ffSubmit/ele.ffTarget).toFixed(2)+'%' : '0%' : '';

                    allTarget = allTarget + (ele.allTarget || 0);
                    allSubmit = allSubmit + (ele.allSubmit || 0);
                    aaTarget = aaTarget + (ele.aaTarget || 0);
                    aaSubmit = aaSubmit + (ele.aaSubmit || 0); 
                    bbTarget = bbTarget + (ele.bbTarget || 0);
                    bbSubmit = bbSubmit + (ele.bbSubmit || 0);
                    bbcTarget = bbcTarget + (ele.bbcTarget || 0);
                    bbcSubmit = bbcSubmit + (ele.bbcSubmit || 0);
                    ccTarget = ccTarget + (ele.ccTarget || 0);
                    ccSubmit = ccSubmit + (ele.ccSubmit || 0);
                    ddTarget = ddTarget + (ele.ddTarget || 0);
                    ddSubmit = ddSubmit + (ele.ddSubmit || 0);
                    eeTarget = eeTarget + (ele.eeTarget || 0);
                    eeSubmit = eeSubmit + (ele.eeSubmit || 0);
                    ffTarget = ffTarget + (ele.ffTarget || 0);
                    ffSubmit = ffSubmit + (ele.ffSubmit || 0);

                    ele.allTargetT = thousands(ele.allTarget);
                    ele.allSubmitT = thousands(ele.allSubmit);
                    ele.aaTargetT = thousands(ele.aaTarget);
                    ele.aaSubmitT = thousands(ele.aaSubmit);
                    ele.bbTargetT = thousands(ele.bbTarget);
                    ele.bbSubmitT = thousands(ele.bbSubmit);
                    ele.bbcTargetT = thousands(ele.bbcTarget);
                    ele.bbcSubmitT = thousands(ele.bbcSubmit);
                    ele.ccTargetT = thousands(ele.ccTarget);
                    ele.ccSubmitT = thousands(ele.ccSubmit);
                    ele.ddTargetT = thousands(ele.ddTarget);
                    ele.ddSubmitT = thousands(ele.ddSubmit);
                    ele.eeTargetT = thousands(ele.eeTarget);
                    ele.eeSubmitT = thousands(ele.eeSubmit);
                    ele.ffTargetT = thousands(ele.ffTarget);
                    ele.ffSubmitT = thousands(ele.ffSubmit);
                    
                    return ele;
                });

                tableData.value.push({
                    'englishName': lan.value['合计'], 
                    'allTargetT': thousands(allTarget),
                    'allSubmitT': thousands(allSubmit),
                    'aaTargetT': thousands(aaTarget),
                    'aaSubmitT': thousands(aaSubmit),
                    'bbTargetT': thousands(bbTarget),
                    'bbSubmitT': thousands(bbSubmit),
                    'bbcTargetT': thousands(bbcTarget),
                    'bbcSubmitT': thousands(bbcSubmit),
                    'ccTargetT': thousands(ccTarget),
                    'ccSubmitT': thousands(ccSubmit),
                    'ddTargetT': thousands(ddTarget),
                    'ddSubmitT': thousands(ddSubmit),
                    'eeTargetT': thousands(eeTarget),
                    'eeSubmitT': thousands(eeSubmit),
                    'ffTargetT': thousands(ffTarget),
                    'ffSubmitT': thousands(ffSubmit),
                    
                    'allP': allTarget ? allSubmit ? (100*allSubmit/allTarget).toFixed(2)+'%' : '0%' : '',
                    'aaP': aaTarget ? aaSubmit ? (100*aaSubmit/aaTarget).toFixed(2)+'%' : '0%' : '',
                    'bbP': bbTarget ? bbSubmit ? (100*bbSubmit/bbTarget).toFixed(2)+'%' : '0%' : '',
                    'bbcP': bbcTarget ? bbcSubmit ? (100*bbcSubmit/bbcTarget).toFixed(2)+'%' : '0%' : '',
                    'ccP': ccTarget ? ccSubmit ? (100*ccSubmit/ccTarget).toFixed(2)+'%' : '0%' : '',
                    'ddP': ddTarget ? ddSubmit ? (100*ddSubmit/ddTarget).toFixed(2)+'%' : '0%' : '',
                    'eeP': eeTarget ? eeSubmit ? (100*eeSubmit/eeTarget).toFixed(2)+'%' : '0%' : '',
                    'ffP': ffTarget ? ffSubmit ? (100*ffSubmit/ffTarget).toFixed(2)+'%' : '0%' : '',
                });

                let chartDataO = {'labels': [], 'data': [], 'label': [lan.value['寻源堂'], lan.value['成蹊'], lan.value['馨里有谱'], lan.value['仰沁'], lan.value['良友科苑'], lan.value['时光科技'], lan.value['古中山']]};
                chartDataO.data = [
                    {'value': aaSubmit, 'name': lan.value['寻源堂']}, 
                    {'value': bbSubmit, 'name': lan.value['成蹊']},
                    {'value': bbcSubmit, 'name': lan.value['馨里有谱']}, 
                    {'value': ccSubmit, 'name': lan.value['仰沁']},
                    {'value': ddSubmit, 'name': lan.value['良友科苑']}, 
                    {'value': eeSubmit, 'name': lan.value['时光科技']},
                    {'value': ffSubmit, 'name': lan.value['古中山']}, 
                ];
                console.log(chartDataO.data);
                chartData.value = chartDataO;
            }else{
                createMsg(result.msg);
            }
        }

        watch(startTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });
        watch(endTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });

        const isChart = ref(false);
        const subtitle = ref('');

        onMounted(() => {
            startTime.value = getCurrentMonthZero();
            endTime.value = getCurrentMonthZero(0);
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);

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
        const routeType = ref('/SupplierContribution');
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

        return {
            tableData, getDataList, isChart, userRole, startTime, endTime, subtitle,
			chartData, lan, sidebarW, routeList, routeType, tableH, title, type, typeList,
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