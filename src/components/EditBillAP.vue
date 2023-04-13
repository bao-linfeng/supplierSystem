<template>
    <div class="edit-wrap">
        <div class="edit-box">
            <div class="edit-head">
                <h3 class="title">{{detailO._key ? lan['编辑'] : lan['新增']}}</h3>
                <img class="close" @click="close" src="../assets/close.svg" alt="">
            </div>
            <ul class="edit-content">
				<li>
				    <span class="label">{{lan['审批序号']}}</span>
					<input type="text" v-model="detailO.approvalNo" />
				</li>
                <li>
                    <span class="label">{{lan['节点名称']}}</span>
                    <input type="text" v-model="detailO.nodeName" />
                </li>
                <li>
                    <span class="label">{{lan['发票最小金额']}}</span>
                    <input class="w100" type="text" v-model="detailO.amount" />
                    <span class="amount">$</span>
                </li>
				<li>
				    <span class="label">{{lan['审批人']}}</span>
                    <el-select v-model="detailO.userKey" :placeholder="lan['请选择审批人']">
                        <el-option
                            v-for="item in orgList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
				</li>
                <li>
				    <span class="label">{{lan['电子邮箱']}}</span>
				    <input type="text" v-model="detailO.email" />
				</li>
            </ul>
            <div class="edit-foot">
                <el-button type="primary" @click="save">{{lan['保存']}}</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg } from '../util/ADS';
import { supplierMS, org } from '../util/api';
export default {
    components: {
        
    },
    props:{
        detail: Object,
        n: Number,
    },
    emits: ['close'],
    setup(props, context) {
        const { userKey, siteKey, code, drive, device, lan } = toRefs(useState());
        const router = useRouter();

        const detailO = ref({'_key': '', 'approvalNo': '', 'nodeName': '', 'userKey': '', 'email': '', 'amount': 0});

        const orgList = ref([]);
        const siteRootAndAdminAndEdit = async () => {
            const result = await supplierMS.siteRootAndAdminAndEdit(siteKey.value);
            if(result.status == 200){
                let list = [];
                result.data.map((ele) => {
                    // ele.label = ele.userName;
                    // ele.value = ele.userKey;
                    // return ele;
                    if(ele.approvalUser == 1){
                        list.push({'label': ele.userName, 'value': ele.userKey});
                    }
                });
                orgList.value = list;
                orgList.value.unshift({'label': lan.value['全部人员'], 'value': ''});
            }
        }

        onMounted(() => {
            siteRootAndAdminAndEdit();
            detailO.value = {
                '_key': props.detail._key || '', 
                'approvalNo': props.detail.approvalNo || props.n+1, 
                'nodeName': props.detail.nodeName || '节点'+(props.n+1), 
                'userKey': props.detail.userKey || '', 
                'email': props.detail.email || '',
                'amount': props.detail.amount || 0
            };
        });
		
        const close = (f = 0) => {
            context.emit('close', f);
        }

        const save = () => {
            console.log(detailO.value);
            if(detailO.value._key){
                editApprovalUser(detailO.value._key);
            }else{
                if(confirm(lan.value['新增流程节点会导致审核中的发票状态异常，确认新增该条数据吗？'])){
                    addApprovalUser();
                }
            }
        }

        const addApprovalUser = async () => {
            const result = await supplierMS.addApprovalUser(siteKey.value, Number(detailO.value.approvalNo), detailO.value.nodeName, detailO.value.userKey, detailO.value.email, Number(detailO.value.amount));
            if(result.status == 200){
                close(2);
            }else{
                createMsg(result.msg);
            }
        }

        const editApprovalUser = async (dataKey) => {
            const result = await supplierMS.editApprovalUser(dataKey, {'approvalNo': Number(detailO.value.approvalNo), 'nodeName': detailO.value.nodeName, 'userKey': detailO.value.userKey, 'email': detailO.value.email, 'amount': Number(detailO.value.amount)});
            if(result.status == 200){
                close(2);
            }else{
                createMsg(result.msg);
            }
        }

        return {
            detailO, close, save, orgList, lan, 
        }
    }
}
</script>
<style lang="scss" scoped>
.edit-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    .edit-box{
        position: relative;
        padding: 20px;
        background: #fff;
        border-radius: 5px;
        .edit-head{
            position: relative;
            width: 100%;
            text-align: center;
            .close{
                position: absolute;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                background: #000;
                cursor: pointer;
            }
        }
        .edit-content{
            margin-top: 20px;
            li{
                margin-bottom: 20px;
                display: flex;
                align-items: center;
				input{
					width: 212px;
                    &.w100{
                        width: 102px;
                    }
				}
                .label{
                    width: 160px;
                }
                .amount{
                    width: 100px;
                    margin-left: 10px;
                }
            }
        }
        .edit-foot{
            display: flex;
            justify-content: center;
        }
    }
}
</style>