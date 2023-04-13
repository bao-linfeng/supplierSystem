<template>
    <div class="edit-wrap">
        <div class="edit-box">
            <div class="edit-head">
                <h3 class="title">{{detailO._key ? lan['编辑'] : lan['新增']}}</h3>
                <img class="close" @click="close" src="../assets/close.svg" alt="">
            </div>
            <ul class="edit-content style1">
				<li>
                    <div class="label-box">
                        <span class="label">{{lan['收款人']}}:</span>
                    </div>
                    <textarea v-model="detailO.payee"></textarea>
				</li>
                <li>
                    <div class="label-box">
                        <span class="label">{{lan['收款账号']}}:</span>
                    </div>
                    <input type="text" v-model="detailO.accountNumber" />
                </li>
				<li>
                    <div class="label-box">
                        <span class="label">{{lan['收款地址']}}:</span>
                    </div>
                    <textarea v-model="detailO.receivingAddress"></textarea>
				</li>
                <li>
                    <div class="label-box">
                        <span class="label">{{lan['联系人']}}:</span>
                    </div>
				    <input type="text" v-model="detailO.contactorName" />
				</li>
                <li>
                    <div class="label-box">
                        <span class="label">{{lan['联系电话']}}:</span>
                    </div>
				    <input type="text" v-model="detailO.contactTel" />
				</li>
                <li>
                    <div class="label-box">
                        <span class="label">{{lan['电子邮箱']}}:</span>
                    </div>
				    <input type="text" v-model="detailO.email" />
				</li>
                <li>
                    <div class="label-box">
                        <span class="label">ProjectID:</span>
                    </div>
				    <input type="text" v-model="detailO.ProjectID" />
				</li>
                <li>
                    <div class="label-box">
                        <span class="label">{{lan['备注']}}:</span>
                    </div>
                    <textarea v-model="detailO.memo"></textarea>
				</li>
                <li>
                    <div class="label-box">
                        <span class="label">{{lan['银行信息']}}:</span>
                    </div>
                    <textarea class="H100" v-model="detailO.bank"></textarea>
				</li>
            </ul>
            <div class="edit-foot">
                <el-button type="primary" @click="save">{{lan['保存/修改']}}</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime } from '../util/ADS';
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

        const detailO = ref({
            '_key': '', 'payee': '', 
            'email': '', 
            'accountNumber': '', 
            'receivingAddress': '', 
            'contactorName': '', 
            'contactTel': '', 
            'memo': '',
            'bank': '',
            'ProjectID': 'ProjectID',
        });

        onMounted(() => {
            detailO.value = {
                '_key': props.detail._key || '', 
                'payee': props.detail.payee || '', 
                'email': props.detail.email || '', 
                'accountNumber': props.detail.accountNumber || '', 
                'receivingAddress': props.detail.receivingAddress || '', 
                'contactorName': props.detail.contactorName || '', 
                'contactTel': props.detail.contactTel || '',
                'memo': props.detail.memo || '',
                'bank': props.detail.bank || '',
                'ProjectID': props.detail.ProjectID || '',
            };
        });
		
        const close = (f = 0) => {
            context.emit('close', f);
        }

        const save = () => {
            console.log(detailO.value);
            if(detailO.value._key){
                editOrg(detailO.value._key);
            }else{
                
            }
        }

        const editOrg = async (orgKey) => {
            const result = await org.patchOrg(orgKey, {
                'payee': detailO.value.payee, 
                'email': detailO.value.email, 
                'accountNumber': detailO.value.accountNumber, 
                'receivingAddress': detailO.value.receivingAddress, 
                'contactorName': detailO.value.contactorName, 
                'contactTel': detailO.value.contactTel,
                'memo': detailO.value.memo,
                'bank': detailO.value.bank || '',
                'ProjectID': detailO.value.ProjectID || '',
            });
            if(result.status == 200){
                close(2);
            }else{
                
            }
        }

        return {
            detailO, close, save, lan, 
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
        padding: 20px 50px;
        background: #fff;
        border-radius: 5px;
        height: calc(100% - 100px);
        .edit-head{
            position: relative;
            width: 100%;
            height: 40px;
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
            position: relative;
            height: calc(100% - 80px);
            overflow-y: auto;
            li{
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                .label-box{
                    position: relative;
                    display: flex;
                    flex-wrap: wrap;
                    width: 150px;
                }
				input{
					width: 600px;
				}
                textarea{
                    width: 578px;
                    height: 50px;
                    outline: none;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                }
                .label{
                    width: 100%;
                    display: block;
                }
            }
        }
        .edit-foot{
            height: 40px;
            display: flex;
            justify-content: center;
        }
    }
}
.H100{
    height: 90px !important;
}
</style>