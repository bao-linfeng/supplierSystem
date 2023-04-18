<template>
    <div class="pages-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="pages-head">
            <div class="head-left">
                <h3 class="title">{{lan['结算列表']}}</h3>
                <span class="toggle" @click="isSearch = !isSearch">{{isSearch ? lan['展开'] : lan['收起']}}</span>
            </div>
            <div class="head-right">
                <el-checkbox v-if="(userRole < 1 || userRole > 3) && (settlementStatus == 'toBeSettled' || settlementStatus === 'all') && admin == 'admin' && total" v-model="isAllSelect">{{lan['全部选择']}}</el-checkbox>
                <el-button v-if="(userRole < 1 || userRole > 3) && (settlementStatus == 'toBeSettled' || settlementStatus === 'all') && admin == 'admin' && total" class="marginL10" type="primary" @click="addBillFoxx">{{lan['点击生成发票']}}</el-button>
                <el-button v-if="settlementStatus == 'toBeSettled' || settlementStatus === 'all'" class="marginL10" type="primary" @click="handlePatchVolumes">{{lan['批量不可结算']}}</el-button>
            </div>
        </div>
        <div class="search-wrap">
            <div class="search-left">
                <el-input class="width150" v-model="genealogyName" :placeholder="lan['请输入谱名']"></el-input>
                <el-input class="width150" v-model="gcKey" :placeholder="lan['请输入谱ID']"></el-input>
                <el-input class="width150" v-model="volumeKey" :placeholder="lan['请输入卷ID']"></el-input>
                <el-select class="width150" v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select class="width150" v-model="takeStatus" :placeholder="lan['审核状态']">
                    <el-option v-for="item in takeStatusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select class="width150" v-model="settlementStatus" :placeholder="lan['结算状态']">
                    <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
            </div>
        </div>
        <div v-if="isSearch" class="search-wrap">
            <div class="search-left">
                <el-select class="width150" v-model="singleOrTwo">
                    <el-option v-for="item in singleOrTwoList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
                <el-select class="width150" v-model="isLeadImages">
                    <el-option v-for="item in isLeadImagesList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select>
                <el-input class="width150" v-model="price" :placeholder="lan['请输入价格']"></el-input>
                <el-date-picker
                    class="width250"
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    :start-placeholder="lan['开始时间']"
                    :end-placeholder="lan['结束时间']"
                />
            </div>
        </div>
        <div class="pages-content style1" :style="{height: 'calc(100% - '+(120 + (isSearch ? 40 : 0))+'px)'}">
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV" :key="'thead_'+index">
                            <i v-if="item == 'checkAll'" class="qingtime-check-box" :class="{disabled: false, active: volumeKeyArr.length}" @click="checkAllBox()"></i>
                            <span v-else>{{lan[item]}}</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index" :class="{active: volumeKeyArr.indexOf(item.volumeKey) > -1}">
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
                            <div class="action" v-if="item2 === 'checkAll' || item2 === 'action'">
                                <i v-if="item2 === 'checkAll' && ['本页小计', '汇总统计', 'Subtotal on this page', 'Total'].indexOf(item.orgName) === -1" class="qingtime-check-box" :class="{disabled: item.settlementStatus}" @click="checkBoxClick(item.volumeKey, item.settlementStatus)"></i>
                                <button v-if="item2 === 'action'" class="btn" @click="setDetail(item)">{{lan['设置']}}</button>
                                <button v-if="item2 === 'action'" class="btn marginL5" @click="getHistory(item)">{{lan['历史']}}</button>
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
        <PaginationModule :defaultPage="page" :pages="pages" :total="total" v-on:change-page="changePage" />
        <!-- 设置 -->
        <SetSettled v-if="isShow == 1" :detail="detail" v-on:close="closeSet" v-on:save="saveSet" />
        <!-- 历史记录 -->
        <SettledHistory v-if="isShow == 2" :vid="detail.volumeKey" v-on:close="closeSet" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';
import SetSettled from '../components/SetSettled.vue';
import SettledHistory from '../components/SettledHistory.vue';

export default {
    components: {
        PaginationModule, SetSettled, SettledHistory, 
    },
    name: 'tobeSettledVolumeList',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, admin, orgKey, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV = ref(['checkAll', '机构名称', '上传时间', '谱ID', '谱名', '卷ID', '卷名', '结算页数', '单双拍','电子谱', '结算单价', '结算金额', '审核状态', '结算状态', '审核人', '审核时间']);
        const parameterV = ref(['checkAll', 'orgName', 'submitTimeO', 'gcKey', 'genealogyName', 'volumeKey', 'volumeNumber', 'imgNumber', 'singleOrTwoO', 'isLeadImagesO', 'priceO', 'amount', 'takeStatusO', 'settlementStatusO', 'userName', 'passTimeO']);

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(30);

        const time = ref('');
		const startTime = ref('');
		const endTime = ref('');
        const tbody = ref([]);
        const imgNumberO = ref(0);
        const amountO = ref(0);
        const genealogyName = ref('');
        const volumeNumber = ref('');
        const gcKey = ref('');
        const volumeKey = ref('');
        const price = ref('');
        let takeStatusO = {'5': 'FS初审', '6': '打回', '7': '通过', '12': '机构审核', '13': 'FS复审', '14': 'FS待议'};
        let settlementStatusO = {'5': '结算中', '10': '已结算', '15': '不可结算'};
        
        const getDataList = async (f = true) => {
            imgNumberO.value = 0;
            amountO.value = 0;
            tbody.value = [];
            volumeKeyArr.value = [];
			changePropertyValue('isLoading', true);
            const result = await supplierMS.toBeSettled({
                genealogyName: genealogyName.value, 
                gcKey: gcKey.value, 
                volumeKey: volumeKey.value, 
                startTime: startTime.value, 
                endTime: endTime.value, 
                singleOrTwo: singleOrTwo.value, 
                isLeadImages: isLeadImages.value, 
                orgKey: orgKeyN.value, 
                takeStatus: takeStatus.value, 
                settlementStatus: settlementStatus.value, 
                price: price.value,
                page: page.value , 
                limit: limit.value,
                siteKey: siteKey.value,
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let list = [];
                tbody.value = result.result.list.map((ele) => {
                    ele.amount = '$'+(ele.imgNumber*Number(ele.price)).toFixed(2);
                    amountO.value = amountO.value + Number((ele.imgNumber*Number(ele.price)).toFixed(2));
                    imgNumberO.value = imgNumberO.value + ele.imgNumber;
                    ele.organizationNo = ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '';
                    ele.passTimeO = ele.passTime ? getLocalTime(ele.passTime, '-', 1) : '';
                    ele.submitTimeO = ele.submitTime ? getLocalTime(ele.submitTime, '-', 1) : '';
                    ele.singleOrTwoO = ele.singleOrTwo == 1 ? lan.value['单拍']: ele.singleOrTwo == 2 ? lan.value['双拍'] : '';
                    ele.isLeadImagesO = ele.isLeadImages == 1 ? lan.value['是'] : lan.value['否'];
                    ele.priceO = '$'+(ele.price || 0);
                    ele.takeStatusO = takeStatusO[ele.takeStatus] ? lan.value[takeStatusO[ele.takeStatus]] : '';
                    ele.settlementStatusO = ele.settlementStatus ? lan.value[settlementStatusO[ele.settlementStatus]] : lan.value['待结算'];
                    list.push(ele.volumeKey);
                    // ele.takeStatusO = ele.takeStatus == 7 ? lan.value['待结算'] : ele.takeStatus == 8 ? lan.value['结算中'] : ele.takeStatus == 9 ? lan.value['已结算'] : ele.takeStatus == 10 ? lan.value['已收款'] : ele.takeStatus == 15 ? lan.value['不可结算'] : ''; 
                    return ele;
                });
                tbody.value.push({'orgName': '本页小计', 'imgNumber': imgNumberO.value, 'amount': '$'+(amountO.value).toFixed(2)});
                pages.value = result.result.pageNum;
                total.value = result.result.total;

                if(isAllSelect.value){
                    volumeKeyArr.value = list;
                }
                
                if(f){
                    toBeSettledTotal();
                }
            }else{
                createMsg(result.msg);
            }
        }

        const toBeSettledTotal = async () => {
            const result = await supplierMS.toBeSettledTotal({
                genealogyName: genealogyName.value, 
                gcKey: gcKey.value, 
                volumeKey: volumeKey.value, 
                startTime: startTime.value, 
                endTime: endTime.value, 
                singleOrTwo: singleOrTwo.value, 
                isLeadImages: isLeadImages.value, 
                orgKey: orgKeyN.value, 
                takeStatus: takeStatus.value, 
                settlementStatus: settlementStatus.value, 
                price: price.value,
                siteKey: siteKey.value,
            });
            if(result.status == 200){
                let data = result.data;
                tbody.value.push({'orgName': '汇总统计', 'imgNumber': data.pagesTotal, 'amount' : '$'+data.amountTotal});
            }
        }

        const orgList = ref([]);
        const orgKeyN = ref('');
        const orgName = ref('');

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

        watch(time, (nv, ov) => {
			if(nv){
			    startTime.value = new Date(nv[0]).getTime();
			    endTime.value = new Date(nv[1]).getTime();
			}else{
			    startTime.value = '';
			    endTime.value = '';
			}
        });

        watch(orgKeyN, (nv, ov) => {
            orgList.value.forEach((ele) => {
                if(ele.value == nv){
                    orgName.value = nv ? ele.label : '';
                }
            });
        });

        const isAllSelect = ref(false);
        const settlementStatus = ref('toBeSettled');
        const statusList = ref([
            {'label': lan.value['全部结算状态'], 'value': 'all'}, 
            {'label': lan.value['待结算'], 'value': 'toBeSettled'}, 
            {'label': lan.value['结算中'], 'value': 'inSettlement'}, 
            {'label': lan.value['已结算'], 'value': 'settled'},
            {'label': lan.value['不可结算'], 'value': 'nonSettlement'},
        ]);

        const takeStatus = ref(7);
        const takeStatusList = ref([
            // {'label': lan.value['全部审核状态'], 'value': ''},
            // {'label': lan.value['机构审核'], 'value': 12},
            // {'label': lan.value['FS初审'], 'value': 5},
            // {'label': lan.value['FS复审'], 'value': 13},
            // {'label': lan.value['FS待议'], 'value': 14},
            // {'label': lan.value['打回'], 'value': 6},
            {'label': lan.value['通过'], 'value': 7},
        ]);

        const volumeKeyArr = ref([]);
        const checkBoxClick = (k, f) => {
            if(f){
                return;
            }
            let i = volumeKeyArr.value.indexOf(k);
            if(i > -1){
                volumeKeyArr.value.splice(i, 1);
            }else{
                volumeKeyArr.value.push(k);
            }
            console.log(volumeKeyArr.value);
        };

        const addBillFoxx = async () => {
            if(isAllSelect.value || volumeKeyArr.value.length){
                if(confirm('确认要把该批次的卷册影像生成发票吗？')){
                    changePropertyValue('isLoading', true);
                    const result = await supplierMS.addBillFoxx({
                        genealogyName: genealogyName.value, 
                        gcKey: gcKey.value, 
                        volumeKey: volumeKey.value, 
                        startTime: startTime.value, 
                        endTime: endTime.value, 
                        singleOrTwo: singleOrTwo.value, 
                        isLeadImages: isLeadImages.value, 
                        orgKey: orgKey.value, 
                        takeStatus: takeStatus.value,
                        userKey: userKey.value, 
                        isAllSelect: isAllSelect.value ? 1 : 0, 
                        volumeKeyArr: volumeKeyArr.value, 
                        siteKey: siteKey.value, 
                    });
                    changePropertyValue('isLoading', false);
                    if(result.status == 200){
                        volumeKeyArr.value = [];
                        isAllSelect.value = false;
                        getDataList();
                        if(result.data && result.data.length){
                            alert(result.data.join()+', 以上卷册生成发票失败，不符合开发票需求！');
                        }

                    }else{
                        createMsg(result.msg);
                    }
                }
            }else{
                createMsg(lan.value['请勾选卷册或全部选择']);
            }
        }
        
        const changePage = (i) => {
            page.value = i;
            getDataList(false);
        }

        watch(settlementStatus , (nv, ov) => {
            isAllSelect.value = false;
            if(nv == 'toBeSettled'){
                // takeStatus.value = 7;
                // takeStatusList.value = [
                //     {'label': lan.value['通过'], 'value': 7},
                // ];
            }else{
                // takeStatus.value = '';
                // takeStatusList.value = [
                //     {'label': lan.value['全部审核状态'], 'value': ''},
                //     {'label': lan.value['机构审核'], 'value': 12},
                //     {'label': lan.value['FS初审'], 'value': 5},
                //     {'label': lan.value['FS复审'], 'value': 13},
                //     {'label': lan.value['FS待议'], 'value': 14},
                //     {'label': lan.value['打回'], 'value': 6},
                //     {'label': lan.value['通过'], 'value': 7},
                // ];
            }
            getDataList();
        });

        watch(isAllSelect, (nv, ov) => {
            console.log(nv, settlementStatus.value);
            if(nv){
                if(settlementStatus.value == 'toBeSettled' || settlementStatus.value == 'all'){
                    let list = [];
                    tbody.value.forEach((ele) => {
                        if(!ele.settlementStatus && ele.volumeKey){
                            list.push(ele.volumeKey);
                        }
                    });
                    volumeKeyArr.value = list;
                }
                endTime.value = Date.now();
                startTime.value = endTime.value - 6*30*24*60*60*1000;
                time.value = [startTime.value, endTime.value];
                // console.log(volumeKeyArr.value);
            }else{
                volumeKeyArr.value = [];
                endTime.value = '';
                startTime.value = '';
                time.value = [];
            }
        });

        // 批量修改卷册 不可开发票
        const handlePatchVolumes = async () => {
            if(volumeKeyArr.value.length){
                if(confirm(lan.value['确认要把该批次的卷册状态修改成不可结算吗？'])){
                    changePropertyValue('isLoading', true);
                    const result = await supplierMS.nonSettlementVolume(siteKey.value, userKey.value, orgKey.value, volumeKeyArr.value,  1);
                    changePropertyValue('isLoading', false);
                    if(result.status == 200){
                        volumeKeyArr.value = [];
                        isAllSelect.value = false;
                        getDataList();
                        if(result.data && result.data.length){
                            alert(result.data.join()+', 以上卷册设置不可结算失败，请认真查询条件！');
                        }
                    }else{
                        createMsg(result.msg);
                    }
                }
            }else{
                createMsg(lan.value['请勾选卷册或全部选择']);
            }
        }

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){
                theadV.value = ['checkAll', '机构名称', '上传时间', '谱ID', '谱名', '卷ID', '卷名', '结算页数', '单双拍','电子谱', '结算单价', '结算金额', '审核状态', '结算状态', '审核人', '审核时间', '操作'];
                parameterV.value = ['checkAll', 'orgName', 'submitTimeO', 'gcKey', 'genealogyName', 'volumeKey', 'volumeNumber', 'imgNumber', 'singleOrTwoO', 'isLeadImagesO', 'priceO', 'amount', 'takeStatusO', 'settlementStatusO', 'userName', 'passTimeO', 'action'];
            }else{
                orgKeyN.value = orgKey.value;
                if(admin.value == 'admin'){
                    theadV.value = ['checkAll', '机构名称', '上传时间', '谱ID', '谱名', '卷ID', '卷名', '结算页数', '单双拍','电子谱', '结算单价', '结算金额', '审核状态', '结算状态', '审核人', '审核时间', '操作'];
                    parameterV.value = ['checkAll', 'orgName', 'submitTimeO', 'gcKey', 'genealogyName', 'volumeKey', 'volumeNumber', 'imgNumber', 'singleOrTwoO', 'isLeadImagesO', 'priceO', 'amount', 'takeStatusO', 'settlementStatusO', 'userName', 'passTimeO', 'action'];
                }
            }
            // takeStatusList.value = [
            //     {'label': lan.value['通过'], 'value': 7},
            // ];
            getOrgList();
            getDataList();
        });

        // 全部勾选
        const checkAllBox = () => {
            let list = [];
            if(volumeKeyArr.value.length){

            }else{
                // 
                tbody.value.forEach((ele, index) => {
                    if(['本页小计', '汇总统计', 'Subtotal on this page', 'Total'].indexOf(ele.orgName) === -1 && !ele.settlementStatus){
                        list.push(ele.volumeKey);
                    }
                });
            }
            
            volumeKeyArr.value = list;
            console.log(volumeKeyArr.value);
        }

        // 设置
        const isShow = ref(0);
        const detail = ref({});
        const setDetail = (data) => {
            detail.value = data;
            isShow.value = 1;
        }

        const closeSet = () => {
            detail.value = {};
            isShow.value = 0;
        }

        const saveSet = () => {
            detail.value = {};
            isShow.value = 0;
            getDataList();
        }

        // 历史记录
        const getHistory = (data) => {
            detail.value = data;
            isShow.value = 2;
        }

        // 电子谱、单双拍
        const isSearch = ref(false);
        const isLeadImages = ref('');
        const isLeadImagesList = ref([{'label': '家谱类型', 'value': ''}, {'label': '纸谱', 'value': '0'}, {'label': '电子谱', 'value': '1'}]);
        const singleOrTwo = ref('');
        const singleOrTwoList = ref([{'label': '拍数类型', 'value': ''}, {'label': '单拍', 'value': '1'}, {'label': '双拍', 'value': '2'}]);

        return {
            theadV, parameterV, tbody, getDataList, time, orgList, orgKeyN, orgName, statusList, settlementStatus, checkBoxClick, volumeKeyArr,
            changePage, page, pages, total, userRole, isAllSelect, admin, lan, sidebarW, addBillFoxx, imgNumberO, amountO, handlePatchVolumes,
            volumeNumber, genealogyName, takeStatus, takeStatusList, gcKey, volumeKey, checkAllBox, isShow, detail, closeSet, setDetail, saveSet,
            getHistory, isLeadImages, singleOrTwo, isLeadImagesList, singleOrTwoList, price, isSearch,
        }
    }
}
</script>

<style lang="scss" scoped>
.pages-wrap{
    position: relative;
    width: calc(100% - 200px);
    height: 100%;
    color: #333;
}
.pages-head{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .head-left{
        display: flex;
        align-items: center;
        .toggle{
            margin-left: 10px;
            cursor: pointer;
            color: #358acd;
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
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .search-left{
        display: flex;
        align-items: center;
    }
    .search-right{
        display: flex;
        align-items: center;
    }
}
.pages-content{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: calc(100% - 120px);
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
                padding: 5px 10px;
                min-width: 40px;
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
                .qingtime-check-box{
                    background: url('../assets/tick_blue.svg') 50% 50% no-repeat;
                    background-size: cover;
                    &.active{
                        border: 1px solid #ddd;
                    }
                }
            }
            td{
                padding: 15px 10px;
                min-width: 40px;
                border: 1px solid #ddd;
                .action{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
    }
    .btn{
        padding: 0 10px;
        // width: auto;
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
.marginL10{
    margin-left: 10px;
}
.marginL5{
    margin-left: 5px;
}
.qingtime-check-box{
    position: relative;
    width: 18px;
    height: 18px;
    border: 1px solid #358acd;
    border-radius: 3px;
    display: block;
    cursor: pointer;
    margin: 0 auto;
    &.active{
        background: url('../assets/tick_blue.svg') 50% 50% no-repeat;
        background-size: cover;
    }
    &.disabled{
        border: 1px solid #ddd;
        background: #ddd;
    }
}
.width150{
    width: 120px;
}
.width250{
    width: 200px !important;
}
.btn{
    background: #358acd;
    color: #fff;
    border: none;
    cursor: pointer;
    border-radius: 3px;
    min-width: 40px;
    padding: 0 !important;
}
</style>