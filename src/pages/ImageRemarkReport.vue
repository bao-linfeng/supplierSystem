<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <div class="head-left">
                <el-select v-model="routeType" class="w130">
                    <el-option v-for="item in routeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
            </div>
            <div class="head-right">
                <!-- <div class="chart-box" @click="isChart = true">
                    <span>{{lan['图表展示']}}</span>
                    <img src="../assets/chart.svg" alt="">
                </div> -->
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="w130" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
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
                <el-select v-model="accountTime" class="w130">
                    <el-option v-for="item in accountTimeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
                <el-button type="primary" @click="initDownloadExcel">{{lan['下载']}}</el-button>
            </div>
        </div>
        <el-table class="el-table-box" :data="tableData" :max-height="tableH">
            <el-table-column prop="time" :label="lan['年度月份']" width="120" fixed :align="'center'" />
            <el-table-column prop="organizationNo" :label="lan['机构名称']" width="90" fixed :align="'center'" />
            <el-table-column prop="inStoreTotalNumberO" :label="lan['已完成总册数']" width="120" fixed :align="'center'" />
            <el-table-column :label="lan['影像错误原因分析']" fixed :align="'center'">
                <el-table-column prop="模糊" :label="lan['模糊']" fixed :align="'center'" />
                <el-table-column prop="缺页" :label="lan['缺页']" fixed :align="'center'" />
                <el-table-column prop="重复" :label="lan['重复']" fixed :align="'center'" />
                <el-table-column prop="有异物" :label="lan['有异物']" fixed :align="'center'" />
                <el-table-column prop="不完整" :label="lan['不完整']" fixed :align="'center'" />
                <el-table-column prop="非家谱影像" :label="lan['非家谱影像']" fixed :align="'center'" />
                <el-table-column prop="影像歪斜" :label="lan['影像歪斜']" fixed :align="'center'" />
                <el-table-column prop="其他" :label="lan['其他']" fixed :align="'center'" />
                <!-- <el-table-column prop="卷册名" :label="lan['卷册名']" fixed :align="'center'" /> -->
            </el-table-column>
            <el-table-column prop="poorO" :label="lan['不良率']" width="90" :align="'center'" />
        </el-table>
        <EchartsModule v-if="isChart" :year="Date.now()" :orgName="''" :chartData="chartData" v-on:close="isChart = false" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg, getCurrentMonthZero, getDays, getMonthTimestamp, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import EchartsModule from '../components/EchartsModule.vue';

export default {
    components: {
        EchartsModule,
    },
    name: 'imageRemarkReport',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const tableH = ref(300);

		const startTime = ref('');
		const endTime = ref('');
        const accountTime = ref(3);
        const accountTimeList = ref([
            {'label': lan.value['日'], 'value': 1},
            {'label': lan.value['周'], 'value': 2},
            {'label': lan.value['月'], 'value': 3},
        ]);
        const orgKeyN = ref('');
        const orgList = ref([]);
        
        const tableData = ref([]);
        const chartData = ref({'labels': [], 'data': [], 'label': []});
        // 机构汇总统计数据
        const getDataList = async () => {
            tableData.value = [];
			changePropertyValue('isLoading', true);
            const result = await supplierMS.errorCausesAnalysis({
                'orgKey': orgKeyN.value,
                'startTime': startTime.value ? new Date(startTime.value).getTime() : '',
                'endTime': endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '',
                'accountTime': accountTime.value,
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, inStoreTotalNumber = 0;
                tableData.value = result.data.map((ele) => {
                    if(ele.year){
                        ele.time = ele.year+(ele.month <= 9 ? '0'+ele.month : ''+ele.month);
                    }else if(ele.eTime){
                        ele.time = getLocalTime(ele.sTime, '/', 1) + '~' + getLocalTime(ele.eTime, '/', 1);
                    }else{
                        ele.time = getLocalTime(ele.sTime, '/', 1);
                    }

                    if(ele.organizationNo){

                    }else{
                        ele.organizationNo = lan.value['全部机构'];
                    }

                    a = a + (ele['模糊'] || 0);
                    b = b + (ele['缺页'] || 0);
                    c = c + (ele['重复'] || 0);
                    d = d + (ele['有异物'] || 0);
                    e = e + (ele['不完整'] || 0);
                    f = f + (ele['非家谱影像'] || 0);
                    g = g + (ele['影像歪斜'] || 0);
                    h = h + (ele['其他'] || 0);
                    i = i + (ele.poor || 0);
                    inStoreTotalNumber = inStoreTotalNumber + (ele.inStoreTotalNumber || 0);



                    ele['模糊'] = ele['模糊'] ? (100*ele['模糊']/ele.inStoreTotalNumber).toFixed(2)+'%' : '0%';
                    ele['缺页'] = ele['缺页'] ? (100*ele['缺页']/ele.inStoreTotalNumber).toFixed(2)+'%' : '0%';
                    ele['重复'] = ele['重复'] ? (100*ele['重复']/ele.inStoreTotalNumber).toFixed(2)+'%' : '0%';
                    ele['有异物'] = ele['有异物'] ? (100*ele['有异物']/ele.inStoreTotalNumber).toFixed(2)+'%' : '0%';
                    ele['不完整'] = ele['不完整'] ? (100*ele['不完整']/ele.inStoreTotalNumber).toFixed(2)+'%' : '0%';
                    ele['非家谱影像'] = ele['非家谱影像'] ? (100*ele['非家谱影像']/ele.inStoreTotalNumber).toFixed(2)+'%' : '0%';
                    ele['影像歪斜'] = ele['影像歪斜'] ? (100*ele['影像歪斜']/ele.inStoreTotalNumber).toFixed(2)+'%' : '0%';
                    ele['其他'] = ele['其他'] ? (100*ele['其他']/ele.inStoreTotalNumber).toFixed(2)+'%' : '0%';
                    ele.poorO = ele.poor ? (100*(ele.poor/ele.inStoreTotalNumber)).toFixed(2)+'%' : '0%';

                    ele.inStoreTotalNumberO = thousands(ele.inStoreTotalNumber);
                    
                    return ele;
                });

                tableData.value.push({
                    'time': lan.value['合计'], 
                    'inStoreTotalNumberO': thousands(inStoreTotalNumber),
                    '模糊': a ? (100*a/inStoreTotalNumber).toFixed(2)+'%' : '0%', 
                    '缺页': b ? (100*b/inStoreTotalNumber).toFixed(2)+'%' : '0%', 
                    '重复': c ? (100*c/inStoreTotalNumber).toFixed(2)+'%' : '0%', 
                    '有异物': d ? (100*d/inStoreTotalNumber).toFixed(2)+'%' : '0%', 
                    '不完整': e ? (100*e/inStoreTotalNumber).toFixed(2)+'%' : '0%', 
                    '非家谱影像': f ? (100*f/inStoreTotalNumber).toFixed(2)+'%' : '0%', 
                    '影像歪斜': g ? (100*g/inStoreTotalNumber).toFixed(2)+'%' : '0%', 
                    '其他': h ? (100*h/inStoreTotalNumber).toFixed(2)+'%' : '0%',
                    'poorO': i ? (100*i/inStoreTotalNumber).toFixed(2)+'%' : '0%',
                });

                let chartDataO = {'labels': [], 'data': [], 'label': [lan.value['寻源堂'], lan.value['成蹊'], lan.value['馨里有谱'], lan.value['仰沁'], lan.value['良友科苑'], lan.value['时光科技'], lan.value['古中山']]};
                let aa = [], bb = [], bbc = [], cc = [], dd = [], ee = [], ff =[];

                tableData.value.forEach((ele) => {
                    if(ele.englishName == '数据汇总'){

                    }else{
                        chartDataO.labels.push(ele.englishName); 
                        aa.push(ele.aa);
                        bb.push(ele.bb);
                        bbc.push(ele.bbc);
                        cc.push(ele.cc);
                        dd.push(ele.dd);
                        ee.push(ele.ee);
                        ff.push(ele.ff);
                    }
                });
                chartDataO.data.push(aa); 
                chartDataO.data.push(bb); 
                chartDataO.data.push(bbc); 
                chartDataO.data.push(cc); 
                chartDataO.data.push(dd); 
                chartDataO.data.push(ee); 
                chartDataO.data.push(ff); 

                chartData.value = chartDataO;
            }else{
                createMsg(result.msg);
            }
        }

        // 机构
        let orgKeyO = {};
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

        // 切换页面
        const routeList = ref([
            {'label': '按影像汇总', 'value': '/imageGather'}, 
            {'label': '按机构汇总', 'value': '/imagesMonthReport'}, 
            {'label': '影像准确率', 'value': '/imageRemarkReport'},
            {'label': '月提交量统计', 'value': '/SupplierMonthSubmit'},
            {'label': '供应商贡献度', 'value': '/SupplierContribution'},
            {'label': '审核状态统计', 'value': '/MonthVolumeSubmit'},
        ]);
        const routeType = ref('/imageRemarkReport');
        watch(routeType, (nv, ov) => {
            router.push(nv);
        });
        // 可视化
        const isChart = ref(false);

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){

            }else{
                orgKeyN.value = orgKey.value;
            }

            startTime.value = getCurrentMonthZero();
            endTime.value = getCurrentMonthZero(0);

            tableH.value = window.innerHeight - 100;

            getOrgList();
            getDataList();
        });

        // 下载
        const initDownloadExcel = () => {
            let aoa = [], t = [];
            ['年度月份', '机构名称', '已完成总册数', '模糊', '缺页', '重复', '有异物', '不完整', '非家谱影像', '影像歪斜', '其他'].forEach((ele) => {
                t.push(lan.value[ele]);
            });
            aoa.push(t);
            tableData.value.forEach((ele) => {
                aoa.push([ele.time, ele.organizationNo, ele.inStoreTotalNumberO, ele['模糊'], ele['缺页'], ele['重复'], ele['有异物'], ele['不完整'], ele['非家谱影像'], ele['影像歪斜'], ele['其他']]);
            });
            /** 
            * 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
            * @param sheet
            * @param sheetName
            */
            function sheet2blob(sheet, sheetName) {
                sheetName = sheetName || 'sheet1';
                var workbook = {
                    SheetNames: [sheetName],
                    Sheets: {}
                };
                workbook.Sheets[sheetName] = sheet;
                // 生成excel的配置项
                var wopts = {
                    bookType: 'xlsx', // 要生成的文件类型
                    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
                    type: 'binary'
                };
                var wbout = XLSX.write(workbook, wopts);
                var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
                // 字符串转ArrayBuffer
                function s2ab(s) {
                    var buf = new ArrayBuffer(s.length), view = new Uint8Array(buf);
                    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                    return buf;
                }
                return blob;
            }

            /**
             * 通用的打开下载对话框方法，没有测试过具体兼容性
             * @param url 下载地址，也可以是一个blob对象，必选
             * @param saveName 保存文件名，可选
             */
            function openDownloadDialog(url, saveName){
                if(typeof url == 'object' && url instanceof Blob){
                    url = URL.createObjectURL(url); // 创建blob地址
                }
                var aLink = document.createElement('a'), event;
                aLink.href = url;
                aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
                if(window.MouseEvent) event = new MouseEvent('click');
                else{
                    event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                }
                aLink.dispatchEvent(event);
            }

            /**
             * 导出excel
             * @param aoa 二维数组，表格头部数据
            */
            (function aoa_to_sheet(aoa){
                let XLSX = window.XLSX;
                var sheet = XLSX.utils.aoa_to_sheet(aoa);
                openDownloadDialog(sheet2blob(sheet), lan.value['影像准确率']+'.xlsx');
            })(aoa)
        }

        return {
            tableData, getDataList, isChart, userRole, startTime, endTime,
			chartData, lan, sidebarW, routeList, routeType, orgList, orgKeyN,
            initDownloadExcel, tableH, accountTime, accountTimeList
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
                cursor: pointer;
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
.w130{
    width: 130px !important;
}
.el-table-box{
    width: calc(100% - 40px);
    margin: 0 auto;
}
</style>