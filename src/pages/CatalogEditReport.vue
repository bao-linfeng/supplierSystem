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
        <el-table 
            class="el-table-box" 
            :cell-class-name="cellClassName"
            :data="tableData" 
            :max-height="tableH">
            <el-table-column prop="time" :label="lan['年度月份']" width="120" :align="'center'" />
            <el-table-column prop="organizationNo" :label="lan['机构名称']" width="90" :align="'center'" />
            <el-table-column prop="inStoreTotalNumber" :label="lan['有影像谱目数']" width="90" :align="'center'" />
            <el-table-column :label="lan['原始编目正确率(%)']" :align="'center'">
                <el-table-column prop="genealogyNameO" :label="lan['谱名']" :align="'center'" />
                <el-table-column prop="surnameO" :label="lan['姓氏']" :align="'center'" />
                <el-table-column prop="publishO" :label="lan['出版年']" :align="'center'" />
                <el-table-column prop="hallO" :label="lan['堂号']" :align="'center'" />
                <el-table-column prop="firstAncestorO" :label="lan['一世祖']" :align="'center'" />
                <el-table-column prop="migrationAncestorO" :label="lan['始迁祖']" :align="'center'" />
                <el-table-column prop="placeO" :label="lan['谱籍地(原谱)']" :align="'center'" />
                <el-table-column prop="LocalityModernO" :label="lan['谱籍地(现代)']" :align="'center'" />
                <el-table-column prop="volumeO" :label="lan['总卷数']" :align="'center'" />
                <el-table-column prop="lostVolumeO" :label="lan['缺卷说明']" :align="'center'" />
                <el-table-column prop="hasVolumeO" :label="lan['可拍册数']" :align="'center'" />
                <el-table-column prop="authorsO" :label="lan['作者']" :align="'center'" />
                <el-table-column prop="authorJobO" :label="lan['作者职务']" :align="'center'" />
            </el-table-column>
            <!-- <el-table-column prop="poorO" :label="lan['不良率']" width="90" :align="'center'" /> -->
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
    name: 'catalogEditReport',
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
            {'label': '日', 'value': 1},
            {'label': '周', 'value': 2},
            {'label': '月', 'value': 3},
        ]);
        const orgKeyN = ref('');
        const orgList = ref([]);
        
        const tableData = ref([]);
        const chartData = ref({'labels': [], 'data': [], 'label': []});
        // 机构汇总统计数据
        const getDataList = async () => {
            tableData.value = [];
			changePropertyValue('isLoading', true);
            const result = await supplierMS.GCOverAnalysisArray({
                'orgKey': orgKeyN.value,
                'startTime': startTime.value ? new Date(startTime.value).getTime() : '',
                'endTime': endTime.value ? new Date(endTime.value).getTime()+getDays(new Date(endTime.value).getTime())-1 : '',
                'accountTime': accountTime.value,
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, k= 0, l = 0, m = 0, n =0, inStoreTotalNumber = 0;
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

                    ele.inStoreTotalNumber = ele.inStoreTotalNumber || 0;

                    inStoreTotalNumber = inStoreTotalNumber + (ele.inStoreTotalNumber || 0);
                    a = a + (ele.genealogyName || 0);
                    b = b + (ele.surname || 0);
                    c = c + (ele.publish || 0);
                    d = d + (ele.hall || 0);
                    e = e + (ele.firstAncestor || 0);
                    f = f + (ele.migrationAncestor || 0);
                    g = g + (ele.place || 0);
                    h = h + (ele.LocalityModern || 0);
                    i = i + (ele.volume || 0);
                    j = j + (ele.lostVolume || 0);
                    k = k + (ele.hasVolume || 0);
                    l = l + (ele.authors || 0);
                    m = m + (ele.authorJob || 0);
                    n = n + (ele.poor || 0);


                    ele.genealogyNameO = ele.genealogyName ? (100*(1 - ele.genealogyName/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.surnameO = ele.surname ? (100*(1 - ele.surname/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.publishO = ele.publish ? (100*(1 - ele.publish/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.hallO = ele.hall ? (100*(1 - ele.hall/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.firstAncestorO = ele.firstAncestor ? (100*(1 - ele.firstAncestor/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.migrationAncestorO = ele.migrationAncestor ? (100*(1 - ele.migrationAncestor/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.placeO = ele.place ? (100*(1 - ele.place/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.LocalityModernO = ele.LocalityModern ? (100*(1 - ele.LocalityModern/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.volumeO = ele.volume ? (100*(1 - ele.volume/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.lostVolumeO = ele.lostVolume ? (100*(1 - ele.lostVolume/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.hasVolumeO = ele.hasVolume ? (100*(1 - ele.hasVolume/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.authorsO = ele.authors ? (100*(1 - ele.authors/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.authorJobO = ele.authorJob ? (100*(1 - ele.authorJob/ele.inStoreTotalNumber)).toFixed(2)+'%' : '100%';
                    ele.poorO = ele.poor ? (100*(ele.poor/ele.inStoreTotalNumber)).toFixed(2)+'%' : '0%';

                    ele.genealogyNameP = ele.genealogyName ? (100*(1 - ele.genealogyName/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.surnameP = ele.surname ? (100*(1 - ele.surname/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.publishP = ele.publish ? (100*(1 - ele.publish/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.hallP = ele.hall ? (100*(1 - ele.hall/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.firstAncestorP = ele.firstAncestor ? (100*(1 - ele.firstAncestor/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.migrationAncestorP = ele.migrationAncestor ? (100*(1 - ele.migrationAncestor/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.placeP = ele.place ? (100*(1 - ele.place/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.LocalityModernP = ele.LocalityModern ? (100*(1 - ele.LocalityModern/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.volumeP = ele.volume ? (100*(1 - ele.volume/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.lostVolumeP = ele.lostVolume ? (100*(1 - ele.lostVolume/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.hasVolumeP = ele.hasVolume ? (100*(1 - ele.hasVolume/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.authorsP = ele.authors ? (100*(1 - ele.authors/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.authorJobP = ele.authorJob ? (100*(1 - ele.authorJob/ele.inStoreTotalNumber)).toFixed(2) : '100';
                    ele.poorP = ele.poor ? (100*(ele.poor/ele.inStoreTotalNumber)).toFixed(2) : '0';
                    
                    
                    return ele;
                });

                tableData.value.push({
                    'time': lan.value['合计'], 
                    'inStoreTotalNumber': thousands(inStoreTotalNumber),
                    'genealogyNameO': a ? (100*(1 - a/inStoreTotalNumber)).toFixed(2)+'%' : '100%', 
                    'surnameO': b ? (100*(1 - b/inStoreTotalNumber)).toFixed(2)+'%' : '100%', 
                    'publishO': c ? (100*(1 - c/inStoreTotalNumber)).toFixed(2)+'%' : '100%', 
                    'hallO': d ? (100*(1 - d/inStoreTotalNumber)).toFixed(2)+'%' : '100%', 
                    'firstAncestorO': e ? (100*(1 - e/inStoreTotalNumber)).toFixed(2)+'%' : '100%', 
                    'migrationAncestorO': f ? (100*(1 - f/inStoreTotalNumber)).toFixed(2)+'%' : '100%', 
                    'placeO': g ? (100*(1 - g/inStoreTotalNumber)).toFixed(2)+'%' : '100%', 
                    'LocalityModernO': h ? (100*(1 - h/inStoreTotalNumber)).toFixed(2)+'%' : '100%',
                    'volumeO': i ? (100*(1 - i/inStoreTotalNumber)).toFixed(2)+'%' : '100%',
                    'lostVolumeO': j ? (100*(1 - j/inStoreTotalNumber)).toFixed(2)+'%' : '100%',
                    'hasVolumeO': k ? (100*(1 - k/inStoreTotalNumber)).toFixed(2)+'%' : '100%',
                    'authorsO': l ? (100*(1 - l/inStoreTotalNumber)).toFixed(2)+'%' : '100%',
                    'authorJobO': m ? (100*(1 - m/inStoreTotalNumber)).toFixed(2)+'%' : '100%',
                    'poorO': n ? (100*(n/inStoreTotalNumber)).toFixed(2)+'%' : '100%',

                    'genealogyNameP': a ? (100*(1 - a/inStoreTotalNumber)).toFixed(2) : '100', 
                    'surnameP': b ? (100*(1 - b/inStoreTotalNumber)).toFixed(2) : '100', 
                    'publishP': c ? (100*(1 - c/inStoreTotalNumber)).toFixed(2) : '100', 
                    'hallP': d ? (100*(1 - d/inStoreTotalNumber)).toFixed(2) : '100', 
                    'firstAncestorP': e ? (100*(1 - e/inStoreTotalNumber)).toFixed(2) : '100', 
                    'migrationAncestorP': f ? (100*(1 - f/inStoreTotalNumber)).toFixed(2) : '100', 
                    'placeP': g ? (100*(1 - g/inStoreTotalNumber)).toFixed(2) : '100', 
                    'LocalityModernP': h ? (100*(1 - h/inStoreTotalNumber)).toFixed(2) : '100',
                    'volumeP': i ? (100*(1 - i/inStoreTotalNumber)).toFixed(2) : '100',
                    'lostVolumeP': j ? (100*(1 - j/inStoreTotalNumber)).toFixed(2) : '100',
                    'hasVolumeP': k ? (100*(1 - k/inStoreTotalNumber)).toFixed(2) : '100',
                    'authorsP': l ? (100*(1 - l/inStoreTotalNumber)).toFixed(2) : '100',
                    'authorJobP': m ? (100*(1 - m/inStoreTotalNumber)).toFixed(2) : '100',
                    'poorP': n ? (100*(n/inStoreTotalNumber)).toFixed(2) : '0',
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

        const cellClassName = ({ row, column, rowIndex, columnIndex }) => {
            if(row.genealogyNameP < 90 && column.property == 'genealogyNameO'){
                return 'red-color';
            }
            if(row.surnameP < 90 && column.property == 'surnameO'){
                return 'red-color';
            }
            if(row.publishP < 90 && column.property == 'publishO'){
                return 'red-color';
            }
            if(row.hallP < 90 && column.property == 'hallO'){
                return 'red-color';
            }
            if(row.firstAncestorP < 90 && column.property == 'firstAncestorO'){
                return 'red-color';
            }
            if(row.migrationAncestorP < 90 && column.property == 'migrationAncestorO'){
                return 'red-color';
            }
            if(row.placeP < 90 && column.property == 'placeO'){
                return 'red-color';
            }
            if(row.LocalityModernP < 90 && column.property == 'LocalityModernO'){
                return 'red-color';
            }
            if(row.volumeP < 90 && column.property == 'volumeO'){
                return 'red-color';
            }
            if(row.lostVolumeP < 90 && column.property == 'lostVolumeO'){
                return 'red-color';
            }
            if(row.hasVolumeP < 90 && column.property == 'hasVolumeO'){
                return 'red-color';
            }
            if(row.authorsP < 90 && column.property == 'authorsO'){
                return 'red-color';
            }
            if(row.authorJobP < 90 && column.property == 'authorJobO'){
                return 'red-color';
            }
            if(row.poorP < 90 && column.property == 'poorP'){
                return 'red-color';
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
        const routeList = ref([{'label': '按影像汇总', 'value': '/imageGather'}, {'label': '按机构汇总', 'value': '/imagesMonthReport'}, {'label': '机构编目准确率统计表', 'value': '/catalogEditReport'}]);
        const routeType = ref('/catalogEditReport');
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
            ['年度月份', '机构名称', '进微站总册数', '谱名', '姓氏', '出版年', '一世祖', '始迁祖', '谱籍地(原谱)', '谱籍地(现代)', '总卷数', '缺卷说明', '可拍册数', '作者', '作者职务'].forEach((ele) => {
                t.push(lan.value[ele]);
            });
            aoa.push(t);
            tableData.value.forEach((ele) => {
                aoa.push([ele.time, ele.organizationNo, ele.inStoreTotalNumber, ele.genealogyName, ele.surname, ele.publish, ele.firstAncestor, ele.migrationAncestor, ele.place, ele.LocalityModern, ele.volume, ele.lostVolume, ele.hasVolume, ele.authors, ele.authorJob]);
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
                openDownloadDialog(sheet2blob(sheet), lan.value['机构编目准确率统计表']+'.xlsx');
            })(aoa)
        }

        return {
            tableData, getDataList, isChart, userRole, startTime, endTime,
			chartData, lan, sidebarW, routeList, routeType, orgList, orgKeyN,
            initDownloadExcel, tableH, accountTime, accountTimeList, cellClassName
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