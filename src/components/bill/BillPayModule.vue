<template>
    <div class="edit-wrap">
        <div class="edit-box">
            <div class="edit-head">
                <h3 class="title">{{lan[detail.status == 2 ? '付款确认' : '收款确认']}}</h3>
            </div>
            <ul class="edit-content">
				<li>
				    <span class="label">{{lan['备注']}}</span>
					<input type="text" v-model="memo" />
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
import { useState, changePropertyValue } from '../../store';
import { getQueryVariable, getLocalTime, createMsg } from '../../util/ADS';
import { supplierMS, org } from '../../util/api';
export default {
    components: {
        
    },
    props:{
        detail: Object,
    },
    name: 'BillPay',
    emits: ['close', 'save'],
    setup(props, context) {
        const { userKey, siteKey, code, drive, device, lan } = toRefs(useState());
        const router = useRouter();

        onMounted(() => {
            
        });

        const memo = ref('');

        const payInvoice = async () => {
            const result = await supplierMS.paidBill(siteKey.value, userKey.value,  props.detail._key, memo.value, props.detail.status == 2 ? 1: 2);
            if(result.status == 200){
                context.emit('save', true);
                close();
            }else{
                createMsg(result.msg);
            }
        }
		
        const close = () => {
            context.emit('close', false);
        }

        const save = () => {
            if(!memo.value){
                return createMsg('请填写备注');
            }
            if(confirm(lan.value['您确认要'+(props.detail.status == 2 ? '已付款' : '已收款')+'吗？'])){
                payInvoice();
            }
        }

        return {
            close, save, lan, memo,
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
                    width: 100px;
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