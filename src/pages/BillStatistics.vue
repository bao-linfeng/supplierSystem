<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <div class="head-left">
                <h3>{{lan['发票明细']}}</h3>
                <div class="toggle-box" @click="changeToggle">
                    <i>{{toggle ? lan['展开'] : lan['收起']}}</i>
                </div>
            </div>
            <!-- <div class="head-right">
                <el-input class="width150" v-model="genealogyName" :placeholder="lan['请输入谱名']"></el-input>
                <el-input class="width150" v-model="catalogKey" :placeholder="lan['请输入谱ID']"></el-input>
                
                <el-select v-model="condition" class="width120" multiple :placeholder="lan['谱审核状态']">
                    <el-option v-for="item in conditionList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="width120" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="status" class="width120" multiple :placeholder="lan['卷审核状态']">
                    <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary">{{lan['检索']}}</el-button>
                <el-button type="primary" @click="getimageVerifyDetailDownload">{{lan['下载']}}</el-button>
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
                        <th v-for="(item, index) in theadV" :key="'thead_'+index">{{lan[item]}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index">
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
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
        <PaginationModule :defaultPage="page" :pages="pages" :total="total" v-on:change-page="changePage" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, downliadLink, getNowTimestamp, getLastYearTodayTimestamp, getDays } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';

export default {
    components: {
        PaginationModule,
    },
    name: 'billStatistics',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType, billStatusO } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(30);

        const theadV = ref(['机构名称', '发票编号', '发票提交时间', '发票通过时间', '影像上传时间', '审核通过时间', '谱名', '谱ID', '卷名', '卷ID', '影像数', '金额小计', '卷状态', '发票状态']);
        const parameterV = ref(['name', 'billNo', 'createTimeO', 'billPassTimeO', 'submitTimeO', 'passTimeO', 'genealogyName', 'gcKey', 'volumeNumber', 'volumeKey', 'imgNumber', 'amountO', 'takeStatusO', 'billStatusO']);

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
        let returnReasonO = '', conditionO = {'d': '重复', 'r': '无效', 'm': '待议', 'nf': '谱目通过', 'f': '影像通过'};
        const getDataList = async (f = true) => {
			changePropertyValue('isLoading', true);
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
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let imgNumber = 0, amount = 0;
                tbody.value = result.data.list.map((ele) => {
                    imgNumber = ele.imgNumber + imgNumber;
                    amount = ele.amount + amount;
                    ele.name = lanType.value == 'en' ? ele.englishName : ele.orgName;
                    ele.amountO = '$'+ele.amount;
                    ele.billStatusO = billStatusO.value[ele.billStatus];
                    ele.createTimeO = getLocalTime(ele.createTime, '/', 1);
                    ele.billPassTimeO = getLocalTime(ele.billPassTime, '/', 1);
                    ele.passTimeO = ele.passTime ? getLocalTime(ele.passTime, '/', 1) : '';
                    ele.submitTimeO = ele.submitTime ? getLocalTime(ele.submitTime, '/', 1) : '';
                    ele.singleOrTwo = ele.singleOrTwo == '2' ? lan.value['双拍'] : ele.singleOrTwo == '1' ? lan.value['单拍'] : '';
                    ele.takeStatusO = ele.takeStatus >= 7 && ele.takeStatus <= 9 ? lan.value['通过'] : ele.takeStatus == 12 ? lan.value['机构审核'] : ele.takeStatus == 5 ? lan.value['微站初审'] : ele.takeStatus == 13 ? lan.value['微站复审'] : ele.takeStatus == 14 ? lan.value['微站待议'] : ele.takeStatus == 6 ? lan.value['打回'] : ele.takeStatus == 16 ? lan.value['作废'] : '';
                    return ele;
                });
                tbody.value.push({'name': lan.value['本页小计'], 'imgNumber': imgNumber, 'amountO': '$'+amount.toFixed(2)});
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
                tbody.value.push({'name': lan.value['汇总统计'], 'imgNumber': data.billStatisticsTotalImg, 'amountO': '$'+data.billStatisticsTotalAmount});
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

        onMounted(() => {
            // [Number(getQueryVariable('uploadStartTime')), Number(getQueryVariable('uploadEndTime')) - 24*60*60*1000 + 1]
            orgKeyN.value = getQueryVariable('orgKey') ? getQueryVariable('orgKey').split(',') : [];
            billStatus.value = getQueryVariable('billStatus') ? getQueryVariable('billStatus').split(',') : [];
            billKey.value = getQueryVariable('billKey');
            billCreateTime.value = getQueryVariable('billCreateTime') ? decodeURIComponent(getQueryVariable('billCreateTime')).split(',') : '';
            billPassTime.value = getQueryVariable('billPassTime') ? decodeURIComponent(getQueryVariable('billPassTime')).split(',') : '';
            uploadTime.value = getQueryVariable('uploadTime') ? decodeURIComponent(getQueryVariable('uploadTime')).split(',') : '';
            imgPassTime.value = getQueryVariable('imgPassTime') ? decodeURIComponent(getQueryVariable('imgPassTime')).split(',') : '';
            
            getOrgList();
            getDataList();
        });

        return {
            page, pages, total, theadV, parameterV, tbody, sidebarW, toggle, changeToggle, 
            changePage, orgList, orgKeyN, billStatusList, billStatus, userRole, lan, status, statusList, 
            genealogyName, catalogKey, condition, conditionList, getDataDownload, billKey, getDataList, 
            billCreateTime, billPassTime, uploadTime, imgPassTime,
        }
    }
}
</script>

<style lang="scss" scoped>
.contract-wrap{
    position: relative;
    width: calc(100% - 250px);
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
    .head-right{
        display: flex;
        align-items: center;
    }
}
.contract-content{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: calc(100% - 140px);
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
        background: #D1D1D1;
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
            td{
                padding: 15px 10px;
                min-width: 80px;
                // max-width: 200px;
                border: 1px solid #ddd;
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