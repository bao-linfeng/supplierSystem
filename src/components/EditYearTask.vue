<template>
    <div class="edit-wrap">
        <div class="edit-box">
            <div class="edit-head">
                <h3 class="title">{{detailO._key ? lan['编辑'] : lan['新增']}}</h3>
                <img class="close" @click="close" src="../assets/close.svg" alt="">
            </div>
            <ul class="edit-content">
				<li>
				    <span class="label">{{lan['年度']}}</span>
					<input type="text" v-model="detailO.year" />
				</li>
                <li>
                    <span class="label">{{lan['机构名称']}}</span>
                    <el-select v-model="detailO.orgKey" :placeholder="lan['请选择机构']">
                        <el-option
                            v-for="item in orgList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </li>
				<li>
				    <span class="label">{{lan['总拍数']}}</span>
				    <input type="text" v-model="detailO.taskNumber" />
				</li>
                <li>
				    <span class="label">{{lan['年度预算']}}</span>
				    <input type="text" v-model="detailO.annualBudget" />
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
    },
    emits: ['close'],
    setup(props, context) {
        const { userKey, siteKey, code, drive, device, lan } = toRefs(useState());
        const router = useRouter();

        const detailO = ref({'_key': '', 'year': '', 'orgKey': '', 'taskNumber': '', 'annualBudget': ''});

        const orgList = ref([]);
        const getOrgList = async () => {
            const result = await org.getOrgList(siteKey.value, '');
            if(result.status == 200){
                orgList.value = result.data.map((ele) => {
                    ele.label = ele.organizationNo;
                    ele.value = ele._key;
                    return ele;
                });
                orgList.value.unshift({'label': lan.value['全部机构'], 'value': ''});
            }
        }

        onMounted(() => {
            getOrgList();
            detailO.value = {
                '_key': props.detail._key || '', 
                'year': props.detail.year || new Date().getFullYear(), 
                'orgKey': props.detail.orgKey || '', 
                'taskNumber': props.detail.taskNumber || '',
                'annualBudget': props.detail.annualBudget || '',
            };
        });
		
        const close = (f = 0) => {
            context.emit('close', f);
        }

        const save = () => {
            if(!detailO.value.orgKey){
                return createMsg('请选择机构');
            }
            if(!detailO.value.taskNumber){
                return createMsg('总拍数必填');
            }
            console.log(detailO.value);
            if(detailO.value._key){
                editOrgTask(detailO.value._key);
            }else{
                addOrgTask();
            }
        }

        const addOrgTask = async () => {
            // Number(
            const result = await supplierMS.addOrgTask(Number(detailO.value.year), detailO.value.orgKey, Number(detailO.value.taskNumber), Number(detailO.value.annualBudget));
            if(result.status == 200){
                close(2);
            }else{
                
            }
        }

        const editOrgTask = async (taskKey) => {
            const result = await supplierMS.editOrgTask(taskKey, {'year': Number(detailO.value.year), 'orgKey': detailO.value.orgKey, 'taskNumber': Number(detailO.value.taskNumber), 'annualBudget': Number(detailO.value.annualBudget)});
            if(result.status == 200){
                close(2);
            }else{
                
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
				}
                .label{
                    width: 160px;
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