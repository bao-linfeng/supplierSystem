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
                    <span class="label">{{lan['单价']}}</span>
                    <input type="text" v-model="detailO.price" />
                </li>
                <li>
				    <span class="label">{{lan['单双拍']}}</span>
				    <el-radio v-model="detailO.singleOrTwo" label="1">{{lan['单拍']}}</el-radio>
                    <el-radio v-model="detailO.singleOrTwo" label="2">{{lan['双拍']}}</el-radio>
				</li>
				<li>
				    <span class="label">{{lan['电子谱']}}</span>
				    <el-radio v-model="detailO.isLeadImages" label="1">{{lan['是']}}</el-radio>
                    <el-radio v-model="detailO.isLeadImages" label="0">{{lan['否']}}</el-radio>
				</li>
                <li>
				    <span class="label">{{lan['机构']}}</span>
				    <el-select v-model="detailO.orgKey" :placeholder="lan['机构筛选']">
                        <el-option v-for="item in orgList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                    </el-select>
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

        const detailO = ref({'_key': '','year': '', 'price': '', 'isLeadImages': '0', 'singleOrTwo': '2', 'orgKey': ''});

        onMounted(() => {
            detailO.value = {
                '_key': props.detail._key || '', 
                'year': props.detail.year || new Date().getFullYear(), 
                'price': props.detail.price || '', 
                'isLeadImages': props.detail.isLeadImages || '0', 
                'singleOrTwo': props.detail.singleOrTwo || '2',
                'orgKey': props.detail.orgKey || '',
            };
            // orgKeyN.value = props.detail.orgKey || '';

            getOrgList();
        });
		
        const close = (f = 0) => {
            context.emit('close', f);
        }

        const save = () => {
            if(!detailO.value.price){
                return createMsg('单价必填');
            }
            console.log(detailO.value);
            if(detailO.value._key){
                editPrice(detailO.value._key);
            }else{
                addPrice();
            }
        }

        const addPrice = async () => {
            const result = await supplierMS.addPrice(Number(detailO.value.year), detailO.value.isLeadImages, detailO.value.singleOrTwo, Number(detailO.value.price), detailO.value.orgKey);
            if(result.status == 200){
                close(1);
            }else{
                
            }
        }

        const editPrice = async (priceKey) => {
            const result = await supplierMS.editPrice(priceKey, {
                'year': Number(detailO.value.year), 
                'isLeadImages': detailO.value.isLeadImages, 
                'singleOrTwo': detailO.value.singleOrTwo, 
                'price': Number(detailO.value.price), 
                'orgKey': detailO.value.orgKey,
            });
            if(result.status == 200){
                close(1);
            }else{
                
            }
        }

        const orgList = ref([]);
        const orgKeyN = ref('');
        const orgName = ref('');

        const getOrgList = async () => {
            const result = await org.getOrgList(siteKey.value, '');
            if(result.status == 200){
                orgList.value = result.data.map((ele) => {
                    ele.label = ele.name;
                    ele.value = ele._key;
                    return ele;
                });
                orgList.value.unshift({'label': '全部机构', 'value': ''});
            }
        }

        return {
            detailO, close, save, lan, orgList, orgKeyN,
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
					width: 200px;
				}
                .label{
                    width: 160px;
                    text-align: right;
                    margin-right: 20px;
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