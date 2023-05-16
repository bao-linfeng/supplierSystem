<template>
    <div class="pages-wrap">
        <div class="pages-box" id="bill">
            <div class="pages-head">
                <h3>{{lan['拍机发票详情']}}</h3>
            </div>
            <div class="pages-content" id="BillDetail">
                <div class="bill-wrap">
                    <div class="bill-box w50">
                        <label class="label" for="">{{lan['客户名称']}}：</label>
                        <p class="p">{{customName}}</p>
                    </div>
                    <div class="bill-box w25">
                        <label class="label" for="">{{lan['发票编号']}}：</label>
                        <p class="p">{{BillDetail.billNo}}</p>
                    </div>
                    <div class="bill-box w25">
                        <label class="label" for="">{{lan['生成日期']}}：</label>
                        <p class="p">{{BillDetail.createTimeO}}</p>
                    </div>
                    <div class="bill-box w50">
                        <label class="label" for="">{{lan['收款人']}}：</label>
                        <div class="p-textarea">
                            <p v-for="(item, index) in BillDetail.payee.split('\n')" :key="index">{{item}}</p>
                        </div>
                    </div>
                    <div class="bill-box w50">
                        <label class="label" for="">{{lan['收款人地址']}}：</label>
                        <div class="p-textarea">
                            <p v-for="(item, index) in BillDetail.receivingAddress.split('\n')" :key="index">{{item}}</p>
                        </div>
                    </div>
                    <div class="bill-box">
                        <label class="label" for="">{{lan['银行账号']}}：</label>
                        <div class="p-textarea">
                            <p v-for="(item, index) in BillDetail.bank.split('\n')" :key="index">{{item}}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="pages-foot">
                <h3 class="title">{{lan['汇总数据']}}</h3>
                <table class="table">
                    <thead class="thead">
                        <tr>
                            <th v-for="(item, index) in theadV2" :key="'thead_'+index">{{lan[item]}}</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(item, index) in summaryInfo" :key="'tbody_'+index" :class="{active: false, bold: item.heji}">
                            <td v-for="(item2, index2) in parameterV2" :key="'parameter_'+index2">
                                <div class="action" v-if="item2 === 'action'">
                                    
                                </div>
                                <i v-else>{{item[item2]}}</i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="pages-foot">
                <h3 class="title marginT50">{{lan['审批记录']}}</h3>
                <table class="table">
                    <thead class="thead">
                        <tr>
                            <th v-for="(item, index) in theadV3" :key="'thead_'+index">{{lan[item]}}</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(item, index) in approvalUserList" :key="'tbody_'+index" :class="{active: false}">
                            <td v-for="(item2, index2) in parameterV3" :key="'parameter_'+index2">
                                <div class="action" v-if="item2 === 'action'">
                                    
                                </div>
                                <i v-else>{{item[item2]}}</i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="pages-foot">
                <h3 class="title marginT50">{{lan['明细数据']}}</h3>
                <table class="table">
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
            <div class="sign-box">
                <label class="label">{{lan['签字(盖章)']}}:</label>
                <span class="sign"></span>
            </div>
        </div>
        <el-button class="pdf" type="primary" @click="initPDF">{{lan['下载PDF']}}</el-button>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, convert2canvas, createMsg } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';
import BillAPModule from '../components/BillAPModule.vue';
import BillDetail from '../components/BillDetail.vue';
// import { jsPDF } from "jspdf";
// import autoTable from 'jspdf-autotable';
// import 'jsPDF-autotable';
import '../util/simkai-normal.js';

export default {
    components: {
        PaginationModule, BillAPModule, BillDetail, 
    },
    name: 'bill',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, lan, sidebarW } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV2 = ref(['ProjectID', '起止时间', '影像数', '金额小计']);
        const parameterV2 = ref(['ProjectID', 'time', 'summaryImgNumber','summaryAmountO']);
        
        const BillDetail = ref({'createTimeO': '', 'billNo': '', 'payee': '', 'receivingAddress': '', 'statusO': '', 'bank': '', 'ProjectID': ''});
        const customName = ref('FamilySearch International (犹他家谱学会)');
        const summaryInfo = ref([]);
        const totalNumber = ref(0);
        const totalAmout = ref(0);

        const getBillDetail = async () => {
            changePropertyValue('isLoading', true);
            const result = await supplierMS.getBillDetail(dataKey.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                BillDetail.value = result.data;
                BillDetail.value.createTimeO = getLocalTime(result.data.createTime, '-', 1);
                summaryInfo.value = result.data.summaryInfo.map((ele) => {
                    // ele.ProjectID = BillDetail.value.ProjectID || '';
                    ele.time = ele.weekStart+'~'+ele.weekEnd;
                    ele.summaryAmountO = '$'+ele.summaryAmount;
                    totalNumber.value = totalNumber.value + ele.summaryImgNumber;
                    totalAmout.value = totalAmout.value + ele.summaryAmount;
                    return ele;
                });
                summaryInfo.value.push({'ProjectID': lan.value['合计'], 'time': '', 'heji': '1', 'summaryImgNumber': totalNumber.value, 'summaryAmountO': '$'+totalAmout.value.toFixed(2)});
            }
        }

        const tbody = ref([]);
        const theadV = ref(['ProjectID', '拍机人', '谱ID', '谱名', '卷名', '影像数', '单价', '金额小计', '电子谱', '单双拍', '提交日期']);
        const parameterV = ref(['ProjectID', 'userName', 'gcKey', 'genealogyName', 'volumeNumber', 'imgNumber', 'priceO', 'amountO', 'isLeadImagesO', 'singleOrTwoO', 'submitTimeO']);

        const getBillDetailList = async (billKey, summaryKey) => {
            tbody.value = [];
            changePropertyValue('isLoading', true);
            const result = await supplierMS.getBillDetailList(billKey, summaryKey);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let imgNumberT = 0, amountT = 0;
                tbody.value = result.data.map((ele) => {
                    // ele.ProjectID = BillDetail.value.ProjectID || '';
                    ele.passTimeO = ele.passTime ? getLocalTime(ele.passTime, '.', 1) : '';
                    ele.submitTimeO = ele.submitTime ? getLocalTime(ele.submitTime, '.', 1) : '';
                    ele.priceO = '$'+ele.price;
                    imgNumberT = imgNumberT + ele.imgNumber;
                    ele.amountO = '$'+ele.amount;
                    amountT = amountT + ele.amount;
                    ele.isLeadImagesO = ele.isLeadImages == 1 ? lan.value['是'] : lan.value['否'];
                    ele.singleOrTwoO = ele.singleOrTwo == 1 ? lan.value['单拍'] : ele.singleOrTwo == 2 ? lan.value['双拍'] : '';
                    return ele;
                });
                tbody.value.push({'ProjectID': '', 'imgNumberT': '', 'amountO': ''});
                tbody.value.push({'ProjectID': lan.value['合计'], 'imgNumber': imgNumberT, 'amountO': '$'+amountT.toFixed(2)});
            }
        }

        const dataKey = ref('');

        const loadImg = (e) => {
            console.log(e.target.width, e.target.height, e.target.naturalWidth, e.target.naturalHeight);
        }

        const initPDF = () => {
            // convert2canvas('#bill', (data, w, h) => {
            //     const doc = new jsPDF('orientation', 'px', [w/2, h/2]);
            //     doc.addImage(data, 'PNG', 0, 0, w/2, h/2);
            //     doc.save(BillDetail.value.billNo+"发票详情.pdf");
            // });

            let w = 794, h = 1123;// 794px*1123px
            let fontSize16 = 16, fontSize20 = 20, fontSize30 = 30;
            let margin10 = 10;
            // let jsPDF = window.jsPDF;
            const doc = new jspdf.jsPDF('orientation', 'px', [w, h]);
            // 设置中文字体
            doc.setFont("simkai");
            doc.setFontSize(20);// 设置文字大小,下一行起有效

            // 标题
            let Title = lan.value['拍机发票详情'];
            // const pageWidth = doc.getPageWidth(); // A4纸:595.28
            // const x1 = (pageWidth - doc.getTextWidth(Title)) / 2;
            // doc.text(Title, x1, 40);
            doc.autoTable({
                body: [],
                columns: [
                    {'header': Title, 'dataKey': 'Title'},
                ],
                styles: {//设置表格的字体，不然表格中文也乱码
                    fillColor: [255, 255, 255], font: 'simkai', textColor: [0, 0, 0], halign: 'center', fontSize: fontSize30,
                },
                margin: margin10, // 距离左右边的距离
            });

            // 发票详情
            doc.autoTable({
                body: [
                    ['', ''],
                    [lan.value['客户名称'], customName.value],
                    [lan.value['发票编号'], BillDetail.value.billNo],
                    [lan.value['生成日期'], BillDetail.value.createTimeO],
                    [lan.value['收款人'], BillDetail.value.payee],
                    [lan.value['收款人地址'], BillDetail.value.receivingAddress],
                    [lan.value['银行账号'], BillDetail.value.bank],
                ],
                styles: {//设置表格的字体，不然表格中文也乱码
                    fillColor: [255, 255, 255], font: 'simkai', textColor: [0, 0, 0], halign: 'left', fontSize: fontSize16,
                },
                margin: margin10, // 距离左右边的距离
            });

            // 汇总数据 table
            Title = lan.value['汇总数据'];
            doc.autoTable({
                body: [],
                columns: [
                    {'header': Title, 'dataKey': 'Title'},
                ],
                styles: {//设置表格的字体，不然表格中文也乱码
                    fillColor: [255, 255, 255], font: 'simkai', textColor: [0, 0, 0], halign: 'left', fontSize: fontSize20,
                },
                margin: margin10, // 距离左右边的距离
            });
            doc.autoTable({
                body: summaryInfo.value,
                columns: [
                    {'header': lan.value['ProjectID'], 'dataKey': 'ProjectID'},
                    {'header': lan.value['起止时间'], 'dataKey': 'time'},
                    {'header': lan.value['影像数'], 'dataKey': 'summaryImgNumber'},
                    {'header': lan.value['金额小计'], 'dataKey': 'summaryAmountO'}
                ],
                styles: {//设置表格的字体，不然表格中文也乱码
                    fillColor: [255, 255, 255], font: 'simkai', textColor: [0, 0, 0], halign: 'center', fontSize: fontSize16, lineWidth: 1,
                },
                margin: margin10, // 距离左右边的距离
            });
            
            // 审批记录 table
            Title = lan.value['审批记录'];
            doc.autoTable({
                body: [],
                columns: [
                    {'header': Title, 'dataKey': 'Title'},
                ],
                styles: {//设置表格的字体，不然表格中文也乱码
                    fillColor: [255, 255, 255], font: 'simkai', textColor: [0, 0, 0], halign: 'left', fontSize: fontSize20,
                },
                margin: margin10, // 距离左右边的距离
            });
            doc.autoTable({
                body: approvalUserList.value,
                columns: [
                    {'header': lan.value['序号'], 'dataKey': 'approvalNo'},
                    {'header': lan.value['审批人'], 'dataKey': 'userName'},
                    {'header': lan.value['审批结果'], 'dataKey': 'waitApprovalO'},
                    {'header': lan.value['审批时间'], 'dataKey': 'approvalTimeO'},
                ],
                styles: {//设置表格的字体，不然表格中文也乱码
                    fillColor: [255, 255, 255], font: 'simkai', textColor: [0, 0, 0], halign: 'center', fontSize: fontSize16, lineWidth: 1,
                },
                margin: margin10, // 距离左右边的距离
            });

            // 明细数据 table
            Title = lan.value['明细数据'];
            doc.autoTable({
                body: [],
                columns: [
                    {'header': Title, 'dataKey': 'Title'},
                ],
                styles: {//设置表格的字体，不然表格中文也乱码
                    fillColor: [255, 255, 255], font: 'simkai', textColor: [0, 0, 0], halign: 'left', fontSize: fontSize20,
                },
                margin: margin10, // 距离左右边的距离
            });
            doc.autoTable({
                body: tbody.value,
                columns: [
                    {'header': lan.value['ProjectID'], 'dataKey': 'ProjectID'},
                    {'header': lan.value['拍机人'], 'dataKey': 'userName'},
                    {'header': lan.value['谱ID'], 'dataKey': 'gcKey'},
                    {'header': lan.value['谱名'], 'dataKey': 'genealogyName'},
                    {'header': lan.value['卷名'], 'dataKey': 'volumeNumber'},
                    {'header': lan.value['影像数'], 'dataKey': 'imgNumber'},
                    {'header': lan.value['单价'], 'dataKey': 'priceO'},
                    {'header': lan.value['金额小计'], 'dataKey': 'amountO'},
                    {'header': lan.value['电子谱'], 'dataKey': 'isLeadImagesO'},
                    {'header': lan.value['单双拍'], 'dataKey': 'singleOrTwoO'},
                    {'header': lan.value['提交日期'], 'dataKey': 'submitTimeO'},
                ],
                styles: {//设置表格的字体，不然表格中文也乱码
                    fillColor: [255, 255, 255], font: 'simkai', textColor: [0, 0, 0], halign: 'center', fontSize: fontSize16, lineWidth: 1,
                },
                // theme: 'grid', // 主题
                margin: margin10, // 距离左右边的距离
            });

            // 签名
            Title = lan.value['签字(盖章)']+':';
            doc.autoTable({
                body: [],
                columns: [
                    {'header': Title, 'dataKey': 'Title'},
                    {'header': '', 'dataKey': 'Title2'},
                    {'header': '', 'dataKey': 'Title3'},
                ],
                styles: {//设置表格的字体，不然表格中文也乱码
                    fillColor: [255, 255, 255], font: 'simkai', textColor: [0, 0, 0], halign: 'right', fontSize: fontSize20,
                },
                margin: 10, // 距离左右边的距离
            });
            doc.save(BillDetail.value.billNo+"发票详情.pdf"); // will save the file in the current working directory
        }

        const detail = ref({});
        const approvalOpinion = ref('');
        const approvalUserList = ref([]);
        const isShow = ref(true);

        const billApprovalProcess = async () => {
            changePropertyValue('isLoading', true);
            const result = await supplierMS.billApprovalProcess(dataKey.value, userKey.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                detail.value = result.data;
                approvalUserList.value = result.data.approvalUserList.map((ele) => {
                    if(ele.userKey == userKey.value && ele.waitApproval == 1){
                        isShow.value = false;
                    }
                    ele.waitApprovalO = ele.waitApproval === 0 ? lan.value['待审批'] : ele.waitApproval === 1 ? lan.value['审批中'] : ele.waitApproval === 2 ? lan.value['审批通过'] : ele.waitApproval === 3 ? lan.value['已驳回'] : ''; 
                    ele.approvalTimeO = ele.approvalTime ? getLocalTime(ele.approvalTime, '-', 1) : '';
                    return ele;
                });
            }else{
                createMsg(result.msg);
            }
        }

        // 审批记录
        const theadV3 = ref(['序号', '审批人', '审批结果', '审批时间']);
        const parameterV3 = ref(['approvalNo', 'userName', 'waitApprovalO','approvalTimeO']);

        onMounted(() => {
            dataKey.value = getQueryVariable('id');
            getBillDetail();
            getBillDetailList(dataKey.value, '');
            billApprovalProcess();
        });

        return {
            dataKey, BillDetail, customName, userRole, lan, sidebarW, summaryInfo, theadV2, parameterV2, totalNumber, totalAmout, initPDF,
            theadV, parameterV, tbody, loadImg, approvalUserList, theadV3, parameterV3,
        }
    }
}
</script>

<style lang="scss" scoped>
.pages-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    color: #333;
    .pages-box{
        position: relative;
        // width: calc(100% - 40px);
        width: 1100px;
        padding: 0 20px 30px 20px;
        min-height: 100%;
        margin: 0 auto;
    }
}
.pages-head{
    position: relative;
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: center;
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
    width: 100%;
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
            .p{
                width: calc(100% - 100px);
            }
            .p-textarea{
                width: calc(100% - 120px);
                display: inline-block;
                background: #f1f1f1;
                padding: 8px 10px 10px 10px;
                border-radius: 5px;
            }
            .textarea{
                width: calc(100% - 110px);
                height: 100px;
                padding: 5px;
                border-radius: 5px;
                line-height: 20px;
                &.h30{
                    height: 85px;
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
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    .title-box{
        margin-right: 30px;
        cursor: pointer;
        font-weight: bold;
        &.active{
            color: #358acd;
        }
    }
}
.pages-foot{
    position: relative;
    width: 100%;
    // min-height: 100%;
    .title{
        height: 40px;
        line-height: 40px;
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
        top: 0;
        z-index: 2;
        tr{
            th{
                padding: 15px 0;
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
            &.active{
                .qingtime-check-box{
                    background: #358acd;
                }
            }
            &.bold{
                font-weight: bold;
            }
            td{
                padding: 15px 0;
                min-width: 80px;
                max-width: 200px;
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
.sign-box{
    position: relative;
    width: calc(100% - 80px);
    padding: 0 20px;
    height: 40px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    margin-top: 30px;
    .label{
        margin-right: 10px;
    }
    .sign{
        border-bottom: 1px solid #ddd;
        display: inline-block;
        height: 40px;
        width: 200px;
        margin-right: 20px;
    }
}
.pdf{
    position: fixed;
    top: 10px;
    right: 20px;
}
.marginT50{
    margin-top: 50px;
}
.approve-process-wrap{
    position: relative;
    .step{
        display: block;
        margin: 10px 0 10px 20px;
    }
    .approve-process-box{
        color: #999;
        &.red{
            color: #f56c6c;
        }
        &.green{
            color: #67c23a;
        }
    }
}
</style>