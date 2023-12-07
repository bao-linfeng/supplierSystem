<template>
    <div class="bill-statistics-wrap">
        <div class="contract-head">
            <div class="head-left">
                <h3>{{lan['发票明细']}}</h3>
            </div>
            <div class="head-right">
                <img class="close" @click="close" src="../assets/close.svg" alt="">
            </div>
        </div>
        <div class="contract-content style1" :class="{active: toggle}">
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV" :key="'thead_'+index">{{lan[item]}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr :class="{active: item.all}" v-for="(item, index) in tbody" :key="'tbody_'+index">
                        <td :class="{red: item.red && ['imgNumber', 'currImgNumber'].indexOf(item2) > -1}" v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
                            <div v-if="item2 === 'action'">
                                <button class="button btn">下载</button>
                            </div>
                            <i v-else>{{item[item2]}}</i>
                        </td>
                    </tr>
                    <tr v-if="!tbody.length">
                        <td :colspan="parameterV.length">{{lan['暂无数据']}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, downliadLink, getNowTimestamp, getLastYearTodayTimestamp, getDays, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';

export default {
    components: {
        PaginationModule,
    },
    name: 'billStatisticsModule',
    emits: ['close'],
    props: {
        searchO: Object
    },
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType, billStatusO } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(30000);

        const theadV = ref(['机构名称', '发票编号', '发票提交时间', '发票通过时间', '影像上传时间', '审核通过时间', '谱名', '谱ID', '卷名', '卷ID', '影像数', '当前拍数','金额小计', '卷状态', '发票状态']);
        const parameterV = ref(['name', 'billNo', 'createTimeO', 'billPassTimeO', 'submitTimeO', 'passTimeO', 'genealogyName', 'gcKey', 'volumeNumberT', 'volumeKey', 'imgNumberT', 'currImgNumberT','amountO', 'takeStatusO', 'billStatusO']);

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

        const billKey = ref('');

        const genealogyName = ref('');
        const catalogKey = ref('');
        
        const tbody = ref([]);
        const getDataList = async (f = true) => {
			// changePropertyValue('isLoading', true);
            const result = await supplierMS.settledBillStatisticsDetail({
                'siteKey': siteKey.value,
                'billKey': billKey.value,
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
                'page': page.value,
                'limit': limit.value,
            });
            // changePropertyValue('isLoading', false);
			if(result.status == 200){
                let imgNumber = 0, amount = 0, currImgNumber = 0;
                tbody.value = result.data.list.map((ele) => {
                    imgNumber = ele.imgNumber + imgNumber;
                    currImgNumber = ele.currImgNumber + currImgNumber;
                    amount = ele.amount + amount;
                    ele.red = ele.currImgNumber == ele.imgNumber ? false : true;
                    ele.name = lanType.value == 'en' ? ele.englishName : ele.orgName;
                    ele.amountO = '$'+thousands(ele.amount);
                    ele.billStatusO = lan.value[billStatusO.value[ele.billStatus]];
                    ele.createTimeO = getLocalTime(ele.createTime, '/', 1);
                    ele.billPassTimeO = getLocalTime(ele.billPassTime, '/', 1);
                    ele.passTimeO = ele.passTime ? getLocalTime(ele.passTime, '/', 1) : '';
                    ele.submitTimeO = ele.submitTime ? getLocalTime(ele.submitTime, '/', 1) : '';
                    ele.singleOrTwo = ele.singleOrTwo == '2' ? lan.value['双拍'] : ele.singleOrTwo == '1' ? lan.value['单拍'] : '';
                    ele.takeStatusO = ele.takeStatus >= 7 && ele.takeStatus <= 9 ? lan.value['通过'] : ele.takeStatus == 12 ? lan.value['机构审核'] : ele.takeStatus == 5 ? lan.value['微站初审'] : ele.takeStatus == 13 ? lan.value['微站复审'] : ele.takeStatus == 14 ? lan.value['微站待议'] : ele.takeStatus == 6 ? lan.value['打回'] : ele.takeStatus == 16 ? lan.value['作废'] : '';
                    
                    ele.volumeNumberT = thousands(ele.volumeNumber);
                    ele.imgNumberT = thousands(ele.imgNumber);
                    ele.currImgNumberT = thousands(ele.currImgNumber);
                    return ele;
                });
                // tbody.value.push({'name': lan.value['本页小计'], 'imgNumber': imgNumber, 'amountO': '$'+amount.toFixed(2)});
                pages.value = result.data.pageNum;
                total.value = result.data.total;
                f ? settledBillStatisticsTotal() : null;
            }
        }

        // 下载数据
        const getDataDownload = async () => {
            changePropertyValue('isLoading', true);
            const result = await supplierMS.settledBillStatisticsDetailDownload({
                'siteKey': siteKey.value,
                'billKey': billKey.value,
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
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                downliadLink(result.result);
            }
        }

        // 统计
        const settledBillStatisticsTotal = async () => {
            const result = await supplierMS.settledBillStatisticsTotal({
                    'siteKey': siteKey.value,
                    'billKey': billKey.value,
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
                });
            if(result.status == 200){
                let data = result.data;
                tbody.value.push({
                    'name': lan.value['汇总统计'], 
                    'all': true, 
                    'billNo': data.billStatisticsTotalBill, 
                    'genealogyName': data.billStatisticsTotalGC, 
                    'volumeNumberT': thousands(total.value), 
                    'imgNumberT': thousands(data.billStatisticsTotalImg), 
                    'currImgNumberT': thousands(data.billStatisticsTotalCurrImg), 
                    'amountO': '$'+thousands(data.billStatisticsTotalAmount)
                });
            }
        }

        const toggle = ref(false);
        const changeToggle = () => {
            toggle.value = !toggle.value;
        }

        const getOrgList = async () => {
            const result = await org.getOrgList(siteKey.value, '');
            if(result.status == 200){
                orgList.value = result.data.map((ele) => {
                    ele.label = lanType.value == 'en' ? ele.organizationNo : ele.name;
                    ele.value = ele._key;
                    return ele;
                });
                // orgList.value.unshift({'label': lan.value['全部机构'], 'value': ''});
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
            // {'label': lan.value['待审批'], 'value': '0'}, 
            // {'label': lan.value['审批中'], 'value': '1'},
            {'label': lan.value['已确认'], 'value': '2'},
            // {'label': lan.value['已驳回'], 'value': 3},
            {'label': lan.value['已付款'], 'value': '4'},
            {'label': lan.value['已收款'], 'value': '5'},
            // {'label': lan.value['已作废'], 'value': '6'}
        ]);

        const condition = ref(['nf', 'f']);
        const conditionList = ref([
            {label: '谱状态', value: ''}, 
            {label: 'd|重复', value: 'd'},
            {label: 'r|无效', value: 'r'},
            {label: 'm|待议', value: 'm'},
            {label: 'nf|谱目通过', value: 'nf'},
            {label: 'f|影像通过', value: 'f'},
        ]);

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
                imgPassEndTime.value = new Date(nv[1]).getTime()+24*60*60*1000 - 1;
            }else{
                imgPassStartTime.value = '';
                imgPassEndTime.value = '';
            }
            console.log(imgPassStartTime.value, imgPassEndTime.value);
        });

        const changePage = (i) => {
            page.value = i;
            getDataList();
        }

        const close = () => {
            context.emit('close', false);
        }

        onMounted(() => {
            console.log(props.searchO.status);
            orgKeyN.value = props.searchO.orgKey ? props.searchO.orgKey.split(',') : [];
            billStatus.value = props.searchO.billStatus ? props.searchO.billStatus.split(',') : [];
            status.value = props.searchO.status ? props.searchO.status.split(',') : [];
            billKey.value = props.searchO.billKey;
            billCreateTime.value = props.searchO.billCreateTime ? props.searchO.billCreateTime.split(',') : '';
            billPassTime.value = props.searchO.billPassTime ? props.searchO.billPassTime.split(',') : '';
            uploadTime.value = props.searchO.uploadTime ? props.searchO.uploadTime.split(',') : '';
            imgPassTime.value = props.searchO.imgPassTime ? props.searchO.imgPassTime.split(',') : '';
            
            getOrgList();
            let timer = setTimeout(() => {
                clearTimeout(timer);
                timer = null;
                getDataList();
            }, 1000);
        });

        return {
            page, pages, total, theadV, parameterV, tbody, sidebarW, toggle, changeToggle, 
            changePage, orgList, orgKeyN, billStatusList, billStatus, userRole, lan, status, statusList, 
            genealogyName, catalogKey, condition, conditionList, getDataDownload, billKey, getDataList, 
            billCreateTime, billPassTime, uploadTime, imgPassTime, close, 
        }
    }
}
</script>

<style lang="scss" scoped>
.bill-statistics-wrap{
    position: fixed;
    top: 100px;
    left: 280px;
    width: calc(100% - 300px);
    height: calc(100% - 120px);
    color: #333;
    background: #fff;
    z-index: 1000;
    box-shadow: 0 0 1px 2px #ddd;
    &.active{
        top: 140px;
        height: calc(100% - 160px);
    }
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
    .head-right{
        display: flex;
        align-items: center;
        .close{
            cursor: pointer;
            background: #000;
        }
    }
}
.contract-content{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: calc(100% - 60px);
    overflow-y: auto;
    &.active{
        height: calc(100% - 180px);
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
                padding: 5px 10px;
                min-width: 80px;
                // max-width: 200px;
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
            }
            td{
                padding: 15px 10px;
                min-width: 80px;
                // max-width: 200px;
                border: 1px solid #ddd;
                &.red{
                    color: #f00;
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
.width150{
    width: 150px;
}
.width120{
    width: 120px;
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
</style>