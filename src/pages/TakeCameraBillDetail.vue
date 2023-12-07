<template>
    <div class="pages-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="pages-head">
            <h3>{{lan['发票详情']}}</h3>
            <div class="head-right">
                <span class="check-status">{{lan['当前状态']}}: {{BillDetail.statusO}}</span>
                <el-button v-if="(userRole >= 1 && userRole <= 3)" type="primary" @click="openModule">{{BillDetail.status >= 2 ? lan['查看'] : lan['点击审批']}}</el-button>
                <el-button class="hide" type="primary" @click="openBill">{{lan['打印']}}</el-button>
                <!-- <el-button type="primary">{{lan['导出PDF文件']}}</el-button> -->
            </div>
        </div>
        <div class="pages-content">
            <div class="bill-wrap">
                <div class="bill-box w50">
                    <label class="label" for="">{{lan['客户名称']}}：</label>
                    <input class="input" type="text" v-model="customName" disabled placeholder="请输入客户名称" />
                </div>
                <div class="bill-box w25">
                    <label class="label" for="">{{lan['发票编号']}}：</label>
                    <input class="input" type="text" v-model="BillDetail.billNo" disabled placeholder="请输入发票编号" />
                </div>
                <div class="bill-box w25">
                    <label class="label" for="">{{lan['生成日期']}}：</label>
                    <input class="input" type="text" v-model="BillDetail.createTimeO" disabled placeholder="请输入发票编号" />
                </div>
                <div class="bill-box w50">
                    <label class="label" for="">{{lan['收款人']}}：</label>
                    <textarea class="textarea h20" type="text" v-model="BillDetail.payee" disabled placeholder="请输入收款人名称"></textarea>
                    <!-- <input class="input" type="text" v-model="BillDetail.payee" disabled placeholder="请输入收款人名称" /> -->
                </div>
                <div class="bill-box w50">
                    <label class="label" for="">{{lan['收款人地址']}}：</label>
                    <textarea class="textarea h30" type="text" v-model="BillDetail.receivingAddress" disabled placeholder="请输入收款人地址"></textarea>
                    <!-- <input class="input" type="text" v-model="BillDetail.receivingAddress" disabled placeholder="请输入收款人地址" /> -->
                </div>
                <div class="bill-box">
                    <label class="label" for="">{{lan['银行账号']}}：</label>
                    <textarea class="textarea" type="text" v-model="BillDetail.bank" disabled placeholder="请输入银行账号"></textarea>
                </div>
            </div>
        </div>
        <div class="title-wrap">
            <div class="title-box" :class="{active: title == item.value}" v-for="(item, index) in titleList" :key="index" @click="changeTitle(item)">{{lan[item.label]}}</div>
        </div>
        <div class="pages-foot style1">
            <table v-if="title == 1" class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV2" :key="'thead_'+index">{{lan[item]}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in summaryInfo" :key="'tbody_'+index" :class="{active: false}">
                        <td v-for="(item2, index2) in parameterV2" :key="'parameter_'+index2">
                            <div class="action" v-if="item2 === 'action'">
                                <button class="btn" @click="openDetail(item)">{{lan['查看详情']}}</button>
                            </div>
                            <i v-else>{{item[item2]}}</i>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table v-if="title == 2" class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV" :key="'thead_'+index">{{lan[item]}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index" :class="{active: false}">
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
                            <div class="action" v-if="item2 === 'action'">
                                <button class="btn">{{lan['查看详情']}}</button>
                            </div>
                            <i v-else>{{item[item2]}}</i>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="amount-box">
            <span>{{lan['金额合计']}}</span>
            <span>${{BillDetail.totalAmountO}}</span>
        </div>
        <!-- 分页 -->
        <!-- <PaginationModule :defaultPage="page" :pages="pages" :total="total" v-on:change-page="changePage" /> -->
        <!-- 审核流程 -->
        <BillAPModule v-if="isShow == 1" :dataKey="dataKey" v-on:close="closeModule" />
        <!-- 周统计详情 -->
        <BillDetail v-if="isShow == 2" :dataDetail="tbody" v-on:close="isShow = 0" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';
import BillAPModule from '../components/BillAPModule.vue';
import BillDetail from '../components/BillDetail.vue';

export default {
    components: {
        PaginationModule, 
        BillAPModule, 
        BillDetail, 
    },
    name: 'takeCameraBillDetail',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, lan, sidebarW } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV2 = ref(['ProjectID', '起止时间', '电子谱', '影像数', '金额小计', '操作']);
        const parameterV2 = ref(['ProjectID', 'time', 'isLeadImagesO','summaryImgNumberO','summaryAmountO', 'action']);

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(30);

        
        const BillDetail = ref({'createTimeO': '', 'billNo': '', 'payee': '', 'receivingAddress': '', 'statusO': '', 'ProjectID': '', 'bank': ''});
        const customName = ref('FamilySearch International (犹他家谱学会)');
        let statusO = {'0': '待审批', '1': '审批中', '2': '已确认', '3': '已驳回', '4': '已付款', '5': '已收款', '6': '已作废'};
        const summaryInfo = ref([]);
        const titleList = ref([{'label': '汇总数据', 'value': '1'}, {'label': '明细数据', 'value': '2'}]);
        const title = ref('1');

        const changeTitle = (data) => {
            title.value = data.value;
            if(data.value == 2){
                getBillDetailList(dataKey.value, '');
            }
        }

        const getBillDetail = async () => {
            changePropertyValue('isLoading', true);
            const result = await supplierMS.getBillDetail(dataKey.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                BillDetail.value = result.data;
                BillDetail.value.createTimeO = getLocalTime(result.data.createTime, '-', 1);
                BillDetail.value.statusO = lan.value[statusO[result.data.status]];
                BillDetail.value.totalAmountO = thousands(BillDetail.value.totalAmount);
                summaryInfo.value = result.data.summaryInfo.map((ele) => {
                    ele.ProjectID = BillDetail.value.ProjectID || '';
                    ele.time = ele.weekStart+'~'+ele.weekEnd;
                    ele.isLeadImagesO = ele.isLeadImages == 1 ? lan.value['是'] : lan['否'];
                    ele.summaryAmountO = '$'+thousands(ele.summaryAmount);
                    ele.summaryImgNumberO = thousands(ele.summaryImgNumber);
                    return ele;
                });
            }
        }

        const tbody = ref([]);
        const theadV = ref(['ProjectID', '拍机人', '谱ID', '谱名', '卷名', '影像数', '单价', '金额小计', '电子谱', '单双拍', '提交日期']);
        const parameterV = ref(['ProjectID', 'userName', 'gcKey', 'genealogyName', 'volumeNumber', 'imgNumberO', 'priceO', 'amountO', 'isLeadImagesO', 'singleOrTwoO', 'submitTimeO']);

        const getBillDetailList = async (billKey, summaryKey) => {
            tbody.value = [];
            changePropertyValue('isLoading', true);
            const result = await supplierMS.getBillDetailList(billKey, summaryKey);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.data.map((ele) => {
                    ele.ProjectID = BillDetail.value.ProjectID || '';
                    ele.passTimeO = ele.passTime ? getLocalTime(ele.passTime, '.', 1) : '';
                    ele.submitTimeO = ele.submitTime ? getLocalTime(ele.submitTime, '.', 1) : '';
                    ele.priceO = '$'+ele.price;
                    ele.amountO = '$'+thousands(ele.amount);
                    ele.isLeadImagesO = ele.isLeadImages == 1 ? lan.value['是'] : lan.value['否'];
                    ele.singleOrTwoO = ele.singleOrTwo == 1 ? lan.value['单拍'] : ele.singleOrTwo == 2 ? lan.value['双拍'] : '';
                    ele.imgNumberO = thousands(ele.imgNumber);
                    return ele;
                });
            }
        }

        const openDetail = (data) => {
            getBillDetailList('', data._key);
            isShow.value = 2;
        }

        const changePage = (i) => {
            page.value = i;
        }

        const isShow = ref(0);
        const dataKey = ref('');
        const closeModule = (data) => {
            isShow.value = 0;
            if(data){
                getBillDetail();
            }
        }

        const openModule = () => {
            isShow.value = 1;
        }

        onMounted(() => {
            dataKey.value = getQueryVariable('id');
            getBillDetail();
        });

        const openBill = () => {
            // router.push('bill?id='+dataKey.value);
            window.open('bill?id='+dataKey.value, '_blank');
        }

        return {
            theadV, parameterV, tbody, changePage, page, pages, total, isShow, dataKey, closeModule, openModule, BillDetail, 
            customName, userRole, lan, sidebarW, summaryInfo, titleList, title, changeTitle, theadV2, parameterV2, openDetail, 
            openBill, 
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
        .check-status{
            margin-right: 50px;
        }
    }
}
.pages-content{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    // height: 200px;
    margin-bottom: 10px;
    .bill-wrap{
        position: relative;
        border: 1px solid #ddd;
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        padding: 15px 15px 0 15px;
        .bill-box{
            position: relative;
            width: 100%;
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            .label{
                width: 100px;
            }
            .input{
                width: calc(100% - 100px);
            }
            .textarea{
                width: calc(100% - 110px);
                height: 100px;
                padding: 5px;
                border-radius: 5px;
                line-height: 20px;
                &.h30{
                    height: 60px;
                }
                &.h20{
                    height: 45px;
                }
            }
            &.w25{
                width: calc(25% - 10px);
            }
            &.w33{
                width: calc(33% - 10px);
            }
            &.w50{
                width: calc(50% - 10px);
            }
        }
    }
}
.title-wrap{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: 40px;
    display: flex;
    align-items: center;
    .title-box{
        position: relative;
        height: 100%;
        line-height: 40px;
        padding: 0 20px;
        cursor: pointer;
        font-weight: bold;
        &.active{
            color: #358acd;
            background: #ddd;
        }
    }
}
.pages-foot{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: calc(100% - 460px);
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
.amount-box{
    position: relative;
    width: calc(100% - 80px);
    padding: 0 20px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    font-size: 20px;
    height: 40px;
    border: 1px solid #ddd;
    background: #D1D1D1;
}
.marginR10{
    margin-right: 10px;
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
        width: calc(100% - 20px);
        padding: 0 10px;
        .head-right{
            display: flex;
            align-items: center;
            .check-status{
                margin-right: 10px;
            }
            .hide{
                display: none;
            }
        }
    }
    .pages-content{
        width: calc(100% - 20px);
        padding: 0 10px;
        .bill-wrap{
            position: relative;
            border: 1px solid #ddd;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            padding: 15px 15px 0 15px;
            .bill-box{
                position: relative;
                width: 100%;
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                .label{
                    width: 100px;
                }
                .input{
                    width: calc(100% - 100px);
                }
                .textarea{
                    width: calc(100% - 110px);
                    height: 100px;
                    padding: 5px;
                    border-radius: 5px;
                    line-height: 20px;
                    &.h30{
                        height: 60px;
                    }
                    &.h20{
                        height: 45px;
                    }
                }
                &.w25{
                    width: 100%;
                }
                &.w33{
                    width: 100%;
                }
                &.w50{
                    width: 100%;
                }
            }
        }
    }
    .pages-foot{
        height: auto;
        width: calc(100% - 20px);
        padding: 0 10px;
    }
    .amount-box{
        width: calc(100% - 40px);
        padding: 0 10px;
    }
}
</style>