<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <h3>{{lan['机构列表']}}</h3>
            <div class="head-right" v-if="userRole >= 1 && userRole <= 3">
                <el-select v-model="orgKey" class="org-select" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getOrgList(true)">{{lan['检索']}}</el-button>
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
                                <button class="btn" @click="openData(item)">{{lan['查看详情']}}</button>
                            </div>
                            <i v-else>{{item[item2]}}</i>
                            <!-- <i v-else>{{item2 == 'name' ? lan[item[item2]] : item[item2]}}</i> -->
                        </td>
                    </tr>
                    <tr v-if="!tbody.length">
                        <td :colspan="parameterV.length">{{lan['暂无数据']}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- <PaginationModule :defaultPage="page" :pages="pages" :total="total" v-on:change-page="changePage" /> -->
        <EditOrg v-if="isShow == 1" :detail="detail" v-on:close="saveData" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';
import EditOrg from '../components/EditOrg.vue';

export default {
    components: {
        PaginationModule, EditOrg, 
    },
    name: 'orgList',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgName, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(30);

        const theadV = ref(['机构名称', '所属类别', '团队人数', '收款人', '收款账号', '收款地址', '联系人', '联系电话', '电子邮箱', '操作']);
        const parameterV = ref(['name', 'type', 'memberCount', 'payee', 'accountNumber', 'receivingAddress', 'contactorName', 'contactTel', 'email', 'action']);
        const tbody = ref([]);

        const orgList = ref([]);
        const name = ref('');
        const orgKey = ref('');
        const detail = ref({});
        const isShow = ref(0);
        const getOrgList = async (f = false) => {
            if(f){
                if(orgKey.value){
                    orgList.value.forEach((ele) => {
                        if(ele.value == orgKey.value){
                            name.value = ele.label;
                        }
                    });
                }else{
                    name.value = '';
                }
            }
            const result = await org.getOrgList(siteKey.value, name.value);
            if(result.status == 200){
                if(f){
                    tbody.value = result.data.map((ele) => {
                        ele.type = lan.value['拍机机构'];
                        ele.name = lanType.value == 'en' ? ele.englishName : ele.name;
                        return ele;
                    });
                }else{
                    orgList.value = result.data.map((ele) => {
                        ele.label = lanType.value == 'en' ? ele.organizationNo : ele.name;
                        ele.value = ele._key;
                        return ele;
                    });
                    orgList.value.unshift({'label': lan.value['全部机构'], 'value': ''});
                    tbody.value = result.data.map((ele) => {
                        ele.type = lan.value['拍机机构'];
                        ele.name = lanType.value == 'en' ? ele.englishName : ele.name;
                        return ele;
                    });
                }
            }
        }

        const changePage = (i) => {
            page.value = i;
        }

        const saveData = (f) => {
            isShow.value = 0;
            detail.value = {};
            if(f){
                getOrgList(userRole.value >= 1 && userRole.value <= 3 ? true : false);
            }
        }

        const openData = (data) => {
            isShow.value = 1;
            detail.value = data;
        }

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){

            }else{
                name.value = orgName.value;
            }
            getOrgList();
        });

        return {
            page, pages, total, theadV, parameterV, tbody, getOrgList, userRole,
            changePage, orgList, orgKey, detail, isShow, saveData, openData, lan, sidebarW, 
        }
    }
}
</script>

<style lang="scss" scoped>
.contract-wrap{
    position: relative;
    width: calc(100% - 200px);
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
.marginR10{
    margin-right: 10px;
}
</style>