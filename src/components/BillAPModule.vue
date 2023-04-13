<template>
    <div class="module-wrap">
        <div class="module-box">
            <div class="module-head">
                <h3 class="title">{{lan['发票审批']}}</h3>
                <img class="close" @click="close(0)" src="../assets/close.svg" alt="">
            </div>
            <div class="module-content">
                <div class="content-left">
                    <h3 class="title">{{lan['发票信息概要']}}</h3>
                    <div class="bill-box">
                        <p>{{lan['发票编码']}}: {{detail.billNo}}</p>
                        <p>{{lan['所属机构']}}: {{detail.orgName}}</p>
                        <p>{{lan['影像页数']}}: {{detail.totalImgNumber}}</p>
                        <p>{{lan['合计金额']}}: ${{detail.totalAmount}}</p>
                    </div>
                    <h3 class="title">{{lan['审批意见']}}</h3>
                    <textarea class="approve-idea" v-model="approvalOpinion" :disabled="isShow"></textarea>
                    <div class="btn-box">
                        <el-button type="success" @click="approvalBill(1)" :disabled="isShow">{{lan['同意']}}</el-button>
                        <el-button type="danger" @click="approvalBill(2)" :disabled="isShow">{{lan['驳回']}}</el-button>
                        <el-button @click="close(0)">{{lan['取消']}}</el-button>
                    </div>
                </div>
                <div class="content-right">
                    <h3 class="title">{{lan['审批流程']}}</h3>
                    <div class="approve-process-wrap">
                        <h4>{{lan['提交申请']}}</h4>
                        <img class="step" src="../assets/step.svg" alt="" />
                        <div class="approve-process-box" :class="{red: item.waitApproval == 1 || item.waitApproval == 3, green: item.waitApproval == 2}" v-for="(item, index) in approvalUserList" :key="index">
                            <p class="info">{{item.nodeName}}: {{item.userName}} {{item.waitApproval === 0 ? lan['待审批'] : item.waitApproval == 1 ? lan['审批中'] : item.waitApproval == 2 ? lan['已于']+item.approvalTimeO+lan['审批通过']+'('+item.approvalOpinion+')' : item.waitApproval == 3 ? lan['已于']+item.approvalTimeO+lan['驳回']+'('+item.approvalOpinion+')' : ''}}</p>
                            <img class="step" src="../assets/step.svg" alt="" />
                        </div>
                        <h4>{{lan['流程结束']}}</h4>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { useState, changePropertyValue } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { supplierMS } from '../util/api';
import { getQueryVariable, getLocalTime, createMsg } from '../util/ADS';

export default {
    components: {
        
    },
    props: {
        dataKey: String,
    },
    emits: ['close', 'save'],
    name: 'billAPModule',
    setup(props, context) {
        const { baseURL, userKey, siteKey, lan } = toRefs(useState());
        const router = useRouter();

        const detail = ref({});
        const approvalOpinion = ref('');
        const approvalUserList = ref([]);
        const isShow = ref(true);

        const billApprovalProcess = async () => {
            changePropertyValue('isLoading', true);
            const result = await supplierMS.billApprovalProcess(props.dataKey, userKey.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                detail.value = result.data;
                approvalUserList.value = result.data.approvalUserList.map((ele) => {
                    if(ele.userKey == userKey.value && ele.waitApproval == 1){
                        isShow.value = false;
                    }
                    ele.approvalTimeO = ele.approvalTime ? getLocalTime(ele.approvalTime) : '';
                    return ele;
                });
            }else{
                createMsg(result.msg);
            }
        }

        const approvalBill = async (s) => {
            if(isShow.value){
                return;
            }
            if(!approvalOpinion.value){
                return createMsg('请填写审批意见！');
            }
            changePropertyValue('isLoading', true);
            const result = await supplierMS.approvalBill(props.dataKey, userKey.value, siteKey.value, s, approvalOpinion.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                close(1);
            }else{
                createMsg(result.msg);
            }
        }

        const close = (f = 0) => {
            context.emit('close', f);
        }

        const save = () => {
            context.emit('save', '');
        }

        onMounted(() => {
            billApprovalProcess();
        });

        return {
            close, save, approvalUserList, approvalOpinion, detail, approvalBill, isShow, lan, 
        }
    }
}
</script>
<style lang="scss" scoped>
.module-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}
.module-box{
    position: relative;
    padding: 0 50px;
    background: #fff;
    border-radius: 5px;
    min-width: 400px;
    min-height: 300px;
}
.module-head{
    position: relative;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 5px solid #ddd;
    .close{
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        background: #000;
        cursor: pointer;
    }
}
.module-content{
    position: relative;
    display: flex;
    padding-bottom: 30px;
    .content-left{
        position: relative;
        width: 460px;
        padding: 0 20px;
        .approve-idea{
            position: relative;
            width: calc(100% - 22px);
            height: 100px;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
            outline: none;
        }
        .btn-box{
            height: 40px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-top: 20px;
        }
    }
    .content-right{
        position: relative;
        width: 260px;
        padding: 0 20px;
        &::after{
            position: absolute;
            top: 20px;
            left: 0;
            content: '';
            width: 5px;
            height: calc(100% - 40px);
            background: #ddd;
        }
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
}
.title{
    height: 60px;
    line-height: 60px;
}
@media screen  and (max-width: 799px){
    .module-box{
        padding: 0 10px;
    }
    .module-content{
        .content-left{
            padding: 0 10px 0 0;
        }
        .content-right{
            padding: 0 10px;
        }
    }
}
</style>