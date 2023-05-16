<template>
    <div class="edit-wrap">
        <div class="edit-box">
            <div class="edit-head">
                <h3 class="title">{{lan['卷册状态修改']}}</h3>
            </div>
            <div class="log">{{lan['当前卷册']}}: {{detail.genealogyName}} {{detail.volumeNumber}}</div>
            <div class="log">{{lan['卷ID']}}: {{detail.volumeKey}}</div>
            <ul class="edit-content">
				<li>
				    <span class="label">{{lan['电子谱']}}</span>
					<el-radio-group v-model="isLeadImages">
                        <el-radio :label="0">{{lan['否']}}</el-radio>
                        <el-radio :label="1">{{lan['是']}}</el-radio>
                    </el-radio-group>
				</li>
                <li>
                    <span class="label">{{lan['单双拍']}}</span>
                    <el-radio-group v-model="singleOrTwo">
                        <el-radio :label="1">{{lan['单拍']}}</el-radio>
                        <el-radio :label="2">{{lan['双拍']}}</el-radio>
                    </el-radio-group>
                </li>
				<li v-if="settlementStatus == 'toBeSettled' || settlementStatus == 'nonSettlement'">
				    <span class="label">{{lan['结算状态']}}</span>
				    <el-radio-group v-model="settlementStatus">
                        <el-radio :label="'toBeSettled'">{{lan['待结算']}}</el-radio>
                        <el-radio :label="'nonSettlement'">{{lan['不可结算']}}</el-radio>
                    </el-radio-group>
				</li>
            </ul>
            <div class="edit-foot">
                <el-button @click="close">{{lan['取消']}}</el-button>
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
        const { userKey, siteKey, code, drive, device, lan, orgKey } = toRefs(useState());
        const router = useRouter();

        const singleOrTwo = ref(1);
        const isLeadImages = ref(0);
        const settlementStatus = ref('toBeSettled');

        onMounted(() => {
            singleOrTwo.value = props.detail.singleOrTwo || 1;
            isLeadImages.value = props.detail.isLeadImages || 0;
            settlementStatus.value = props.detail.settlementStatus ? props.detail.settlementStatus == 15 ? 'nonSettlement': props.detail.settlementStatus : 'toBeSettled';
            console.log(settlementStatus.value);
        });

        const updateVolume2Status = async () => {
            const result = await supplierMS.updateVolume2Status({
                singleOrTwo: singleOrTwo.value+'', 
                isLeadImages: isLeadImages.value+'', 
                settlementStatus: settlementStatus.value, 
                volumeKey: props.detail.volumeKey, 
                orgKey: orgKey.value, 
                userKey: userKey.value,
                siteKey: siteKey.value, 
            });
            if(result.status == 200){
                context.emit('save', true);
            }else{
                createMsg(result.msg);
            }
        }
		
        const close = () => {
            context.emit('close', false);
        }

        const save = () => {
            if(confirm('确认修改卷册内容？')){
                updateVolume2Status();
            }
        }

        return {
            close, save, lan, singleOrTwo, isLeadImages, settlementStatus, 
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
        .log{
            position: relative;
            height: 30px;
            display: flex;
            align-items: center;
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