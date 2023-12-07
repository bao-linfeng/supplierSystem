<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <div class="head-left">
                <h3>{{lan['发票清单']}}</h3>
                <div class="toggle-box" @click="changeToggle">
                    <i>{{!toggle ? lan['展开'] : lan['收起']}}</i>
                </div>
            </div>
            <!-- <div class="chart-box" @click="isChart = true">
                <span>{{lan['图表展示']}}</span>
                <img src="../assets/chart.svg" alt="">
            </div> -->
        </div>
        <div class="search-wrap">
            <div class="search-box">
                <label for="">{{lan['发票创建时间']}}</label>
                <el-date-picker
                    class="width180"
                    v-model="billCreateTime"
                    type="monthrange"
                    unlink-panels
                />
                <label for="">{{lan['发票通过时间']}}</label>
                <el-date-picker
                    class="width180"
                    v-model="billPassTime"
                    type="monthrange"
                    unlink-panels
                />
                <el-select class="width100" v-model="billStatus" multiple :placeholder="lan['发票状态筛选']">
                    <el-option v-for="item in billStatusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-if="userRole >= 1 && userRole <= 3" class="width100" v-model="orgKeyN" multiple :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
                <el-button type="primary" @click="getDataDownload">{{lan['下载']}}</el-button>
            </div>
            <div class="search-box" v-show="toggle">
                <label for="">{{lan['影像上传时间']}}</label>
                <el-date-picker
                    class="width180"
                    v-model="uploadTime"
                    type="monthrange"
                    unlink-panels
                />
                <label for="">{{lan['审核通过时间']}}</label>
                <el-date-picker
                    class="width180"
                    v-model="imgPassTime"
                    type="monthrange"
                    unlink-panels
                />
                <el-select class="width100" v-model="status" multiple :placeholder="lan['卷状态筛选']">
                    <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
        </div>
        <div class="contract-content style1" :class="{active: toggle}">
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV" :key="'thead_'+index" @click="handleSort(item)">
                            <div class="th-box">
                                <i>{{lan[item.label]}}</i>
                                <img v-if="item.sort" class="sort" :src="item.sortType == 'auto' ? auto : item.sortType == 'asc' ? asc : desc" />
                            </div> 
                        </th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr :class="{active: item.all}" v-for="(item, index) in tbody" :key="'tbody_'+index">
                        <td v-for="(item2, index2) in theadV" :key="'parameter_'+index2">
                            <div v-if="item2.value === 'action'">
                                <button class="button btn marginR10" @click="handleRowClick(item)">{{lan['详情']}}</button>
                                <button v-if="!item.all" class="button btn" @click="handleDownLoad(item)">{{lan['下载']}}</button>
                            </div>
                            <i v-else>{{item[item2.value]}}</i>
                        </td>
                    </tr>
                    <tr v-if="!tbody.length">
                        <td :colspan="theadV.length">{{lan['暂无数据']}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <ChartModule v-if="isChart" :year="Date.now()" :orgName="''" :chartData="chartData" v-on:close="isChart = false" />
        <BillStatisticsModule v-if="isList" :class="{active: toggle}" :searchO="searchO" v-on:close="isList = false" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg, getCurrentMonthZero, getDays, getMonthTimestamp, downliadLink, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import ChartModule from '../components/ChartModule.vue';
import BillStatisticsModule from '../components/BillStatisticsModule.vue';
import auto from '../assets/icon/auto.svg';
import asc from '../assets/icon/asc.svg';
import desc from '../assets/icon/desc.svg';

export default {
    components: {
        ChartModule, BillStatisticsModule, 
    },
    name: 'billMonthReport',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType, billStatusO } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV = ref([
            {'label': '机构名称', 'value': 'name', 'sort': true, 'sortType': 'auto', 'sortBy': 'englishName'},
            {'label': '发票编号', 'value': 'billNo', 'sort': false, 'sortType': 'auto', 'sortBy': 'billNo'},
            {'label': '发票提交时间', 'value': 'createTimeO', 'sort': true, 'sortType': 'auto', 'sortBy': 'createTime'},
            {'label': '发票审核通过时间', 'value': 'billPassTimeO', 'sort': true, 'sortType': 'auto', 'sortBy': 'billPassTime'},
            {'label': '提交谱数', 'value': 'gcNumberT', 'sort': false, 'sortType': '', 'sortBy': ''},
            {'label': '卷数', 'value': 'volumeNumberT', 'sort': false, 'sortType': '', 'sortBy': ''},
            {'label': '影像页数', 'value': 'imgNumberT', 'sort': false, 'sortType': '', 'sortBy': ''},
            {'label': '金额小计', 'value': 'amountO', 'sort': false, 'sortType': '', 'sortBy': ''},
            {'label': '实付金额', 'value': 'paidInAmountO', 'sort': false, 'sortType': '', 'sortBy': ''},
            {'label': '发票状态', 'value': 'billStatusO', 'sort': false, 'sortType': '', 'sortBy': ''},
            {'label': '操作', 'value': 'action', 'sort': false, 'sortType': '', 'sortBy': ''},
        ]);

        const handleSort = (data) => {
            sortField.value = data.sortBy;
            theadV.value.forEach((ele) => {
                if(ele.value == data.value){
                    if(ele.sortType == 'auto'){
                        ele.sortType = 'asc';
                    }else if(ele.sortType == 'asc'){
                        ele.sortType = 'desc';
                    }else if(ele.sortType == 'desc'){
                        ele.sortType = 'auto';
                    }
                    sortType.value = ele.sortType;
                    handleSortFn();
                }else{
                    ele.sortType = 'auto';
                }
            });
        }

        const handleSortFn = () => {
            tbody.value.sort((a, b) => {
                if(sortField.value == 'englishName'){
                    if(sortType.value == 'asc'){
                        if(a[sortField.value] > b[sortField.value]){
                            return 1;
                        }
                        if(a[sortField.value] < b[sortField.value]){
                            return -1;
                        }
                    }
                    if(sortType.value == 'desc'){
                        if(b[sortField.value] > a[sortField.value]){
                            return 1;
                        }
                        if(b[sortField.value] < a[sortField.value]){
                            return -1;
                        }
                    }
                }else{
                    if(sortType.value == 'asc'){
                        return a[sortField.value] - b[sortField.value];
                    }
                    if(sortType.value == 'desc'){
                        return b[sortField.value] - a[sortField.value];
                    }
                }
                
                return 0;
            });
        }

        const sortField = ref('');
        const sortType = ref('');

        const billCreateTime = ref('');
		const billCreateStartTime = ref('');
		const billCreateEndTime = ref('');

        const billPassTime = ref('');
        const billPassStartTime = ref('');
		const billPassEndTime = ref('');

        const uploadTime = ref('');
        const uploadStartTime = ref('');
		const uploadEndTime = ref('');

        const imgPassTime = ref('');
        const imgPassStartTime = ref('');
		const imgPassEndTime = ref('');

        const orgList = ref([]);
        const orgKeyN = ref([]);
        const tbody = ref([]);
        const chartData = ref({'labels': [], 'data': [], 'label': []});
        const getDataList = async () => {
            isList.value = false;
            tbody.value = [];
			changePropertyValue('isLoading', true);
            const result = await supplierMS.settledBillStatistics({
                    'billCreateStartTime': billCreateStartTime.value,
                    'billCreateEndTime': billCreateEndTime.value,
                    'billPassStartTime': billPassStartTime.value,
                    'billPassEndTime': billPassEndTime.value,
                    'uploadStartTime': uploadStartTime.value,
                    'uploadEndTime': uploadEndTime.value,
                    'imgPassStartTime': imgPassStartTime.value,
                    'imgPassEndTime': imgPassEndTime.value,
                    'orgKey': orgKeyN.value.join(','),
                    'billStatus': billStatus.value.join(','),
                    'siteKey': siteKey.value,
                    'status': status.value.join(','),
                });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let gcNumber = 0, volumeNumber = 0, imgNumber = 0, amount = 0, billNumber = 0;
                tbody.value = result.data.map((ele) => {
                    ele.name = lanType.value == 'en' ? ele.englishName : ele.orgName;
                    ele.amountO = '$'+thousands(ele.amount);
                    ele.paidInAmountO = '$'+thousands(ele.amount + ele.deductionAmount);
                    ele.billStatusO = lan.value[billStatusO.value[ele.billStatus]];
                    ele.createTimeO = getLocalTime(ele.createTime, '/', 1);
                    ele.billPassTimeO = getLocalTime(ele.billPassTime, '/', 1);
                    gcNumber = ele.gcNumber + gcNumber;
                    volumeNumber = ele.volumeNumber + volumeNumber;
                    imgNumber = ele.imgNumber + imgNumber;
                    amount = ele.amount + amount;
                    billNumber = billNumber + 1;

                    ele.gcNumberT = thousands(ele.gcNumber);
                    ele.volumeNumberT = thousands(ele.volumeNumber);
                    ele.imgNumberT = thousands(ele.imgNumber);

                    return ele;
                });

                tbody.value.push({
                    'name': lan.value['本页小计'], 
                    'billNo': billNumber, 
                    'all': true, 
                    'gcNumberT': thousands(gcNumber), 
                    'volumeNumberT': thousands(volumeNumber), 
                    'imgNumberT': thousands(imgNumber), 
                    'amountO': '$'+thousands(amount.toFixed(2))
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

        const status = ref([]);
        const statusList = ref([
            {'label': lan.value['机构审核'], 'value': '12'}, 
            {'label': lan.value['微站初审'], 'value': '5'},
            {'label': lan.value['微站复审'], 'value': '13'}, 
            {'label': lan.value['微站待议'], 'value': '14'},
            {'label': lan.value['已打回'], 'value': '6'}, 
            {'label': lan.value['已通过'], 'value': '7'},
            {'label': lan.value['已作废'], 'value': '16'},
        ]);

        const billStatus = ref([]);
        const billStatusList = ref([
            // {'label': lan.value['待审批'], 'value': 0}, 
            // {'label': lan.value['审批中'], 'value': 1},
            {'label': lan.value['已确认'], 'value': 2},
            // {'label': lan.value['已驳回'], 'value': 3},
            {'label': lan.value['已付款'], 'value': 4},
            {'label': lan.value['已收款'], 'value': 5},
            // {'label': lan.value['已作废'], 'value': 6}
        ]);

        const toggle = ref(false);
        const changeToggle = () => {
            toggle.value = !toggle.value;
        }

        const isChart = ref(false);

        let orgKeyO = {};
        const getOrgList = async () => {
            const result = await org.getOrgList(siteKey.value, '');
            if(result.status == 200){
                orgList.value = result.data.map((ele) => {
                    ele.label = lanType.value == 'en' ? ele.englishName : ele.name;
                    ele.value = ele._key;

                    orgKeyO[ele.organizationNo] = ele._key;
                    return ele;
                });
            }
        }

        watch(billCreateTime,(nv, ov) => {
            if(nv){
                billCreateStartTime.value = new Date(nv[0]).getTime();
                billCreateEndTime.value = new Date(nv[1]).getTime()+getDays(new Date(nv[1]).getTime())-1;
            }else{
                billCreateStartTime.value = '';
                billCreateEndTime.value = '';
            }
            console.log(billCreateStartTime.value, billCreateEndTime.value);
        });

        watch(billPassTime,(nv, ov) => {
            if(nv){
                billPassStartTime.value = new Date(nv[0]).getTime();
                billPassEndTime.value = new Date(nv[1]).getTime()+getDays(new Date(nv[1]).getTime())-1;
            }else{
                billPassStartTime.value = '';
                billPassEndTime.value = '';
            }
            console.log(billPassStartTime.value, billPassEndTime.value);
        });

        watch(uploadTime,(nv, ov) => {
            if(nv){
                uploadStartTime.value = new Date(nv[0]).getTime();
                uploadEndTime.value = new Date(nv[1]).getTime()+getDays(new Date(nv[1]).getTime())-1;
            }else{
                uploadStartTime.value = '';
                uploadEndTime.value = '';
            }
            console.log(uploadStartTime.value, uploadEndTime.value);
        });

        watch(imgPassTime,(nv, ov) => {
            if(nv){
                imgPassStartTime.value = new Date(nv[0]).getTime();
                imgPassEndTime.value = new Date(nv[1]).getTime()+getDays(new Date(nv[1]).getTime())-1;
            }else{
                imgPassStartTime.value = '';
                imgPassEndTime.value = '';
            }
            console.log(imgPassStartTime.value, imgPassEndTime.value);
        });

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){

            }else{
                orgKeyN.value = [orgKey.value];
            }
            billCreateTime.value = [getCurrentMonthZero(), getCurrentMonthZero(0)];

            getOrgList();
            getDataList();
        });

        // 行点击
        const searchO = ref({'orgKey': '', 'billStatus': '', 'status': '', 'billKey': '', 'billCreateTime': '', 'billPassTime': '', 'uploadTime': '', 'imgPassTime': ''});
        const handleRowClick = (row) => {
            isList.value = true;
            searchO.value = {
                'orgKey': (row.all ? orgKeyN.value.join(',') : row.orgKey), 
                'billStatus': (row.all ? billStatus.value.join(',') : row.billStatus+''), 
                'billKey': (row.billKey || ''), 
                'billCreateTime': billCreateTime.value+'', 
                'billPassTime': billPassTime.value+'', 
                'uploadTime': uploadTime.value+'', 
                'imgPassTime': imgPassTime.value+'',
                'status': status.value.join(','),
            };
            // window.open('/billStatistics?orgKey='+(row.name == '本页小计' ? orgKeyN.value.join(',') : row.orgKey)+'&billStatus='+(row.name == '本页小计' ? billStatus.value.join(',') : row.billStatus)+'&billKey='+(row.billKey || '')+'&billCreateTime='+billCreateTime.value+'&billPassTime='+billPassTime.value+'&uploadTime='+uploadTime.value+'&imgPassTime='+imgPassTime.value);
        }

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
                startTimes = getMonthTimestamp(column.year, column.month).firstDayTimestamp;
                endTimes = getMonthTimestamp(column.year, column.month).lastDayTimestamp;

                uploadStartTimes = new Date(uploadStartTime.value).getTime();
                uploadEndTimes = new Date(getCurrentMonthZero(-1)).getTime() - 1;
            }else{
                startTimes = new Date(startTime.value).getTime();
                endTimes = new Date(getCurrentMonthZero(-1)).getTime() - 1;

                uploadStartTimes = new Date(uploadStartTime.value).getTime();
                uploadEndTimes = new Date(getCurrentMonthZero(-1)).getTime() - 1;
            }

            window.open('/imageStatistics?orgKey='+orgKey+'&startTime='+startTimes+'&endTime='+endTimes+'&uploadStartTime='+uploadStartTimes+'&uploadEndTime='+uploadEndTimes);
        }

        // 下载数据
        const getDataDownload = async () => {
            changePropertyValue('isLoading', true);
            const result = await supplierMS.settledBillStatisticsDownload({
                'siteKey': siteKey.value,
                'billCreateStartTime': billCreateStartTime.value,
                'billCreateEndTime': billCreateEndTime.value,
                'billPassStartTime': billPassStartTime.value,
                'billPassEndTime': billPassEndTime.value,
                'uploadStartTime': uploadStartTime.value,
                'uploadEndTime': uploadEndTime.value,
                'imgPassStartTime': imgPassStartTime.value,
                'imgPassEndTime': imgPassEndTime.value,
                'orgKey': orgKeyN.value.join(','),
                'billStatus': billStatus.value.join(','),
                'status': status.value.join(','),
                'lanType': lanType.value,

            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                downliadLink(result.result);
            }else{
                createMsg(result.msg);
            }
        }

        // 
        const isList = ref(false);
        const handleDownLoad = (row) => {
            console.log(row);
            settledBillStatisticsDetailDownload(row.billKey);
        }

        // 下载数据
        const settledBillStatisticsDetailDownload = async (billKey) => {
            changePropertyValue('isLoading', true);
            const result = await supplierMS.settledBillStatisticsDetailDownload({
                'siteKey': siteKey.value,
                'billKey': billKey,
                'billCreateStartTime': '',
                'billCreateEndTime': '',
                'billPassStartTime': '',
                'billPassEndTime': '',
                'uploadStartTime': '',
                'uploadEndTime': '',
                'imgPassStartTime': '',
                'imgPassEndTime': '',
                'orgKey': '',
                'billStatus': '',
                'status': '',
                'lanType': lanType.value,
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                downliadLink(result.result);
            }else{
                createMsg(result.msg);
            }
        }

        return {
            theadV, tbody, getDataList, isChart, userRole, chartData, lan, sidebarW, handleCellClick, orgList, handleRowClick, 
            isList, searchO, handleDownLoad, handleSort, auto, asc, desc,
            billCreateTime, billPassTime, uploadTime, imgPassTime, billStatus, billStatusList, toggle, changeToggle, getDataDownload, status, statusList,
			orgKeyN, billCreateStartTime, billCreateEndTime, billPassStartTime, billPassEndTime, uploadStartTime, uploadEndTime, imgPassStartTime, imgPassEndTime,
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
    .head-left{
        display: flex;
        align-items: flex-end;
        .toggle-box{
            display: flex;
            align-items: flex-end;
            font-size: 10px;
            margin-left: 10px;
            cursor: pointer;
        }
    }
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
    .head-right{
        display: flex;
        align-items: center;
    }
}
.search-wrap{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    .search-box{
        height: 40px;
        display: inline-flex;
        align-items: center;
    }
}
.contract-content{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: calc(100% - 120px);
    overflow-y: auto;
    &.active{
        height: calc(100% - 160px);
    }
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
                cursor: pointer;
                .th-box{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    i{
                        display: inline-block;
                    }
                    .sort{
                        display: inline-block;
                        width: 20px;
                    }
                }
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