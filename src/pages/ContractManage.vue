<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <h3>{{lan['合同列表']}}</h3>
            <div class="head-right">
                <el-date-picker
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    :start-placeholder="lan['开始时间']"
                    :end-placeholder="lan['结束时间']"
                />
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="org-select" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
				<el-button type="primary" @click="getContractList">{{lan['检索']}}</el-button>
				<el-button type="primary" @click="changeContract(1)">{{lan['新增']}}</el-button>
            </div>
        </div>
        <div class="contract-content style1">
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV" :key="'thead_'+index">{{lan[item]}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index">
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
                            <div v-if="item2 === 'action'">
                                <button class="button btn marginR10" @click="changeContract(2, item)">{{lan['编辑']}}</button>
                                <button class="button btn marginR10" @click="changeContract(3, item)">{{lan['预览']}}</button>
                                <!-- <button class="button btn">{{lan['下载']}}</button> -->
                                <button class="button btn" @click="deleteContract(item._key)">{{lan['删除']}}</button>
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
        <ContractModule v-if="isEdit" :isEdit="isEdit" :source="source" v-on:close-contract="changeContract" v-on:save-contract="saveContract" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, getTodayZero } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';
import ContractModule from '../components/ContractModule.vue';

export default {
    components: {
        PaginationModule, ContractModule, 
    },
    name: 'contract',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const source = ref({});

        const orgList = ref([]);
        const orgKeyN = ref('');

        const startTime = ref(Date.now() - 1000*60*60*24*30*6);
        const endTime = ref(getTodayZero()+24*60*60*1000-1);
        const time = ref('');

        watch(time, (nv, ov) => {
            if(nv){
                startTime.value = new Date(nv[0]).getTime();
                endTime.value = new Date(nv[1]).getTime();
            }else{
                startTime.value = Date.now() - 1000*60*60*24*30*6;
                endTime.value = Date.now();
            }
            
        });

        const theadV = ref(['合同编号', '供应商序号', '合同标题', '合同金额', '签订时间', '截止时间', '合同概要', '附件', '创建时间', '操作']);
        const parameterV = ref(['contractNo', 'orgName', 'title', 'amountO', 'signingTimeO', 'endTimeO', 'content', 'enclosureO', 'createTimeO', 'action']);

        const getContractList = async () => {
			changePropertyValue('isLoading', true);
            const result = await supplierMS.getContractList(userKey.value, siteKey.value, orgKeyN.value, startTime.value, endTime.value, page.value , 30);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.data.list.map((ele) => {
                    ele.organizationNo = ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '';
                    ele.amountO = ele.amount ? (ele.currencySign || '')+ele.amount : '';
                    ele.signingTimeO = ele.signingTime ? getLocalTime(ele.signingTime, '-', 1) : '';
                    ele.endTimeO = ele.endTime ? getLocalTime(ele.endTime, '-', 1) : '';
                    ele.createTimeO = ele.createTime ? getLocalTime(ele.createTime) : '';
                    ele.enclosureO = ele.enclosure.map((ele) => {
                        return ele.originalName;
                    }).join(',');

                    return ele;
                });
                pages.value = result.data.pageNum;
                total.value = result.data.total;
            }
        }

        const changePage = (i) => {
            page.value = i;
            getContractList();
        }

        const tbody = ref([]);

        const isEdit = ref(0);
        const changeContract = (i, data = {}) => {
            isEdit.value = i;
            source.value = data;
        }

        const saveContract = (data) => {
            changeContract(0);
            if(data._key){
                editContract(data);
            }else{
                data['siteKey'] = siteKey.value;
                addContract(data);
            }
        }
        const addContract = async (data) => {
            const result = await supplierMS.addContract(data);
            if(result.status == 200){
                endTime.value = Date.now();
                getContractList();
            }
        }

        const editContract = async (data) => {
            const result = await supplierMS.editContract(data._key, siteKey.value, data);
            if(result.status == 200){
                getContractList();
            }
        }

        const deleteContract = async (contracKey) => {
            if(confirm(lan.value['是否删除该合同？'])){
                const result = await supplierMS.deleteContract(contracKey, siteKey.value);
                if(result.status == 200){
                    getContractList();
                }
            }
        }

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

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){

            }else{
                orgKeyN.value = orgKey.value;
            }
            getContractList();
            getOrgList();
        });

        return {
            page, pages, total, theadV, parameterV, tbody, isEdit, getContractList, userRole, orgKey, sidebarW, 
            changeContract, changePage, saveContract, source, deleteContract, time, orgList, orgKeyN, lan, 
        }
    }
}
</script>

<style lang="scss" scoped>
.contract-wrap{
    position: relative;
    width: calc(100% - 250px);
    height: 100%;
    color: #333;
}
.contract-head{
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
    .btn{
        padding: 0 10px;
        width: auto;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
    }
}
.contract-content{
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
            td{
                padding: 15px 0;
                min-width: 80px;
                border: 1px solid #ddd;
            }
        }
    }
    .btn{
        padding: 0 10px;
        width: auto;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
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
</style>