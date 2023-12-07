<template>
    <div class="pages-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="pages-head style1">
            <!-- <h3>{{lan['家谱拍摄发票列表']}}</h3> -->
            <div class="head-right">
                <el-date-picker
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    :start-placeholder="lan['开始时间']"
                    :end-placeholder="lan['结束时间']"
                />
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="qingtime-select" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="status" class="qingtime-select" multiple :placeholder="lan['发票状态']">
                    <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="approvalStatus" class="qingtime-select" :placeholder="lan['审批状态']">
                    <el-option v-for="item in approvalStatusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDataList(true)">{{lan['检索']}}</el-button>
            </div>
        </div>
        <div class="pages-content style1">
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV" :key="'thead_'+index">{{lan[item]}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index" :class="{active: false, red: item.processError == 1, active2: item.all}">
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
                            <div v-show="(index <= tbody.length - 3)" class="action" v-if="item2 === 'action'">
                                <button class="btn" @click="goRouter(item._key)">{{lan['查看详情']}}</button>
                                <button v-if="((userRole >= 1 && userRole <= 2) && item.status == 2)" class="btn marginL10" @click="handlePay(item)">{{lan['付款确认']}}</button>
                                <button v-if="((admin == 'admin') && item.status == 4)" class="btn marginL10" @click="handlePay(item)">{{lan['收款确认']}}</button>
                                <button v-if="((userRole >= 1 && userRole <= 2) && item.processError == 1)" class="btn marginL10" @click="handleRestoreBill(item)">{{lan['重置发票']}}</button>
                                <button v-if="((userRole >= 1 && userRole <= 2) && item.status == 2) || (admin == 'admin' && item.status === 0)" class="btn marginL10" @click="handleVoidedInvoice(item)">{{lan['作废']}}</button>
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
        <!-- 作废 备注 -->
        <BillMemo v-if="isShow == 1" :id="detail._key" v-on:close="isShow = 0" v-on:save="getApprovalUser" />
        <!-- 付款 -->
        <BillPayModule v-if="isShow == 2" :detail="detail" v-on:close="isShow = 0" v-on:save="getApprovalUser" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';
import BillMemo from '../components/bill/BillMemo.vue';
import BillPayModule from '../components/bill/BillPayModule.vue';

export default {
    components: {
        PaginationModule, BillMemo, BillPayModule,
    },
    name: 'takeCameraBillList',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, orgKey, userRole, lan, sidebarW, admin, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV = ref(['机构名称', '发票编号', '提交时间', '提交谱数', '卷数', '影像页数', '金额小计', '实付金额','发票状态', '流程节点', '操作']);
        const parameterV = ref(['orgName', 'billNo', 'createTime', 'gcNumberT', 'volumeNumberT', 'totalImgNumberT', 'totalAmountO', 'paidInAmountO', 'statusO', 'approvalStatusO' , 'action']);

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(30);

        const time = ref('');
		const startTime = ref(Date.now() - 1000*60*60*24*30*11);
		const endTime = ref(Date.now());
        const tbody = ref([]);
        let statusO = {'0': '待审批', '1': '审批中', '2': '已确认', '3': '已驳回', '4': '已付款', '5': '已收款', '6': '作废'};
        const imgNumberO = ref(0);
        const amountO = ref(0);
        const getDataList = async (f = true) => {
            imgNumberO.value = 0;
            amountO.value = 0;
			changePropertyValue('isLoading', true);
            const result = await supplierMS.getBillList(orgKeyN.value, startTime.value, endTime.value, status.value.join(','), approvalStatus.value, page.value, limit.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let gcNumber = 0, volumeNumber = 0, billNo = 0;
                tbody.value = result.result.list.map((ele) => {
                    billNo = billNo + 1;
                    gcNumber = ele.gcNumber + gcNumber;
                    volumeNumber = ele.volumeNumber + volumeNumber;
                    imgNumberO.value = imgNumberO.value + ele.totalImgNumber;
                    amountO.value = amountO.value + ele.totalAmount;
                    ele.paidInAmountO = '$'+thousands(ele.totalAmount + (ele.deductionAmount || 0));
                    ele.organizationNo = ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '';
                    ele.createTime = ele.createTime ? getLocalTime(ele.createTime, '-', 1) : '';
                    ele.totalAmountO = ele.totalAmount ? '$'+thousands(ele.totalAmount) : '';
                    ele.statusO = lan.value[statusO[ele.status]];
                    ele.approvalStatusO = ele.status >= 2 ? '' : ele.processError == 1 ? '' : lan.value['待']+ele.auUserName+lan.value['审批'];

                    ele.gcNumberT = thousands(ele.gcNumber);
                    ele.volumeNumberT = thousands(ele.volumeNumber);
                    ele.totalImgNumberT = thousands(ele.totalImgNumber);
                    return ele;
                });
                tbody.value.push({'orgName': '本页小计', 'billNo': billNo, 'gcNumber': gcNumber, 'volumeNumber': volumeNumber,'totalImgNumber': (imgNumberO.value || 0), 'totalAmountO': '$'+(amountO.value).toFixed(2)});
                pages.value = result.result.pageNum;
                total.value = result.result.total;

                f ? billTotal() : null;
            }
        }

        const billTotal = async () => {
            const result = await supplierMS.billTotal(orgKeyN.value, siteKey.value, startTime.value, endTime.value, approvalStatus.value, status.value.join(','));
            if(result.status == 200){
                let data = result.data;
                tbody.value.push({
                    'orgName': '汇总统计', 
                    'all': true, 
                    'billNo': data.billNumber, 
                    'gcNumberT': thousands(data.GCNumber), 
                    'volumeNumberT': thousands(data.volumeNumber), 
                    'totalImgNumberT': thousands(data.pagesTotal), 
                    'totalAmountO' : '$'+thousands(data.amountTotal)
                });
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
			    startTime.value = Date.now() - 1000*60*60*24*30*6;
			    endTime.value = Date.now();
			}
        });

        watch(orgKeyN, (nv, ov) => {
            orgList.value.forEach((ele) => {
                if(ele.value == nv){
                    orgName.value = nv ? ele.label : '';
                }
            });
        });

        const status = ref([]);
        const statusList = ref([
            // {'label': lan.value['全部发票状态'], 'value': ''}, 
            {'label': lan.value['待审批'], 'value': '0'}, 
            {'label': lan.value['审批中'], 'value': '1'}, 
            {'label': lan.value['已确认'], 'value': '2'}, 
            {'label': lan.value['已驳回'], 'value': '3'},
            {'label': lan.value['已付款'], 'value': '4'},
            {'label': lan.value['已收款'], 'value': '5'},
            {'label': lan.value['作废'], 'value': '6'}
        ]);
        
        const changePage = (i) => {
            page.value = i;
            getDataList(false);
        }

        const goRouter = (k) => {
            router.push('/takeCameraBillDetail?id='+k);
        }

        const approvalStatus = ref('');
        const approvalStatusList = ref([]);
        const getApprovalUser = async () => {
            const result = await supplierMS.getApprovalUser(siteKey.value);
            if(result.status == 200){
                approvalStatusList.value = result.data.map((ele) => {
                    if(userRole.value >= 1 && userRole.value <= 3){
                        if(ele.userKey == userKey.value){
                            approvalStatus.value = ele._key;
                        }
                    }
                    ele.label = ele.nodeName;
                    ele.value = ele._key;
                    return ele;
                });
                approvalStatusList.value.unshift({'label': lan.value['全部审批状态'], 'value': ''});
                getDataList();
            }else{
                createMsg(result.msg);
            }
        }

        const handleRestoreBill = (data) => {
            if(confirm('确认要重置该发票吗？')){
                restoreBill(data._key, '发票审批流程变动，需要重置发票');
            }
        }

        // 重置发票
        const restoreBill = async (dataKey, approvalOpinion) => {
            const result = await supplierMS.restoreBill(dataKey, approvalOpinion, userKey.value, siteKey.value);
            if(result.status == 200){
                createMsg(lan.value['重置发票流程成功！'], true);
                getApprovalUser();
            }else{
                createMsg(result.msg);
            }
        }

        // 作废发票
        const isShow = ref(0);
        const detail = ref({'_key': ''});
        const handleVoidedInvoice = (data) => {
            isShow.value = 1;
            detail.value = data;
            // if(confirm(lan.value['您确认要作废该发票吗？'])){
            //     VoidedInvoice(data._key, '');
            // }
        }

        const VoidedInvoice = async (dataKey, memo) => {
            const result = await supplierMS.voidedBill(siteKey.value, userKey.value, dataKey, memo);
            if(result.status == 200){
                createMsg(lan.value['作废该发票成功！'], true);
                getApprovalUser();
            }else{
                createMsg(result.msg);
            }
        }

        // 已付款、已收款
        const handlePay = (data) => {
            detail.value = data;
            isShow.value = 2;
            return;
            if(confirm(lan.value['您确认要'+(data.status == 2 ? '已付款' : '已收款')+'吗？'])){
                payInvoice(data._key, '', data.status == 2 ? 1: 2);
            }
        }

        const payInvoice = async (dataKey, memo, type) => {
            const result = await supplierMS.paidBill(siteKey.value, userKey.value,  dataKey, memo, type);
            if(result.status == 200){
                getApprovalUser();
            }else{
                createMsg(result.msg);
            }
        }

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){

            }else{
                orgKeyN.value = orgKey.value;
                theadV.value = ['机构名称', '发票编号', '提交时间', '提交谱数', '卷数', '影像页数', '金额小计', '实付金额', '发票状态', '操作'];
                parameterV.value = ['orgName', 'billNo', 'createTime', 'gcNumberT', 'volumeNumberT', 'totalImgNumberT', 'totalAmountO', 'paidInAmountO', 'statusO', 'action'];
            }
            
            getApprovalUser();
            getOrgList();
        });

        return {
            theadV, parameterV, tbody, getDataList, time, orgList, orgKeyN, orgName, statusList, status, 
            changePage, page, pages, total, goRouter, approvalStatus, approvalStatusList, userRole, lan, sidebarW, 
            imgNumberO, amountO, handleRestoreBill, admin, handleVoidedInvoice, handlePay, isShow, detail, getApprovalUser, 
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
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .head-right{
        display: flex;
        align-items: center;
    }
}
.pages-content{
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
                .qingtime-check-box{
                    background: #358acd;
                }
            }
            &.red{
                color: #f00;
            }
            &.active2{
                position: sticky;
                bottom: 0;
                background: #DBE6CC;
                font-weight: bold;
            }
            td{
                padding: 15px 0;
                min-width: 80px;
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
        width: auto;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        background: #358acd;
        color: #fff;
        outline: none;
        border: none;
        cursor: pointer;
        border-radius: 3px;
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
.qingtime-check-box{
    position: relative;
    width: 18px;
    height: 18px;
    border: 1px solid #358acd;
    border-radius: 3px;
    display: block;
    cursor: pointer;
    &.active{
        background: #358acd;
    }
}
@media screen  and (max-width: 799px){
    .pages-wrap{
        width: 100% !important;
    }
    .pages-head{
        overflow-y: auto;
    }
}
</style>