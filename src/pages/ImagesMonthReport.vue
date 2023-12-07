<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <div class="head-left">
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="routeType" class="w130">
                    <el-option v-for="item in routeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
                <h3 v-else>{{lan['影像月度汇总']}}</h3>
            </div>
            <div class="head-right">
                <!-- <el-radio-group class="marginR10" v-model="isFileTime" size="small">
                    <el-radio :label="true">{{lan['全部状态']}}</el-radio>
                    <el-radio :label="false">{{lan['审核通过']}}</el-radio>
                </el-radio-group> -->
                <!-- <el-checkbox class="marginR10" v-model="isFileTime">全部状态</el-checkbox> -->
                <div class="chart-box" @click="isChart = true">
                    <span>{{lan['图表展示']}}</span>
                    <img src="../assets/chart.svg" alt="">
                </div>
                <label for="">{{lan['初次上传时间']}}</label>
                <el-date-picker
                    class="w130"
                    v-model="firstSubmitStartTime"
                    type="month"
                    :placeholder="lan['开始时间']">
                </el-date-picker>
                <el-date-picker
                    class="w130"
                    v-model="firstSubmitEndTime"
                    type="month"
                    :placeholder="lan['结束时间']">
                </el-date-picker>
                <label for="">{{lan['最新上传时间']}}</label>
                <el-date-picker
                    class="w130"
                    v-model="uploadStartTime"
                    type="month"
                    :placeholder="lan['开始时间']">
                </el-date-picker>
                <el-date-picker
                    class="w130"
                    v-model="uploadEndTime"
                    type="month"
                    :placeholder="lan['结束时间']">
                </el-date-picker>
                <label for="">{{lan['通过时间']}}</label>
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
                
                <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
                <el-button type="primary" @click="initDownloadExcel">{{lan['下载']}}</el-button>
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
                        <td v-for="(item2, index2) in parameterV" @click="handleCellClick(item2, item)" :key="'parameter_'+index2">
                            <div v-if="item2 === 'action'"></div>
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
        <EchartsModule v-if="isChart" :title="title" :subtitle="subtitle+' '+orgName" :chartData="chartData" v-on:close="isChart = false" />
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
    name: 'imagesMonthReport',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV = ref(['年度月份', '数据汇总', '寻源堂', '成蹊', '馨里有谱', '仰沁', '良友科苑', '时光科技', '古中山']);
        const parameterV = ref(['englishName', 'allOrgNumberT', 'aaT', 'bbT', 'bbcT', 'ccT', 'ddT', 'eeT', 'ffT']);

		const startTime = ref('');
		const endTime = ref('');
        const uploadStartTime = ref('');
		const uploadEndTime = ref('');
        const firstSubmitStartTime = ref('');
        const firstSubmitEndTime = ref('');
        const tbody = ref([]);
        const chartData = ref({'labels': [], 'data': [], 'label': []});
        const getDataList = async () => {
            // if(!startTime.value && !endTime.value && !uploadStartTime.value && !uploadEndTime.value){
            //     return createMsg('请选择时间，上传时间和通过时间必选一个！');
            // }
            tbody.value = [];
			changePropertyValue('isLoading', true);
            const result = await supplierMS.imageMonthSummaryOrg(firstSubmitStartTime.value ? new Date(firstSubmitStartTime.value).getTime() : '', firstSubmitEndTime.value ? new Date(firstSubmitEndTime.value).getTime()+getDays(new Date(firstSubmitEndTime.value).getTime())-1 : '', uploadStartTime.value ? new Date(uploadStartTime.value).getTime() : '', uploadEndTime.value ? new Date(uploadEndTime.value).getTime()+getDays(new Date(uploadEndTime.value).getTime())-1 : '', startTime.value ? new Date(startTime.value).getTime() : '', endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '', isFileTime.value ? 2: 1);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.data.map((ele) => {
                    if(ele.englishName == '数据汇总'){
                        ele.englishName = lan.value[ele.englishName];
                    }else{
                        ele.englishName = ele.year+''+(ele.month <= 9 ? '0'+ele.month : ele.month);
                    }
                    

                    ele.organizationNo = ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '';

                    ele.allOrgNumberT = thousands(ele.allOrgNumber);
                    ele.aaT = thousands(ele.aa);
                    ele.bbT = thousands(ele.bb);
                    ele.bbcT = thousands(ele.bbc);
                    ele.ccT = thousands(ele.cc);
                    ele.ddT = thousands(ele.dd);
                    ele.eeT = thousands(ele.ee);
                    ele.ffT = thousands(ele.ff);
                    
                    return ele;
                });

                let chartDataO = {'labels': [], 'data': [], 'label': [lan.value['寻源堂'], lan.value['成蹊'], lan.value['馨里有谱'], lan.value['仰沁'], lan.value['良友科苑'], lan.value['时光科技'], lan.value['古中山']]};
                let all = [], aa = [], bb = [], bbc = [], cc = [], dd = [], ee = [], ff =[];

                tbody.value.forEach((ele) => {
                    if(ele.englishName == '数据汇总'){

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

        const routeList = ref([
            {'label': '按影像汇总', 'value': '/imageGather'}, 
            {'label': '按机构汇总', 'value': '/imagesMonthReport'}, 
            {'label': '影像准确率', 'value': '/imageRemarkReport'},
            {'label': '月提交量统计', 'value': '/SupplierMonthSubmit'},
            {'label': '供应商贡献度', 'value': '/SupplierContribution'},
            {'label': '审核状态统计', 'value': '/MonthVolumeSubmit'},
        ]);
        const routeType = ref('/imagesMonthReport');
        watch(routeType, (nv, ov) => {
            router.push(nv);
        });

        const isChart = ref(false);

        let orgKeyO = {};
        const getOrgList = async () => {
            const result = await org.getOrgList(siteKey.value, '');
            if(result.status == 200){
                result.data.map((ele) => {
                    orgKeyO[ele.organizationNo+'T'] = ele._key
                });
            }
        }

        watch(startTime, (nv, ov) => {
            console.log(nv);
        });

        onMounted(() => {
            // firstSubmitStartTime.value = getCurrentMonthZero();
            // firstSubmitEndTime.value = getCurrentMonthZero(0);
            // uploadStartTime.value = getCurrentMonthZero();
            // uploadEndTime.value = getCurrentMonthZero(0);
            startTime.value = getCurrentMonthZero();
            endTime.value = getCurrentMonthZero(0);
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);

            getOrgList();
            getDataList();
        });

        const isFileTime = ref(false);
        watch(isFileTime, () => {
            getDataList();
        });

        // 单元格点击 
        const handleCellClick = (row, column) => {
            console.log(row, column);
            let orgKey = '', startTimes = '', endTimes = '', uploadStartTimes = '', uploadEndTimes = '', firstSubmitStartTimes = '', firstSubmitEndTimes = '';

            if(row == 'englishName'){
                return;
            }
            if(row != 'allOrgNumber'){
                orgKey = orgKeyO[row] || '';
            }

            if(column.englishName != '数据汇总'){
                if(startTime.value && endTime.value){
                    startTimes = getMonthTimestamp(column.year, column.month).firstDayTimestamp;
                    endTimes = getMonthTimestamp(column.year, column.month).lastDayTimestamp;

                    uploadStartTimes = uploadStartTime.value ? new Date(uploadStartTime.value).getTime() : '';
                    uploadEndTimes = uploadEndTime.value ? new Date(uploadEndTime.value).getTime()+getDays(new Date(uploadEndTime.value).getTime())-1 : '';

                    firstSubmitStartTimes = firstSubmitStartTime.value ? new Date(firstSubmitStartTime.value).getTime() : '';
                    firstSubmitEndTimes = firstSubmitEndTime.value ? new Date(firstSubmitEndTime.value).getTime()+getDays(new Date(firstSubmitEndTime.value).getTime())-1 : '';
                }else{
                    startTimes = '';
                    endTimes = '';

                    if(uploadStartTime.value && uploadEndTime.value){
                        uploadStartTimes = getMonthTimestamp(column.year, column.month).firstDayTimestamp;
                        uploadEndTimes = getMonthTimestamp(column.year, column.month).lastDayTimestamp;

                        firstSubmitStartTimes = firstSubmitStartTime.value ? new Date(firstSubmitStartTime.value).getTime() : '';
                        firstSubmitEndTimes = firstSubmitEndTime.value ? new Date(firstSubmitEndTime.value).getTime()+getDays(new Date(firstSubmitEndTime.value).getTime())-1 : '';
                    }else{
                        uploadStartTimes = uploadStartTime.value ? new Date(uploadStartTime.value).getTime() : '';
                        uploadEndTimes = uploadEndTime.value ? new Date(uploadEndTime.value).getTime()+getDays(new Date(uploadEndTime.value).getTime())-1 : '';

                        firstSubmitStartTimes = getMonthTimestamp(column.year, column.month).firstDayTimestamp;
                        firstSubmitEndTimes = getMonthTimestamp(column.year, column.month).lastDayTimestamp;
                    }
                }
            }else{
                startTimes = startTime.value ? new Date(startTime.value).getTime() : '';
                endTimes = endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '';

                uploadStartTimes = uploadStartTime.value ? new Date(uploadStartTime.value).getTime() : '';
                uploadEndTimes = uploadEndTime.value ? new Date(uploadEndTime.value).getTime()+getDays(new Date(uploadEndTime.value).getTime())-1 : '';

                firstSubmitStartTimes = firstSubmitStartTime.value ? new Date(firstSubmitStartTime.value).getTime() : '';
                firstSubmitEndTimes = firstSubmitEndTime.value ? new Date(firstSubmitEndTime.value).getTime()+getDays(new Date(firstSubmitEndTime.value).getTime())-1 : '';
            }

            window.open('/imageStatistics?orgKey='+orgKey+'&startTime='+startTimes+'&endTime='+endTimes+'&uploadStartTime='+uploadStartTimes+'&uploadEndTime='+uploadEndTimes+'&firstSubmitStartTime='+firstSubmitStartTimes+'&firstSubmitEndTime='+firstSubmitEndTimes+'&isAll=1');
        }

        // 下载
        const initDownloadExcel = () => {
            let aoa = [], t = [];
            theadV.value.forEach((ele) => {
                t.push(lan.value[ele]);
            });
            aoa.push(t);
            
            tbody.value.forEach((ele) => {
                aoa.push([ele.englishName, ele.allOrgNumber, ele.aa, ele.bb, ele.bbc, ele.cc, ele.dd, ele.ee, ele.ff]);
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
                openDownloadDialog(sheet2blob(sheet), lan.value['影像月度汇总']+'.xlsx');
            })(aoa)
        }

        const orgName = ref('');
        const title = ref(lan.value['影像月度汇总']);
        const subtitle = ref('');
        watch(startTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });
        watch(endTime, (nv, ov) => {
            subtitle.value = getLocalTime(startTime.value, '/', 2) + '-' + getLocalTime((endTime.value), '/', 2);
        });

        const getBlobByFetch = () => {
            fetch('https://indexserver.1jiapu.com/index/CN3054551/3014697271/3014697271.tar.gz')
            .then((r) => {
                return r.blob();
            })
            .then((blob) => {
                function showFile(blob){
                    // It is necessary to create a new blob object with mime-type explicitly set
                    // otherwise only Chrome works like it should
                    let newBlob = new Blob([blob], {type: blob.type})

                    // IE doesn't allow using a blob object directly as link href
                    // instead it is necessary to use msSaveOrOpenBlob
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(newBlob);
                        return;
                    }

                    // For other browsers:
                    // Create a link pointing to the ObjectURL containing the blob.
                    let data = window.URL.createObjectURL(newBlob);
                    let link = document.createElement('a');
                    link.href = data;
                    link.download = "3014697271.tar.gz";
                    link.click();
                    let t = setTimeout(function(){
                        // For Firefox it is necessary to delay revoking the ObjectURL
                        window.URL.revokeObjectURL(data);
                        clearTimeout(t);
                        t = null;
                        newBlob = null;
                        data = null;
                        link = null;
                    }, 100);
                }

                showFile(blob);
            });
        }

        return {
            theadV, parameterV, tbody, getDataList, isChart, userRole, startTime, endTime,
			chartData, lan, sidebarW, routeList, routeType, isFileTime, handleCellClick, orgName,
            initDownloadExcel, uploadStartTime, uploadEndTime, firstSubmitStartTime, firstSubmitEndTime, title, subtitle,
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
</style>