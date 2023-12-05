<template>
    <div class="wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="head-wrap">
            <div class="head-left">
                <el-select v-model="routeType" class="w130">
                    <el-option v-for="item in routeList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
            </div>
            <div class="head-right">
                <el-date-picker
                    class="w130"
                    v-model="startTime"
                    :type="accountTime == 1 ? 'date' : 'month'"
                    :placeholder="lan['开始时间']">
                </el-date-picker>
                <el-date-picker
                    class="w130"
                    v-model="endTime"
                    :type="accountTime == 1 ? 'date' : 'month'"
                    :placeholder="lan['结束时间']">
                </el-date-picker>
                <el-select v-model="accountTime" class="w80">
                    <el-option v-for="item in accountTimeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
                <!-- <el-button type="primary" @click="initDownloadExcel">{{lan['下载']}}</el-button> -->
            </div>
        </div>
        <el-table class="el-table-box" :data="tableData" :max-height="tableH" :border="true" :stripe="true">
            <el-table-column prop="englishName" label="日期" :align="'center'"></el-table-column>
            <el-table-column v-for="(ele, i) in roleUserList" :prop="ele.value" :label="ele.label" :key="i" :align="'center'"></el-table-column>
            <el-table-column prop="allUserNumber" label="合计" :align="'center'"></el-table-column>
        </el-table>
        <ChartModule v-if="isChart" :year="Date.now()" :orgName="''" :chartData="chartData" v-on:close="isChart = false" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg, getCurrentMonthZero, getDays, getMonthTimestamp } from '../util/ADS';
import { supplierMS, org, user } from '../util/api';
import ChartModule from '../components/ChartModule.vue';

export default {
    components: {
        ChartModule, 
    },
    name: 'catalogWorkloadSummary',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const tableH = ref(300);

		const startTime = ref('');
		const endTime = ref('');
        const accountTime = ref('1'); // 1日2周3月
        const accountTimeList = ref([
            {'label': '日', 'value': '1'},
            {'label': '周', 'value': '2'},
            {'label': '月', 'value': '3'}
        ]);
        const userKeyArr = ref([]); // 不传所有，传 逗号分隔的字符串
        
        const tableData = ref([]);
        const chartData = ref({'labels': [], 'data': [], 'label': []});
        const getDataList = async () => {
            console.log(startTime.value, endTime.value);
            tableData.value = [];
			changePropertyValue('isLoading', true);
            const result = await supplierMS.GCOverWorkStatistics({
                'startTime': startTime.value ? new Date(startTime.value).getTime() : '',
                'endTime': endTime.value ? new Date(endTime.value).getTime() + (accountTime.value == 1 ? 24*60*60*1000 - 1 : 0) : '',
                'accountTime': accountTime.value,
                'userKeyArr': userKeyArr.value.join(','),
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tableData.value = result.data.map((ele) => {
                    if(ele.sTime){
                        if(ele.eTime && accountTime.value == 2){
                            ele.englishName = getLocalTime(ele.sTime, '-', 1) + '~' + getLocalTime(ele.eTime, '-', 1);
                        }else{
                            ele.englishName = getLocalTime(ele.sTime, '-', accountTime.value == 3 ? 2 : 1);
                        }
                    }else{
                        ele.englishName = '数据汇总';
                    }
                    
                    return ele;
                });

                let chartDataO = {'labels': [], 'data': [], 'label': [lan.value['寻源堂'], lan.value['成蹊'], lan.value['馨里有谱'], lan.value['仰沁'], lan.value['良友科苑'], lan.value['时光科技'], lan.value['古中山']]};
                let aa = [];

                tableData.value.forEach((ele) => {
                    if(ele.englishName == '数据汇总'){

                    }else{
                        chartDataO.labels.push(ele.englishName); 
                        aa.push(ele.aa);
                    }
                });
                chartDataO.data.push(aa);  

                chartData.value = chartDataO;
            }else{
                createMsg(result.msg);
            }
        }

        // 获取编目人员
        const roleUserList = ref([]);
        const getRoleUserList = async () => {
            const result = await user.getRoleUserList({
                'roleKey': '9071165279',
            });
            if(result.status == 200){
                roleUserList.value = result.data.map((ele) => {
                    ele.label = ele.userName;
                    ele.value = ele.userKey;

                    return ele;
                });
            }else{
                createMsg(result.msg);
            }
        }

        // 机构
        let orgKeyO = {};
        const getOrgList = async () => {
            const result = await org.getOrgList(siteKey.value, '');
            if(result.status == 200){
                result.data.map((ele) => {
                    orgKeyO[ele.organizationNo] = ele._key
                });
            }
        }

        // 切换页面
        const routeList = ref([{'label': '按编目汇总', 'value': '/catalogWorkloadSummary'}, {'label': '按机构汇总', 'value': '/catalogSummary'}]);
        const routeType = ref('/catalogWorkloadSummary');
        watch(routeType, (nv, ov) => {
            router.push(nv);
        });
        // 可视化
        const isChart = ref(false);

        watch(accountTime, (nv, ov) => {
            if(nv == 1){
                startTime.value = getCurrentMonthZero(0);
                endTime.value = new Date(getCurrentMonthZero(0)).getTime() + getDays() - 24*60*60*1000;
            }else{
                startTime.value = getCurrentMonthZero();
                endTime.value = getCurrentMonthZero(-1);
            }

            getDataList();
        });

        onMounted(() => {
            startTime.value = getCurrentMonthZero(0);
            endTime.value = new Date(getCurrentMonthZero(0)).getTime() + getDays() - 24*60*60*1000;

            tableH.value = window.innerHeight - 100;

            changePropertyValue('navActive', '/catalogWorkloadSummary');
            changePropertyValue('sidebarW', 0);

            getOrgList();
            getRoleUserList();
            getDataList();
        });

        // 下载
        const initDownloadExcel = () => {
            let aoa = [];
            aoa.push(['月数据', '汇总数据', '寻源堂', '成蹊', '馨里有谱', '仰沁', '良友科苑', '时光科技', '古中山']);
            tableData.value.forEach((ele) => {
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
                openDownloadDialog(sheet2blob(sheet), '编目月度汇总.xlsx');
            })(aoa)
        }

        return {
            tableData, getDataList, isChart, userRole, startTime, endTime,
			chartData, lan, sidebarW, routeList, routeType, 
            initDownloadExcel, tableH, roleUserList, accountTime, accountTimeList
        }
    }
}
</script>

<style lang="scss" scoped>
.wrap{
    position: relative;
    width: calc(100% - 200px);
    height: 100%;
    color: #333;
}
.head-wrap{
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
.marginR10{
    margin-right: 10px;
}
.w130{
    width: 130px !important;
}
.w80{
    width: 80px;
}
.el-table-box{
    width: calc(100% - 40px);
    margin: 0 auto;
}
</style>